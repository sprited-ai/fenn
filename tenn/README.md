# tenn — private portfolio dashboard

Cloudflare Worker serving Jin's portfolio at **https://tenn.sprited.ai**.

## Architecture

```
GitHub Actions (weekdays 6:30am PT, .github/workflows/sync-portfolio.yml)
  └─ fenn sync (SnapTrade) → build_site_payload.py
       └─ POST /api/ingest (Bearer TENN_INGEST_TOKEN)
            └─ Worker: store in KV (latest + daily snap:YYYY-MM-DD)
                 └─ email summary → jin@sprited.ai (Cloudflare Email Sending, from tenn@sprited.ai)

Browser → tenn.sprited.ai → Cloudflare Access (SSO) → Worker verifies Access JWT → dashboard
```

## Security

- **Fail closed**: dashboard and `/api/*` reads return 403 until `ACCESS_TEAM_DOMAIN` /
  `ACCESS_AUD` are configured; the worker independently verifies the Access JWT
  (`Cf-Access-Jwt-Assertion`) on every request, so data is never served without SSO
  even if the Access app is deleted or misconfigured.
- `/api/ingest` requires the `INGEST_TOKEN` worker secret (also stored as the
  `TENN_INGEST_TOKEN` repo secret).
- Portfolio data lives only in Workers KV — never committed to this (public) repo.
- GitHub Actions logs suppress all financial output (public repo → public logs).

## Access setup (done 2026-07-22)

The Access app for `tenn.sprited.ai` exists (team `roidmaker.cloudflareaccess.com`);
its AUD tag is wired into `vars` in [wrangler.jsonc](wrangler.jsonc). Because Access
fronts the custom domain, GitHub Actions ingests via the workers.dev hostname instead
(`tenn.jc524.workers.dev`) — that route stays enabled deliberately: ingest has its own
bearer token, and every read route fails closed without a valid Access JWT on any
hostname.

Optional: for CI worker deploys, create an API token with *Workers Scripts:Edit* +
*Workers Routes:Edit* and save it as the `CLOUDFLARE_API_TOKEN` repo secret.

Optional: LLM daily commentary (dashboard "Daily brief" + email section) activates
when the `ANTHROPIC_API_KEY` worker secret is set:

```bash
cd tenn && npx wrangler secret put ANTHROPIC_API_KEY
```

Without it, ingest reports `commentary: "no-key"` and everything else works.
Commentary runs only on email-enabled ingests (the daily cron), or when the
ingest URL has `?commentary=1`.

## Manual operations

```bash
# Deploy
cd tenn && npx wrangler deploy

# Rotate ingest token
openssl rand -hex 32   # then:
npx wrangler secret put INGEST_TOKEN          # worker side
gh secret set TENN_INGEST_TOKEN -R sprited-ai/fenn   # CI side

# Push data manually (from cli/, after fenn sync)
python build_site_payload.py -o /tmp/payload.json
curl -X POST "https://tenn.sprited.ai/api/ingest?email=0" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  --data-binary @/tmp/payload.json
```
