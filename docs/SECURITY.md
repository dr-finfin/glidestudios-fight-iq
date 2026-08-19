# Security Rules

## Never commit

- Supabase service-role keys
- Gemini API keys
- Cloudflare API tokens
- passwords
- private signing keys
- `.env` / `.dev.vars` files containing real secrets

## GitHub Secrets

Use GitHub repository secrets for:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The deploy workflow passes the application secrets to Cloudflare as Worker secrets. Cloudflare's Wrangler configuration supports required secrets, and the Wrangler GitHub Action supports provisioning Worker secrets from GitHub secrets. See `docs/CLOUDFLARE_SETUP.md`.
