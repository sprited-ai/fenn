/**
 * tenn — private portfolio dashboard for tenn.sprited.ai
 *
 * Routes:
 *   GET  /               dashboard (Cloudflare Access required)
 *   GET  /api/portfolio  latest payload JSON (Cloudflare Access required)
 *   GET  /api/history    daily total-value snapshots (Cloudflare Access required)
 *   POST /api/ingest     upload new payload (Bearer INGEST_TOKEN; called by GitHub Actions)
 *
 * Security model: every data route fails CLOSED. Dashboard/API require a valid
 * Cloudflare Access JWT; until ACCESS_TEAM_DOMAIN/ACCESS_AUD are configured the
 * worker serves a setup notice and no data. Ingest requires a bearer secret.
 */

export interface Env {
  TENN_KV: KVNamespace;
  EMAIL: SendEmail;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  EMAIL_TO: string;
  EMAIL_FROM: string;
  INGEST_TOKEN?: string;
}

interface SendEmail {
  send(msg: {
    to: string;
    from: { email: string; name?: string };
    subject: string;
    html?: string;
    text?: string;
  }): Promise<unknown>;
}

interface Position {
  symbol: string;
  description?: string;
  units: number;
  price: number | null;
  value: number;
  open_pnl: number | null;
  accounts: string[];
}

interface Payload {
  generated_at: string;
  total_value: number;
  total_open_pnl: number;
  accounts: { name: string; balance: number; positions_count: number }[];
  positions: Position[];
}

interface StoredDoc {
  payload: Payload;
  ingested_at: string;
  prev_total: number | null;
}

// ---------------------------------------------------------------------------
// Cloudflare Access JWT verification
// ---------------------------------------------------------------------------

let certCache: { keys: Record<string, CryptoKey>; fetched: number } | null = null;

function b64urlToBytes(s: string): Uint8Array {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const bin = atob(s + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function teamOrigin(env: Env): string | null {
  let d = (env.ACCESS_TEAM_DOMAIN || "").trim();
  if (!d) return null;
  if (!d.includes(".")) d = `${d}.cloudflareaccess.com`;
  if (!d.startsWith("http")) d = `https://${d}`;
  return d.replace(/\/$/, "");
}

async function getAccessKeys(origin: string): Promise<Record<string, CryptoKey>> {
  if (certCache && Date.now() - certCache.fetched < 3600_000) return certCache.keys;
  const res = await fetch(`${origin}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error(`certs fetch failed: ${res.status}`);
  const jwks = (await res.json()) as { keys: (JsonWebKey & { kid: string })[] };
  const keys: Record<string, CryptoKey> = {};
  for (const jwk of jwks.keys || []) {
    try {
      keys[jwk.kid] = await crypto.subtle.importKey(
        "jwk",
        jwk,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"],
      );
    } catch {
      // skip unsupported keys
    }
  }
  certCache = { keys, fetched: Date.now() };
  return keys;
}

async function verifyAccessJWT(request: Request, env: Env): Promise<boolean> {
  const origin = teamOrigin(env);
  const aud = (env.ACCESS_AUD || "").trim();
  if (!origin || !aud) return false; // fail closed until Access is configured

  let token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) {
    const cookie = request.headers.get("Cookie") || "";
    const m = cookie.match(/CF_Authorization=([^;]+)/);
    if (m) token = m[1];
  }
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  try {
    const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[0])));
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1])));

    const keys = await getAccessKeys(origin);
    const key = keys[header.kid];
    if (!key) return false;

    const ok = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      b64urlToBytes(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
    if (!ok) return false;

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== "number" || payload.exp < now) return false;
    if (payload.iss !== origin) return false;
    const audList: string[] = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!audList.includes(aud)) return false;
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const fmtUSDc = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const fmtSigned = (n: number) => (n >= 0 ? "+" : "") + fmtUSD(n);
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---------------------------------------------------------------------------
// Email report
// ---------------------------------------------------------------------------

function buildEmail(doc: StoredDoc): { subject: string; html: string; text: string } {
  const p = doc.payload;
  const delta = doc.prev_total == null ? null : p.total_value - doc.prev_total;
  const deltaStr =
    delta == null
      ? ""
      : ` (${fmtSigned(delta)}${doc.prev_total ? `, ${((delta / doc.prev_total) * 100).toFixed(2)}%` : ""} vs last sync)`;

  const top = p.positions.slice(0, 10);
  const rows = top
    .map(
      (pos) =>
        `<tr><td style="padding:4px 12px 4px 0"><strong>${esc(pos.symbol)}</strong></td>` +
        `<td style="padding:4px 12px 4px 0;text-align:right">${fmtUSD(pos.value)}</td>` +
        `<td style="padding:4px 0;text-align:right;color:${(pos.open_pnl ?? 0) >= 0 ? "#0a7d33" : "#c0392b"}">` +
        `${pos.open_pnl == null ? "—" : fmtSigned(pos.open_pnl)}</td></tr>`,
    )
    .join("");

  const accounts = p.accounts
    .filter((a) => a.balance > 0)
    .map((a) => `<li>${esc(a.name)}: <strong>${fmtUSD(a.balance)}</strong> (${a.positions_count} positions)</li>`)
    .join("");

  const subject = `tenn: ${fmtUSD(p.total_value)}${delta != null ? ` (${fmtSigned(delta)})` : ""}`;
  const html = `
    <div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:560px">
      <h2 style="margin:0 0 4px">Portfolio: ${fmtUSD(p.total_value)}</h2>
      <p style="margin:0 0 16px;color:#555">${deltaStr || "First sync"} · synced ${esc(doc.ingested_at)}</p>
      <h3 style="margin:16px 0 8px">Accounts</h3>
      <ul style="margin:0;padding-left:20px">${accounts}</ul>
      <h3 style="margin:16px 0 8px">Top holdings</h3>
      <table style="border-collapse:collapse;font-size:14px">
        <tr><th align="left" style="padding-right:12px">Symbol</th><th align="right" style="padding-right:12px">Value</th><th align="right">Open P&amp;L</th></tr>
        ${rows}
      </table>
      <p style="margin-top:16px"><a href="https://tenn.sprited.ai">Open dashboard →</a></p>
    </div>`;
  const text =
    `Portfolio: ${fmtUSD(p.total_value)}${deltaStr}\n\n` +
    p.accounts.filter((a) => a.balance > 0).map((a) => `- ${a.name}: ${fmtUSD(a.balance)}`).join("\n") +
    `\n\nTop holdings:\n` +
    top.map((pos) => `- ${pos.symbol}: ${fmtUSD(pos.value)}`).join("\n") +
    `\n\nhttps://tenn.sprited.ai`;
  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// Dashboard HTML (data fetched client-side from /api/portfolio)
// ---------------------------------------------------------------------------

const DASHBOARD_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>tenn · portfolio</title>
<style>
  :root { color-scheme: light dark;
    --bg:#f6f7f9; --card:#fff; --text:#16181d; --muted:#68707c; --line:#e4e7eb;
    --green:#0a7d33; --red:#c0392b; --accent:#2563eb; }
  @media (prefers-color-scheme: dark) { :root {
    --bg:#101318; --card:#181c23; --text:#e8eaee; --muted:#8b93a1; --line:#262c36;
    --green:#4ade80; --red:#f87171; --accent:#60a5fa; } }
  * { box-sizing:border-box }
  body { margin:0; font:15px/1.5 -apple-system,"Segoe UI",sans-serif; background:var(--bg); color:var(--text) }
  .wrap { max-width:1000px; margin:0 auto; padding:24px 16px 64px }
  h1 { font-size:18px; margin:0; letter-spacing:.02em }
  h1 span { color:var(--muted); font-weight:400 }
  .total { font-size:40px; font-weight:700; margin:16px 0 2px; font-variant-numeric:tabular-nums }
  .delta { font-size:15px; font-variant-numeric:tabular-nums }
  .muted { color:var(--muted) } .green { color:var(--green) } .red { color:var(--red) }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:10px; margin:20px 0 }
  .card { background:var(--card); border:1px solid var(--line); border-radius:10px; padding:12px 14px }
  .card .name { font-size:13px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
  .card .bal { font-size:19px; font-weight:600; margin-top:2px; font-variant-numeric:tabular-nums }
  .card .n { font-size:12px; color:var(--muted) }
  table { width:100%; border-collapse:collapse; background:var(--card); border:1px solid var(--line); border-radius:10px; overflow:hidden; font-variant-numeric:tabular-nums }
  th,td { padding:9px 12px; text-align:right; border-top:1px solid var(--line); font-size:14px }
  th { font-size:12px; text-transform:uppercase; letter-spacing:.05em; color:var(--muted); border-top:none }
  th:first-child, td:first-child { text-align:left }
  td .desc { display:block; font-size:12px; color:var(--muted); max-width:340px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
  .bar { height:3px; background:var(--accent); border-radius:2px; margin-top:4px; opacity:.6 }
  #spark { width:100%; height:60px; margin:8px 0 0 }
  section h2 { font-size:14px; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); margin:28px 0 10px }
</style>
</head>
<body>
<div class="wrap">
  <h1>tenn <span>· portfolio</span></h1>
  <div id="app" class="muted" style="margin-top:24px">Loading…</div>
</div>
<script>
const usd = n => n.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0});
const signed = n => (n>=0?"+":"") + usd(n);
async function main() {
  const app = document.getElementById("app");
  const [pRes, hRes] = await Promise.all([fetch("/api/portfolio"), fetch("/api/history")]);
  if (!pRes.ok) { app.textContent = "No data yet — waiting for first sync."; return; }
  const doc = await pRes.json();
  const hist = hRes.ok ? await hRes.json() : [];
  const p = doc.payload;
  const delta = doc.prev_total == null ? null : p.total_value - doc.prev_total;
  const maxVal = Math.max(...p.positions.map(x=>x.value), 1);
  let spark = "";
  if (hist.length > 1) {
    const vals = hist.map(h=>h.total);
    const min = Math.min(...vals), max = Math.max(...vals), range = (max-min)||1;
    const pts = vals.map((v,i)=>\`\${(i/(vals.length-1)*100).toFixed(2)},\${(56-(v-min)/range*52).toFixed(2)}\`).join(" ");
    spark = \`<svg id="spark" viewBox="0 0 100 60" preserveAspectRatio="none"><polyline points="\${pts}" fill="none" stroke="var(--accent)" stroke-width="1.2" vector-effect="non-scaling-stroke"/></svg>\`;
  }
  app.className = "";
  app.innerHTML = \`
    <div class="total">\${usd(p.total_value)}</div>
    <div class="delta \${delta==null?"muted":delta>=0?"green":"red"}">
      \${delta==null ? "first sync" : signed(delta) + " vs previous sync"}
      <span class="muted"> · updated \${new Date(doc.ingested_at).toLocaleString()}</span>
    </div>
    \${spark}
    <section><h2>Accounts</h2><div class="grid">
      \${p.accounts.filter(a=>a.balance>0).sort((a,b)=>b.balance-a.balance).map(a=>\`
        <div class="card"><div class="name" title="\${a.name}">\${a.name}</div>
        <div class="bal">\${usd(a.balance)}</div><div class="n">\${a.positions_count} positions</div></div>\`).join("")}
    </div></section>
    <section><h2>Holdings (\${p.positions.length})</h2>
      <table><thead><tr><th>Symbol</th><th>Units</th><th>Price</th><th>Value</th><th>% of total</th><th>Open P&L</th></tr></thead><tbody>
      \${p.positions.map(x=>\`<tr>
        <td><strong>\${x.symbol}</strong>\${x.description?\`<span class="desc">\${x.description}</span>\`:""}</td>
        <td>\${(+x.units.toFixed(4)).toLocaleString()}</td>
        <td>\${x.price==null?"—":x.price.toLocaleString("en-US",{style:"currency",currency:"USD"})}</td>
        <td><strong>\${usd(x.value)}</strong><div class="bar" style="width:\${(x.value/maxVal*100).toFixed(1)}%"></div></td>
        <td class="muted">\${(x.value/p.total_value*100).toFixed(1)}%</td>
        <td class="\${(x.open_pnl??0)>=0?"green":"red"}">\${x.open_pnl==null?"—":signed(x.open_pnl)}</td>
      </tr>\`).join("")}
      </tbody></table>
    </section>\`;
}
main().catch(e => { document.getElementById("app").textContent = "Error: " + e.message; });
</script>
</body>
</html>`;

const SETUP_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><title>tenn · locked</title></head>
<body style="font-family:-apple-system,sans-serif;max-width:600px;margin:80px auto;padding:0 16px">
<h1>🔒 tenn is locked</h1>
<p>This site fails closed until Cloudflare Access is configured.</p>
<ol>
  <li>Zero Trust dashboard → Access → Applications → Add self-hosted app for <code>tenn.sprited.ai</code></li>
  <li>Policy: Allow → include email <code>jin@sprited.ai</code> (or your login email)</li>
  <li>Copy the app <strong>Audience (AUD) tag</strong> and your team domain</li>
  <li>Set <code>ACCESS_TEAM_DOMAIN</code> and <code>ACCESS_AUD</code> vars in <code>tenn/wrangler.jsonc</code>, redeploy</li>
</ol>
</body></html>`;

// ---------------------------------------------------------------------------
// Ingest
// ---------------------------------------------------------------------------

function validatePayload(p: unknown): p is Payload {
  const x = p as Payload;
  return (
    !!x &&
    typeof x.total_value === "number" &&
    Array.isArray(x.accounts) &&
    Array.isArray(x.positions)
  );
}

async function handleIngest(request: Request, env: Env): Promise<Response> {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!env.INGEST_TOKEN || !token || token !== env.INGEST_TOKEN) {
    return new Response("unauthorized", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response("bad json", { status: 400 });
  }
  if (!validatePayload(payload)) return new Response("bad payload", { status: 400 });

  const prevRaw = await env.TENN_KV.get("latest");
  const prev: StoredDoc | null = prevRaw ? JSON.parse(prevRaw) : null;

  const doc: StoredDoc = {
    payload,
    ingested_at: new Date().toISOString(),
    prev_total: prev?.payload?.total_value ?? null,
  };

  const day = doc.ingested_at.slice(0, 10);
  await Promise.all([
    env.TENN_KV.put("latest", JSON.stringify(doc)),
    env.TENN_KV.put(`snap:${day}`, JSON.stringify({ date: day, total: payload.total_value })),
  ]);

  let emailStatus = "skipped";
  const url = new URL(request.url);
  if (url.searchParams.get("email") !== "0") {
    try {
      const { subject, html, text } = buildEmail(doc);
      await env.EMAIL.send({
        to: env.EMAIL_TO,
        from: { email: env.EMAIL_FROM, name: "tenn" },
        subject,
        html,
        text,
      });
      emailStatus = "sent";
    } catch (e) {
      emailStatus = `failed: ${(e as Error).message}`;
    }
  }

  return Response.json({
    ok: true,
    total_value: payload.total_value,
    prev_total: doc.prev_total,
    email: emailStatus,
  });
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/ingest" && request.method === "POST") {
      return handleIngest(request, env);
    }
    if (path === "/healthz") return new Response("ok");

    // Everything else requires Cloudflare Access.
    const authed = await verifyAccessJWT(request, env);
    if (!authed) {
      const configured = teamOrigin(env) && env.ACCESS_AUD;
      return new Response(configured ? "forbidden" : SETUP_HTML, {
        status: 403,
        headers: { "Content-Type": configured ? "text/plain" : "text/html; charset=utf-8" },
      });
    }

    if (path === "/api/portfolio") {
      const raw = await env.TENN_KV.get("latest");
      if (!raw) return new Response("no data", { status: 404 });
      return new Response(raw, { headers: { "Content-Type": "application/json" } });
    }

    if (path === "/api/history") {
      const list = await env.TENN_KV.list({ prefix: "snap:" });
      const snaps = await Promise.all(
        list.keys.slice(-120).map(async (k) => JSON.parse((await env.TENN_KV.get(k.name)) || "null")),
      );
      return Response.json(snaps.filter(Boolean));
    }

    if (path === "/") {
      return new Response(DASHBOARD_HTML, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new Response("not found", { status: 404 });
  },
};
