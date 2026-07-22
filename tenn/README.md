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

## One-time setup remaining (dashboard access)

The wrangler OAuth token can't manage Zero Trust, so create the Access app manually:

1. [Zero Trust dashboard](https://one.dash.cloudflare.com/) → **Access → Applications →
   Add application → Self-hosted**
   - Application domain: `tenn.sprited.ai`
   - Policy: Allow → Include → Emails: `jinhyuki@gmail.com` (your Cloudflare login)
2. After creating, open the app → **Overview** → copy the **Audience (AUD) tag**.
3. Your team domain is shown under **Settings → Custom Pages** (e.g. `yourteam.cloudflareaccess.com`).
4. Fill both into `vars` in [wrangler.jsonc](wrangler.jsonc) and redeploy:

```bash
cd tenn && npx wrangler deploy
```

5. (Optional, for CI worker deploys) Create an API token with *Workers Scripts:Edit* +
   *Workers Routes:Edit* and save it as the `CLOUDFLARE_API_TOKEN` repo secret.

Note: `/api/ingest` and `/healthz` must stay reachable without SSO. If Access sits in
front of the whole hostname it will block the GitHub Action — add a second Access app
for `tenn.sprited.ai/api/ingest` with a **Bypass → Everyone** policy (the worker still
enforces the bearer token), or use an Access service token in the workflow.

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
