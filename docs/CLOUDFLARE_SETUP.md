# Cloudflare Deployment Setup

This is the active deployment path. Your PC does not need to stay on.

## 1. Cloudflare account

Create a Cloudflare account and open Workers & Pages.

## 2. GitHub repository secrets

In GitHub:

`Settings → Secrets and variables → Actions → New repository secret`

Create:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Never put these in the repository.

## 3. Cloudflare API token

Create a token suitable for deploying Workers from GitHub Actions. Use the smallest permissions practical for your account.

## 4. First deployment

The workflow at `.github/workflows/deploy.yml` runs on pushes to `main` and deploys using `cloudflare/wrangler-action@v3`.

## 5. Worker secrets

The workflow passes the three application secrets to Wrangler as Worker secrets:

- GEMINI_API_KEY
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

`wrangler.jsonc` declares them as required.

## 6. First health check

After GitHub Actions completes, open the Worker URL and visit:

`/health`

Expected response:

```json
{
  "ok": true,
  "service": "glidestudios-fight-iq"
}
```

## 7. First manual story run

POST JSON to `/run`:

```json
{
  "topic": "The rivalry between Jon Jones and Daniel Cormier",
  "category": "rivalry",
  "channel": "Fight IQ"
}
```

The response contains an `instanceId`. Use `/status?instanceId=...` to inspect the Workflow instance.

## 8. Schedule

The Workflow is configured to create a scheduled instance daily at `06:00 UTC`, which is `09:00` in East Africa Time while Kenya is on UTC+3.
