# GlideStudios Architecture

## Principle

The user's computer is not a server. Production must continue when the computer is completely offline.

## Active runtime

```text
GitHub
  │
  └── GitHub Actions
        │
        └── Cloudflare Wrangler deploy
                      │
                      ▼
              Cloudflare Worker
                      │
                      ▼
              Cloudflare Workflow
                │             │
                ▼             ▼
             Gemini        Supabase
                │             │
                └──────┬──────┘
                       ▼
                Production jobs
                       │
                       ▼
              R2 / GitHub Actions
                       │
                       ▼
                    YouTube
```

## Separation of concerns

- Cloudflare Worker: API surface and orchestration.
- Cloudflare Workflow: durable multi-step execution and retries.
- Supabase: persistent state and content database.
- Gemini: AI reasoning/generation.
- GitHub Actions: deployment and later heavy compute jobs.
- R2: media storage.
- YouTube API: publishing and analytics.

## Legacy

The `n8n/` directory and original Render setup are retained as an experiment/archive. They are not the production dependency.
