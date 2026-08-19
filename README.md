# GlideStudios — Fight IQ

Fight IQ is the first channel built on the GlideStudios automated media-studio architecture.

The channel covers **fighter stories, rivalries, fight stories, comebacks, downfalls and career turning points** in a documentary/explainer style.

## Current architecture

- **Cloudflare Workers + Workflows** — orchestration and durable multi-step jobs
- **Supabase Postgres** — content state, research metadata, production state and analytics
- **Gemini API** — story ideation and structured AI generation
- **Cloudflare R2** — media/object storage (later production phase)
- **GitHub Actions** — cloud deployment and later heavy production jobs
- **YouTube API** — publishing (later production phase)

Your computer is **not part of runtime**. It is only an optional control/administration device.

## Repository map

```text
.
├── .github/workflows/       GitHub automation
├── certs/                   Certificate documentation/placeholders only
├── database/                Supabase schema + seed data
├── docs/                    Architecture, pipeline, security, setup
├── n8n/                     Legacy/experimental n8n deployment artifacts
├── production/              Future cloud rendering/asset pipeline
├── src/                     Active Cloudflare Worker + Workflow code
├── .gitignore
├── package.json
├── tsconfig.json
└── wrangler.jsonc
```

## First milestone

The first production milestone is intentionally small:

```text
Scheduled/HTTP trigger
        ↓
Fight IQ Story Hunter
        ↓
Gemini structured story concept
        ↓
Supabase `stories`
```

After that is stable we add research, fact checking, scripts, scene plans, production, packaging, publishing and analytics.

## Secrets

Never commit API keys, passwords, service-role keys, `.env` files or private certificates.

Required Cloudflare Worker secrets are declared in `wrangler.jsonc` and are supplied through GitHub Actions/Cloudflare Secrets.

## Local development

Local development is optional. Production deployment is intended to happen from GitHub Actions so the system does not depend on your computer.

See `docs/CLOUDFLARE_SETUP.md`.
