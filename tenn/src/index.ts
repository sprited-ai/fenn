// Dashboard page is kept as raw HTML and imported via wrangler "Text" module rule.
import DASHBOARD_HTML from "./dashboard.html";

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
 *
 * On ingest the worker also generates an LLM daily commentary via the Claude
 * API when the optional ANTHROPIC_API_KEY secret is set — failures there never
 * block ingest or email.
 */

export interface Env {
  TENN_KV: KVNamespace;
  EMAIL: SendEmail;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  EMAIL_TO: string;
  EMAIL_FROM: string;
  INGEST_TOKEN?: string;
  ANTHROPIC_API_KEY?: string;
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
  cost_basis?: number | null;
  avg_cost?: number | null;
  accounts: string[];
  institutions?: string[];
}

interface Payload {
  generated_at: string;
  total_value: number;
  total_open_pnl: number;
  total_cost_basis?: number;
  accounts: { name: string; institution?: string; balance: number; positions_count: number }[];
  positions: Position[];
}

interface StoredDoc {
  payload: Payload;
  ingested_at: string;
  prev_total: number | null;
  commentary?: string | null;
  commentary_at?: string;
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
const fmtSigned = (n: number) => (n >= 0 ? "+" : "") + fmtUSD(n);
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---------------------------------------------------------------------------
// LLM daily commentary (Claude API, optional)
// ---------------------------------------------------------------------------

async function generateCommentary(
  doc: StoredDoc,
  prev: StoredDoc | null,
  env: Env,
): Promise<string | null> {
  if (!env.ANTHROPIC_API_KEY) return null;
  try {
    const p = doc.payload;
    const prevBySymbol = new Map(
      (prev?.payload?.positions || []).map((x) => [x.symbol, x]),
    );
    const movers = p.positions
      .map((x) => {
        const before = prevBySymbol.get(x.symbol);
        return { symbol: x.symbol, value: Math.round(x.value), change: before ? Math.round(x.value - before.value) : null };
      })
      .filter((m) => m.change !== null)
      .sort((a, b) => Math.abs(b.change!) - Math.abs(a.change!))
      .slice(0, 12);

    const facts = {
      as_of: doc.ingested_at,
      total_value: Math.round(p.total_value),
      change_vs_prev_sync: doc.prev_total != null ? Math.round(p.total_value - doc.prev_total) : null,
      total_open_pnl: Math.round(p.total_open_pnl),
      total_cost_basis: p.total_cost_basis ? Math.round(p.total_cost_basis) : null,
      accounts: p.accounts.filter((a) => a.balance > 0).map((a) => ({ name: a.name, balance: Math.round(a.balance) })),
      top_positions: p.positions.slice(0, 15).map((x) => ({
        symbol: x.symbol,
        value: Math.round(x.value),
        pct_of_total: +((x.value / p.total_value) * 100).toFixed(1),
        open_pnl: x.open_pnl != null ? Math.round(x.open_pnl) : null,
      })),
      biggest_movers_vs_prev_sync: movers,
    };

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-8",
        max_tokens: 1200,
        system:
          "You are tenn, Jin's private portfolio analyst. Write a daily portfolio brief in Korean " +
          "(한국어, 반말 아닌 평어체) based only on the JSON facts given. 4-7 sentences of plain prose, " +
          "no headers or bullet lists. Cover: overall move and what drove it (biggest movers), " +
          "concentration observations if notable, and one thing worth watching. " +
          "Numbers in USD. Do not invent data not present in the facts. Do not give buy/sell directives; " +
          "observations only. No preamble.",
        messages: [{ role: "user", content: JSON.stringify(facts) }],
      }),
    });
    if (!res.ok) return null;
    const msg = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = (msg.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    return text || null;
  } catch {
    return null; // commentary must never block ingest
  }
}

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

  const commentaryHtml = doc.commentary
    ? `<h3 style="margin:16px 0 8px">Daily brief</h3>
       <p style="margin:0;line-height:1.6;background:#f6f7f9;border-radius:8px;padding:12px 14px">${esc(doc.commentary)}</p>`
    : "";

  const subject = `tenn: ${fmtUSD(p.total_value)}${delta != null ? ` (${fmtSigned(delta)})` : ""}`;
  const html = `
    <div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:560px">
      <h2 style="margin:0 0 4px">Portfolio: ${fmtUSD(p.total_value)}</h2>
      <p style="margin:0 0 16px;color:#555">${deltaStr || "First sync"} · synced ${esc(doc.ingested_at)}</p>
      ${commentaryHtml}
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
    (doc.commentary ? `${doc.commentary}\n\n` : "") +
    p.accounts.filter((a) => a.balance > 0).map((a) => `- ${a.name}: ${fmtUSD(a.balance)}`).join("\n") +
    `\n\nTop holdings:\n` +
    top.map((pos) => `- ${pos.symbol}: ${fmtUSD(pos.value)}`).join("\n") +
    `\n\nhttps://tenn.sprited.ai`;
  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// Dashboard HTML — mobile-first, data fetched client-side from /api/portfolio
// ---------------------------------------------------------------------------


const SETUP_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><title>tenn · locked</title></head>
<body style="font-family:-apple-system,sans-serif;max-width:600px;margin:80px auto;padding:0 16px">
<h1>🔒 tenn is locked</h1>
<p>This site fails closed until Cloudflare Access is configured.</p>
<ol>
  <li>Zero Trust dashboard → Access → Applications → Add self-hosted app for <code>tenn.sprited.ai</code></li>
  <li>Policy: Allow → include your login email</li>
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
    x.total_value > 0 &&
    Array.isArray(x.accounts) &&
    x.accounts.length > 0 &&
    Array.isArray(x.positions) &&
    x.positions.length > 0
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

  const url = new URL(request.url);
  const wantEmail = url.searchParams.get("email") !== "0";

  // LLM commentary: only when emailing (i.e. the real daily run) unless forced.
  let commentaryStatus = "skipped";
  if ((wantEmail || url.searchParams.get("commentary") === "1") && env.ANTHROPIC_API_KEY) {
    const commentary = await generateCommentary(doc, prev, env);
    if (commentary) {
      doc.commentary = commentary;
      doc.commentary_at = doc.ingested_at;
      commentaryStatus = "generated";
    } else {
      commentaryStatus = "failed";
    }
  } else if (!env.ANTHROPIC_API_KEY) {
    commentaryStatus = "no-key";
  }
  // Carry forward the last commentary so the dashboard keeps showing one.
  if (!doc.commentary && prev?.commentary) {
    doc.commentary = prev.commentary;
    doc.commentary_at = prev.commentary_at;
  }

  const day = doc.ingested_at.slice(0, 10);
  await Promise.all([
    env.TENN_KV.put("latest", JSON.stringify(doc)),
    env.TENN_KV.put(`snap:${day}`, JSON.stringify({ date: day, total: payload.total_value })),
  ]);

  let emailStatus = "skipped";
  if (wantEmail) {
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
    commentary: commentaryStatus,
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
