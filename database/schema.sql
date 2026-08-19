-- GlideStudios / Fight IQ MVP schema
-- PostgreSQL / Supabase compatible

create extension if not exists pgcrypto;

create type story_status as enum (
  'idea', 'research', 'fact_check', 'story', 'script',
  'scene_plan', 'production', 'qc', 'approval', 'published', 'rejected'
);

create type story_category as enum (
  'fighter_story', 'rivalry', 'fight_story', 'where_are_they_now', 'current_event'
);

create table if not exists channels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  title_idea text not null,
  category story_category not null,
  hook text,
  story_score numeric(5,2),
  narrative_score numeric(5,2),
  conflict_score numeric(5,2),
  curiosity_score numeric(5,2),
  visual_score numeric(5,2),
  evergreen_score numeric(5,2),
  status story_status not null default 'idea',
  priority integer not null default 50,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  url text not null,
  title text,
  publisher text,
  published_at timestamptz,
  source_type text,
  reliability_score numeric(4,2),
  retrieved_at timestamptz not null default now()
);

create table if not exists research_packs (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  timeline jsonb not null default '[]'::jsonb,
  claims jsonb not null default '[]'::jsonb,
  quotes jsonb not null default '[]'::jsonb,
  open_questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists scripts (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  version integer not null default 1,
  title text,
  script_text text not null,
  estimated_seconds integer,
  qc_score numeric(5,2),
  created_at timestamptz not null default now(),
  unique (story_id, version)
);

create table if not exists scene_plans (
  id uuid primary key default gen_random_uuid(),
  script_id uuid not null references scripts(id) on delete cascade,
  version integer not null default 1,
  scenes jsonb not null,
  created_at timestamptz not null default now(),
  unique (script_id, version)
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references stories(id) on delete cascade,
  asset_type text not null,
  provider text,
  source_url text,
  storage_key text,
  license_notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists production_jobs (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  status text not null default 'queued',
  job_type text not null,
  input_manifest jsonb not null default '{}'::jsonb,
  output_manifest jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists episodes (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  youtube_video_id text,
  title text,
  description text,
  thumbnail_key text,
  video_key text,
  duration_seconds integer,
  approval_status text not null default 'pending',
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references episodes(id) on delete cascade,
  captured_at timestamptz not null default now(),
  views bigint,
  impressions bigint,
  ctr numeric(7,4),
  average_view_duration_seconds integer,
  average_percentage_viewed numeric(7,4),
  likes bigint,
  comments bigint,
  subscribers_gained bigint,
  traffic_sources jsonb not null default '{}'::jsonb
);

insert into channels (name, slug)
values ('Fight IQ', 'fight-iq')
on conflict (slug) do nothing;
