# GlideStudios Cloudflare Setup

## Secrets required in Cloudflare

Set these as Worker secrets:

- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Set these with `wrangler secret put` or in the Cloudflare dashboard. Never commit them.

## GitHub Actions secrets

Add:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The API token should have permission to edit/deploy Workers. GitHub Actions uses these to deploy the Worker without your PC being online.

## First test

After deployment:

- `GET /health` should return `{ "ok": true, ... }`
- `POST /run` starts a durable Fight IQ story workflow.
- `GET /status?instanceId=...` checks progress.

The daily schedule is currently `0 6 * * *` UTC, which is 09:00 in Kenya (EAT).
