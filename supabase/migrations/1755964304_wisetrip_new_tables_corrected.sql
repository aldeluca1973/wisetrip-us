-- Migration: wisetrip_new_tables_corrected
-- Created at: 1755964304

-- Create WiseTrip new tables migration
create extension if not exists "pgcrypto";

-- User preferences for AI personalization
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  dietary text[] default '{}',
  accessibility text[] default '{}',
  pace text,
  interests text[] default '{}',
  locale text,
  home_airport text,
  preferred_transport text[] default '{}',
  budget_band text,
  ai_profile jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- AI feedback collection
create table if not exists public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  feedback_type text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

-- AI-generated packing lists
create table if not exists public.packing_lists (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  items jsonb not null,
  generated_at timestamptz default now(),
  regenerated_count int default 0
);

-- Business directory
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text,
  address text,
  lat double precision,
  lng double precision,
  phone text,
  url text,
  description text,
  amenities text[] default '{}',
  verified boolean default false,
  created_at timestamptz default now()
);

-- Business listings
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  category text,
  description text,
  price numeric,
  currency text,
  media text[] default '{}',
  active boolean default true,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Special deals
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  title text not null,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  terms text,
  active boolean default true
);

-- Sponsored placements
create table if not exists public.sponsored_placements (
  id uuid primary key default gen_random_uuid(),
  sponsor_type text not null check (sponsor_type in ('business','tourist_office')),
  sponsor_id uuid not null,
  area text not null check (area in ('home','search','trip','map')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  budget_cents bigint not null,
  cap_type text not null check (cap_type in ('cpm','cpc')),
  cap_limit bigint not null,
  status text not null check (status in ('active','paused','ended'))
);

-- Tourist offices
create table if not exists public.tourist_offices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  region text,
  contact_email text,
  plan text not null check (plan in ('free','pro','enterprise')),
  created_at timestamptz default now()
);

-- Tourist office partnerships
create table if not exists public.tourist_partners (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references public.tourist_offices(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  status text not null check (status in ('pending','approved','disabled')),
  created_at timestamptz default now()
);

-- Marketing campaigns
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references public.tourist_offices(id) on delete cascade,
  name text not null,
  budget_cents bigint not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  targeting jsonb default '{}'::jsonb,
  status text not null check (status in ('draft','active','paused','ended')),
  created_at timestamptz default now()
);

-- User reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- Collaboration votes
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  voter_id uuid not null references auth.users(id) on delete cascade,
  choice text not null check (choice in ('yes','no','maybe')),
  created_at timestamptz default now()
);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  payload jsonb not null,
  seen boolean default false,
  created_at timestamptz default now()
);

-- Audit logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  payload jsonb,
  created_at timestamptz default now()
);

-- INDEXES
create index if not exists idx_listings_business on public.listings (business_id);
create index if not exists idx_deals_business on public.deals (business_id);
create index if not exists idx_listings_tags on public.listings using gin (tags);
create index if not exists idx_listings_active on public.listings (active);
create index if not exists idx_campaigns_office on public.campaigns (office_id);
create index if not exists idx_sponsored_area on public.sponsored_placements (area, status);
create index if not exists idx_businesses_owner on public.businesses (owner_id);
create index if not exists idx_votes_trip_activity on public.votes (trip_id, activity_id);
create index if not exists idx_ai_feedback_trip on public.ai_feedback (trip_id);
create index if not exists idx_user_preferences_user on public.user_preferences (user_id);
create index if not exists idx_packing_lists_trip on public.packing_lists (trip_id);
create index if not exists idx_notifications_user_seen on public.notifications (user_id, seen);

-- RLS POLICIES

-- User preferences policies
alter table public.user_preferences enable row level security;
create policy "Users can view own preferences" on public.user_preferences for select using (auth.uid() = user_id);
create policy "Users can update own preferences" on public.user_preferences for update using (auth.uid() = user_id);
create policy "Users can insert own preferences" on public.user_preferences for insert with check (auth.uid() = user_id);

-- AI feedback policies
alter table public.ai_feedback enable row level security;
create policy "Users can view own feedback" on public.ai_feedback for select using (auth.uid() = user_id);
create policy "Users can insert own feedback" on public.ai_feedback for insert with check (auth.uid() = user_id);

-- Packing lists policies
alter table public.packing_lists enable row level security;
create policy "Trip owners and collaborators can view packing lists" on public.packing_lists for select using (
  exists (
    select 1 from trips t 
    where t.id = trip_id and (
      t.user_id = auth.uid() or 
      exists (select 1 from trip_collaborators tc where tc.trip_id = t.id and tc.user_id = auth.uid())
    )
  )
);
create policy "Trip owners can manage packing lists" on public.packing_lists for all using (
  exists (select 1 from trips t where t.id = trip_id and t.user_id = auth.uid())
);

-- Businesses policies
alter table public.businesses enable row level security;
create policy "Anyone can view verified businesses" on public.businesses for select using (verified = true);
create policy "Business owners can manage their businesses" on public.businesses for all using (auth.uid() = owner_id);

-- Listings policies
alter table public.listings enable row level security;
create policy "Anyone can view active listings" on public.listings for select using (active = true);
create policy "Business owners can manage their listings" on public.listings for all using (
  exists (select 1 from businesses b where b.id = business_id and b.owner_id = auth.uid())
);

-- Deals policies
alter table public.deals enable row level security;
create policy "Anyone can view active deals" on public.deals for select using (active = true and starts_at <= now() and (ends_at is null or ends_at >= now()));
create policy "Business owners can manage their deals" on public.deals for all using (
  exists (select 1 from businesses b where b.id = business_id and b.owner_id = auth.uid())
);

-- Sponsored placements policies
alter table public.sponsored_placements enable row level security;
create policy "Anyone can view active sponsored placements" on public.sponsored_placements for select using (status = 'active' and starts_at <= now() and ends_at >= now());

-- Tourist offices policies
alter table public.tourist_offices enable row level security;
create policy "Tourist office owners can manage their offices" on public.tourist_offices for all using (auth.uid() = owner_id);
create policy "Anyone can view tourist offices" on public.tourist_offices for select using (true);

-- Tourist partners policies
alter table public.tourist_partners enable row level security;
create policy "Tourist office owners can manage partnerships" on public.tourist_partners for all using (
  exists (select 1 from tourist_offices t where t.id = office_id and t.owner_id = auth.uid())
);

-- Campaigns policies
alter table public.campaigns enable row level security;
create policy "Tourist office owners can manage campaigns" on public.campaigns for all using (
  exists (select 1 from tourist_offices t where t.id = office_id and t.owner_id = auth.uid())
);

-- Reviews policies
alter table public.reviews enable row level security;
create policy "Anyone can view reviews" on public.reviews for select using (true);
create policy "Users can create reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on public.reviews for update using (auth.uid() = user_id);
create policy "Users can delete own reviews" on public.reviews for delete using (auth.uid() = user_id);

-- Votes policies
alter table public.votes enable row level security;
create policy "Trip collaborators can view votes" on public.votes for select using (
  exists (
    select 1 from trips t 
    where t.id = trip_id and (
      t.user_id = auth.uid() or 
      exists (select 1 from trip_collaborators tc where tc.trip_id = t.id and tc.user_id = auth.uid())
    )
  )
);
create policy "Trip collaborators can vote" on public.votes for insert with check (
  auth.uid() = voter_id and
  exists (
    select 1 from trips t 
    where t.id = trip_id and (
      t.user_id = auth.uid() or 
      exists (select 1 from trip_collaborators tc where tc.trip_id = t.id and tc.user_id = auth.uid())
    )
  )
);
create policy "Users can update own votes" on public.votes for update using (auth.uid() = voter_id);

-- Notifications policies
alter table public.notifications enable row level security;
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- Audit logs policies
alter table public.audit_logs enable row level security;
create policy "Service role can manage audit logs" on public.audit_logs for all using (auth.jwt() ->> 'role' = 'service_role');;