# GlideStudios Architecture

## Control plane
n8n orchestrates workflows and maintains state transitions.

## Data plane
Supabase Postgres stores structured state. Cloudflare R2 stores large files and media.

## AI plane
AI providers generate research summaries, story structures, scripts, scene plans, metadata and QC decisions. Prompts must require source-aware claims and explicit uncertainty.

## Compute plane
Heavy jobs are dispatched to cloud runners. The creator PC is never a required worker.

## State machine
`IDEA -> RESEARCH -> FACT_CHECK -> STORY -> SCRIPT -> SCENE_PLAN -> PRODUCTION -> QC -> APPROVAL -> PUBLISHED -> ANALYTICS`

Failed states return to the smallest appropriate stage instead of restarting the entire episode.

## Cost guardrail
Never allow a provider to silently become billable. Production secrets must be paired with explicit free-tier/rate limits and a fail-closed behavior.
