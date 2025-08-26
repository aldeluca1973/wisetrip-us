-- Migration: 20250823_wisetrip_basic_tables
-- Created at: 1755968028

-- WiseTrip Basic Tables Migration
-- Created: 2025-08-23

-- User preferences and AI profile
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  interests text[] default '{}',
  budget_range text default 'medium',
  travel_style text default 'balanced',
  ai_profile jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- AI-generated itineraries
create table if not exists public.itineraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  destination text not null,
  duration_days integer not null,
  budget_range text,
  travel_style text,
  itinerary_data jsonb not null,
  ai_prompt_used text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Usage analytics
create table if not exists public.usage_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  event_type text not null,
  event_data jsonb,
  session_id text,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);

-- Create indexes
create index if not exists idx_user_preferences_user_id on public.user_preferences(user_id);
create index if not exists idx_itineraries_user_id on public.itineraries(user_id);
create index if not exists idx_itineraries_destination on public.itineraries(destination);
create index if not exists idx_usage_analytics_user_id on public.usage_analytics(user_id);
create index if not exists idx_usage_analytics_event_type on public.usage_analytics(event_type);

-- Enable Row Level Security
alter table public.user_preferences enable row level security;
alter table public.itineraries enable row level security;
alter table public.usage_analytics enable row level security;

-- Create RLS policies
create policy "Users can manage own preferences" on public.user_preferences
  for all using (auth.uid() = user_id);

create policy "Users can manage own itineraries" on public.itineraries
  for all using (auth.uid() = user_id or user_id is null);

create policy "Service role can manage analytics" on public.usage_analytics
  for all using (auth.jwt()->>'role' = 'service_role');;