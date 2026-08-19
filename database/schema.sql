-- GlideStudios / Fight IQ control-plane schema
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists channels (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  title text not null,
  category text not null check (category in ('fighter_story','rivalry','fight_story','what_happened')),
  status text not null default 'idea' check (status in ('idea','research','script','production','review','approved','published','rejected')),
  story_score numeric(5,2) not null default 0,
  hook text,
  why_now_or_evergreen text,
  fighters jsonb not null default '[]'::jsonb,
  risk_flags jsonb not null default '[]'::jsonb,
  source_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  url text not null,
  publisher text,
  title text,
  source_type text,
  published_at timestamptz,
  credibility_score numeric(5,2),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists research_packs (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null unique references stories(id) on delete cascade,
  summary text,
  timeline jsonb not null default '[]'::jsonb,
  verified_facts jsonb not null default '[]'::jsonb,
  claims_to_verify jsonb not null default '[]'::jsonb,
  key_quotes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists scripts (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null unique references stories(id) on delete cascade,
  title text,
  script_text text,
  word_count integer,
  estimated_seconds integer,
  version integer not null default 1,
  status text not null default 'draft' check (status in ('draft','fact_check','approved','superseded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists scene_plans (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null unique references stories(id) on delete cascade,
  scenes jsonb not null default '[]'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references stories(id) on delete set null,
  asset_type text not null,
  provider text,
  source_url text,
  storage_key text,
  license_status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists production_jobs (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  job_type text not null,
  status text not null default 'queued' check (status in ('queued','running','complete','failed','cancelled')),
  provider text,
  external_job_id text,
  input_manifest jsonb not null default '{}'::jsonb,
  output_manifest jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists episodes (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null unique references stories(id) on delete cascade,
  episode_number integer,
  working_title text,
  final_title text,
  description text,
  video_storage_key text,
  thumbnail_storage_key text,
  youtube_video_id text,
  scheduled_at timestamptz,
  published_at timestamptz,
  status text not null default 'production' check (status in ('production','review','approved','scheduled','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references episodes(id) on delete cascade,
  captured_at timestamptz not null default now(),
  views bigint,
  impressions bigint,
  click_through_rate numeric(7,4),
  average_view_duration_seconds numeric(10,2),
  average_percentage_viewed numeric(7,3),
  likes bigint,
  comments bigint,
  subscribers_gained bigint,
  traffic_sources jsonb not null default '{}'::jsonb
);

create index if not exists idx_stories_channel_status on stories(channel_id, status);
create index if not exists idx_stories_score on stories(story_score desc);
create index if not exists idx_sources_story on sources(story_id);
create index if not exists idx_jobs_story_status on production_jobs(story_id, status);
create index if not exists idx_analytics_episode_time on analytics_snapshots(episode_id, captured_at desc);

insert into channels (slug, name, description)
values (
  'fight-iq',
  'Fight IQ',
  'Combat-sports stories, rivalries, fight stories, comebacks, downfalls and career turning points.'
)
on conflict (slug) do nothing;

-- Lock down direct client access. The Worker uses the Supabase service-role key server-side.
alter table channels enable row level security;
alter table stories enable row level security;
alter table sources enable row level security;
alter table research_packs enable row level security;
alter table scripts enable row level security;
alter table scene_plans enable row level security;
alter table assets enable row level security;
alter table production_jobs enable row level security;
alter table episodes enable row level security;
alter table analytics_snapshots enable row level security;
