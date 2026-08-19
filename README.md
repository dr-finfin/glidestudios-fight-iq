# GlideStudios — Fight IQ

Cloud-first, $0-first automated media studio for Fight IQ.

## Non-negotiable constraints
- Target operating cost: $0
- No credit card required for the core stack
- No local runtime dependency
- A powered-off creator PC must not stop production
- Human approval before publishing in the initial phase
- Modular components so paid services can be swapped in later

## Current architecture
- Orchestration: n8n Community Edition, self-hosted in cloud infrastructure
- Database: Supabase Postgres
- Object storage: Cloudflare R2
- AI: Gemini free tier where suitable
- Heavy compute/rendering: GitHub Actions / public repository standard runners
- Publishing: YouTube Data API

## MVP pipeline
1. Story candidate enters `stories`
2. Research pack is produced and stored
3. Story is fact-checked
4. Script is generated
5. Scene plan is generated
6. Production job is created
7. Cloud worker renders/prepares the episode
8. QC gates the episode
9. Human approves
10. Publisher uploads to YouTube
11. Analytics feeds back into story scoring

## Important note
Free tiers have limits and can change. This repository deliberately keeps provider-specific logic behind small interfaces so services can be replaced.
