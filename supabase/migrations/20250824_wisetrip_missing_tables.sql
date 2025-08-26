-- WiseTrip Missing Tables for Complete Specification
-- Only adds missing tables needed for all 6 AI functions and differentiator features
-- Created: 2025-08-24
-- Database: mbrzrpstrzicaxqqfftk

-- Inspirations for "Inspire Me" AI feature
create table if not exists public.inspirations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  destination text not null,
  theme text,
  season text,
  image_urls text[] default '{}',
  inspiration_data jsonb not null,
  tags text[] default '{}',
  likes_count integer default 0,
  created_at timestamptz default now()
);

-- Price locks for transparency (Price Lock Monitor AI feature)
create table if not exists public.price_locks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  listing_id uuid,
  business_id uuid,
  original_price decimal(10,2) not null,
  locked_price decimal(10,2) not null,
  currency text default 'USD',
  lock_expires_at timestamptz not null,
  status text default 'active',
  booking_reference text,
  created_at timestamptz default now()
);

-- AI Concierge conversations (Concierge Answer AI feature)
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  conversation_type text not null, -- 'concierge', 'itinerary', 'packing'
  messages jsonb not null default '[]'::jsonb,
  context_data jsonb default '{}'::jsonb,
  last_message_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Anonymous voting for features (Differentiator feature)
create table if not exists public.voting_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  options jsonb not null,
  votes jsonb default '{}'::jsonb,
  anonymous boolean default true,
  expires_at timestamptz,
  active boolean default true,
  created_at timestamptz default now()
);

-- User votes (anonymous or identified)
create table if not exists public.user_votes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.voting_sessions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  option_selected text not null,
  anonymous boolean default true,
  ip_hash text, -- For anonymous duplicate prevention
  created_at timestamptz default now()
);

-- Offline exports (Differentiator feature)
create table if not exists public.offline_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  itinerary_id uuid references public.itineraries(id) on delete cascade,
  export_type text not null, -- 'pdf', 'mobile', 'json'
  export_data jsonb,
  file_url text,
  expires_at timestamptz,
  downloaded boolean default false,
  created_at timestamptz default now()
);

-- AR locations (AR stub - Differentiator feature)
create table if not exists public.ar_locations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade,
  lat decimal(10, 8) not null,
  lng decimal(11, 8) not null,
  ar_content jsonb default '{}'::jsonb,
  model_url text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Backup activities for itineraries (Differentiator feature)
create table if not exists public.backup_activities (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid references public.itineraries(id) on delete cascade,
  original_activity_id text,
  backup_activity jsonb not null,
  reason text, -- weather, availability, etc.
  priority integer default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- Trust flags for verification (Differentiator feature)
create table if not exists public.trust_flags (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null, -- 'business', 'listing', 'review', 'user'
  entity_id uuid not null,
  flag_type text not null, -- 'verified', 'trusted', 'warning', 'fraud'
  flag_data jsonb default '{}'::jsonb,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  active boolean default true,
  created_at timestamptz default now()
);

-- Payment records (using existing subscriptions table with integer id)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  subscription_id integer references public.subscriptions(id) on delete set null,
  stripe_payment_intent_id text,
  amount_cents integer not null,
  currency text default 'usd',
  status text not null,
  created_at timestamptz default now()
);

-- Add missing columns to existing tables
-- Add backup_activities column to itineraries if it doesn't exist
do $$ 
begin
  if not exists (select 1 from information_schema.columns 
                where table_name = 'itineraries' and column_name = 'backup_activities') then
    alter table public.itineraries add column backup_activities jsonb default '[]'::jsonb;
  end if;
end $$;

-- Add trust_score column to itineraries if it doesn't exist
do $$ 
begin
  if not exists (select 1 from information_schema.columns 
                where table_name = 'itineraries' and column_name = 'trust_score') then
    alter table public.itineraries add column trust_score integer default 0;
  end if;
end $$;

-- Add verified column to itineraries if it doesn't exist
do $$ 
begin
  if not exists (select 1 from information_schema.columns 
                where table_name = 'itineraries' and column_name = 'verified') then
    alter table public.itineraries add column verified boolean default false;
  end if;
end $$;

-- Add trust_flags column to businesses if it doesn't exist
do $$ 
begin
  if not exists (select 1 from information_schema.columns 
                where table_name = 'businesses' and column_name = 'trust_flags') then
    alter table public.businesses add column trust_flags jsonb default '{}'::jsonb;
  end if;
end $$;

-- Add backup_options column to listings if it doesn't exist
do $$ 
begin
  if not exists (select 1 from information_schema.columns 
                where table_name = 'listings' and column_name = 'backup_options') then
    alter table public.listings add column backup_options jsonb default '[]'::jsonb;
  end if;
end $$;

-- Create indexes for performance
create index if not exists idx_inspirations_user_id on public.inspirations(user_id);
create index if not exists idx_inspirations_destination on public.inspirations(destination);
create index if not exists idx_price_locks_user_id on public.price_locks(user_id);
create index if not exists idx_ai_conversations_user_id on public.ai_conversations(user_id);
create index if not exists idx_voting_sessions_active on public.voting_sessions(active);
create index if not exists idx_trust_flags_entity on public.trust_flags(entity_type, entity_id);
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_offline_exports_user_id on public.offline_exports(user_id);
create index if not exists idx_ar_locations_listing_id on public.ar_locations(listing_id);
create index if not exists idx_backup_activities_itinerary_id on public.backup_activities(itinerary_id);

-- Enable Row Level Security on new tables
alter table public.inspirations enable row level security;
alter table public.price_locks enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.voting_sessions enable row level security;
alter table public.user_votes enable row level security;
alter table public.offline_exports enable row level security;
alter table public.ar_locations enable row level security;
alter table public.backup_activities enable row level security;
alter table public.trust_flags enable row level security;
alter table public.payments enable row level security;

-- Create RLS policies
-- Inspirations: public read, users can manage their own
create policy "Public can view inspirations" on public.inspirations
  for select using (true);

create policy "Users can manage own inspirations" on public.inspirations
  for insert with check (auth.uid() = user_id);

create policy "Users can update own inspirations" on public.inspirations
  for update using (auth.uid() = user_id);

create policy "Users can delete own inspirations" on public.inspirations
  for delete using (auth.uid() = user_id);

-- Price locks: users can only access their own
create policy "Users can manage own price locks" on public.price_locks
  for all using (auth.uid() = user_id);

-- AI conversations: users can only access their own
create policy "Users can manage own conversations" on public.ai_conversations
  for all using (auth.uid() = user_id);

-- Voting sessions: public read for active sessions
create policy "Public can view active voting sessions" on public.voting_sessions
  for select using (active = true);

-- User votes: users can manage their own (if not anonymous)
create policy "Users can manage own votes" on public.user_votes
  for all using (auth.uid() = user_id or user_id is null);

-- Offline exports: users can only access their own
create policy "Users can manage own exports" on public.offline_exports
  for all using (auth.uid() = user_id);

-- AR locations: public read
create policy "Public can view AR locations" on public.ar_locations
  for select using (active = true);

-- Backup activities: users can access based on itinerary ownership
create policy "Users can manage backup activities for own itineraries" on public.backup_activities
  for all using (auth.uid() in (
    select user_id from public.itineraries where id = itinerary_id
  ));

-- Trust flags: public read
create policy "Public can view trust flags" on public.trust_flags
  for select using (active = true);

-- Payments: users can only access their own
create policy "Users can manage own payments" on public.payments
  for all using (auth.uid() = user_id);

-- Grant necessary permissions
grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

commit;