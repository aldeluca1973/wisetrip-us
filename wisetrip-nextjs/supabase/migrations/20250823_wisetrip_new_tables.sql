-- WiseTrip New Tables Migration
-- Created: 2025-08-23
-- Description: Creates all necessary tables for WiseTrip application features

-- User preferences and AI profile
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  interests text[] default '{}',
  budget_range text default 'medium',
  travel_style text default 'balanced',
  ai_profile jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Businesses for B2B portal
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  category text not null,
  location text not null,
  contact_email text,
  contact_phone text,
  website_url text,
  verified boolean default false,
  subscription_tier text default 'basic',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Business listings/offerings
create table if not exists public.business_listings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  price_range text,
  location text not null,
  coordinates point,
  amenities text[] default '{}',
  images text[] default '{}',
  availability_schedule jsonb default '{}'::jsonb,
  featured boolean default false,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tourist offices for B2B portal
create table if not exists public.tourist_offices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  region text not null,
  country text not null,
  contact_email text,
  contact_phone text,
  website_url text,
  verified boolean default false,
  subscription_tier text default 'basic',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tourist office campaigns
create table if not exists public.tourist_campaigns (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references public.tourist_offices(id) on delete cascade,
  title text not null,
  description text not null,
  target_audience jsonb default '{}'::jsonb,
  budget_allocated decimal(10,2),
  start_date date,
  end_date date,
  status text default 'draft',
  created_at timestamptz default now(),
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

-- User feedback on AI suggestions
create table if not exists public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  itinerary_id uuid references public.itineraries(id) on delete cascade,
  feedback_type text not null, -- 'like', 'dislike', 'modify'
  feedback_data jsonb,
  created_at timestamptz default now()
);

-- User subscriptions for monetization
create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tier text not null default 'free', -- 'free', 'premium', 'enterprise'
  stripe_subscription_id text unique,
  stripe_customer_id text,
  status text default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Business payments and transactions
create table if not exists public.business_payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  stripe_payment_intent_id text unique,
  amount decimal(10,2) not null,
  currency text default 'usd',
  service_type text not null, -- 'listing_boost', 'featured_placement', 'campaign'
  service_duration_days integer,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User saved destinations and favorites
create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null, -- 'destination', 'business_listing', 'itinerary'
  item_id uuid not null,
  created_at timestamptz default now()
);

-- Travel logs and experiences
create table if not exists public.travel_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  itinerary_id uuid references public.itineraries(id),
  destination text not null,
  visit_date date,
  rating integer check (rating >= 1 and rating <= 5),
  review_text text,
  photos text[] default '{}',
  public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Analytics and usage tracking
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

-- Create indexes for better performance
create index if not exists idx_user_preferences_user_id on public.user_preferences(user_id);
create index if not exists idx_businesses_owner_id on public.businesses(owner_id);
create index if not exists idx_businesses_category on public.businesses(category);
create index if not exists idx_businesses_location on public.businesses(location);
create index if not exists idx_business_listings_business_id on public.business_listings(business_id);
create index if not exists idx_business_listings_category on public.business_listings(category);
create index if not exists idx_business_listings_location on public.business_listings(location);
create index if not exists idx_tourist_offices_owner_id on public.tourist_offices(owner_id);
create index if not exists idx_tourist_offices_region on public.tourist_offices(region);
create index if not exists idx_tourist_campaigns_office_id on public.tourist_campaigns(office_id);
create index if not exists idx_itineraries_user_id on public.itineraries(user_id);
create index if not exists idx_itineraries_destination on public.itineraries(destination);
create index if not exists idx_ai_feedback_user_id on public.ai_feedback(user_id);
create index if not exists idx_ai_feedback_itinerary_id on public.ai_feedback(itinerary_id);
create index if not exists idx_user_subscriptions_user_id on public.user_subscriptions(user_id);
create index if not exists idx_user_subscriptions_stripe_customer_id on public.user_subscriptions(stripe_customer_id);
create index if not exists idx_business_payments_business_id on public.business_payments(business_id);
create index if not exists idx_user_favorites_user_id on public.user_favorites(user_id);
create index if not exists idx_user_favorites_item_type_id on public.user_favorites(item_type, item_id);
create index if not exists idx_travel_logs_user_id on public.travel_logs(user_id);
create index if not exists idx_travel_logs_destination on public.travel_logs(destination);
create index if not exists idx_usage_analytics_user_id on public.usage_analytics(user_id);
create index if not exists idx_usage_analytics_event_type on public.usage_analytics(event_type);
create index if not exists idx_usage_analytics_created_at on public.usage_analytics(created_at);

-- Enable Row Level Security (RLS) on all tables
alter table public.user_preferences enable row level security;
alter table public.businesses enable row level security;
alter table public.business_listings enable row level security;
alter table public.tourist_offices enable row level security;
alter table public.tourist_campaigns enable row level security;
alter table public.itineraries enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.business_payments enable row level security;
alter table public.user_favorites enable row level security;
alter table public.travel_logs enable row level security;
alter table public.usage_analytics enable row level security;

-- Create RLS policies
-- User preferences: users can only access their own data
create policy "Users can view own preferences" on public.user_preferences
  for select using (auth.uid() = user_id);
create policy "Users can update own preferences" on public.user_preferences
  for update using (auth.uid() = user_id);
create policy "Users can insert own preferences" on public.user_preferences
  for insert with check (auth.uid() = user_id);

-- Businesses: owners can manage their businesses, others can view active ones
create policy "Business owners can manage their businesses" on public.businesses
  for all using (auth.uid() = owner_id);
create policy "Everyone can view verified businesses" on public.businesses
  for select using (verified = true);

-- Business listings: follow business permissions + public viewing of active listings
create policy "Business owners can manage their listings" on public.business_listings
  for all using (exists (
    select 1 from public.businesses 
    where id = business_listings.business_id 
    and owner_id = auth.uid()
  ));
create policy "Everyone can view active listings" on public.business_listings
  for select using (active = true);

-- Tourist offices: similar to businesses
create policy "Tourist office owners can manage" on public.tourist_offices
  for all using (auth.uid() = owner_id);
create policy "Everyone can view verified tourist offices" on public.tourist_offices
  for select using (verified = true);

-- Tourist campaigns: office owners can manage
create policy "Tourist office owners can manage campaigns" on public.tourist_campaigns
  for all using (exists (
    select 1 from public.tourist_offices 
    where id = tourist_campaigns.office_id 
    and owner_id = auth.uid()
  ));

-- Itineraries: users can manage their own
create policy "Users can manage own itineraries" on public.itineraries
  for all using (auth.uid() = user_id or user_id is null);

-- AI feedback: users can manage their own
create policy "Users can manage own feedback" on public.ai_feedback
  for all using (auth.uid() = user_id or user_id is null);

-- User subscriptions: users can view their own
create policy "Users can view own subscriptions" on public.user_subscriptions
  for select using (auth.uid() = user_id);

-- Business payments: business owners can view their payments
create policy "Business owners can view their payments" on public.business_payments
  for select using (exists (
    select 1 from public.businesses 
    where id = business_payments.business_id 
    and owner_id = auth.uid()
  ));

-- User favorites: users can manage their own
create policy "Users can manage own favorites" on public.user_favorites
  for all using (auth.uid() = user_id);

-- Travel logs: users can manage their own, others can view public ones
create policy "Users can manage own travel logs" on public.travel_logs
  for all using (auth.uid() = user_id);
create policy "Everyone can view public travel logs" on public.travel_logs
  for select using (public = true);

-- Usage analytics: service role only (no public access)
create policy "Service role can manage analytics" on public.usage_analytics
  for all using (auth.jwt()->>'role' = 'service_role');
