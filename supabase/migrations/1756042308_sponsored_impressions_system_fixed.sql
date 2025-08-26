-- Migration: sponsored_impressions_system_fixed
-- Created at: 1756042308

-- Sponsored Impressions System for WiseTrip - Fixed types
-- Server-side caps enforcement and tracking

CREATE TABLE IF NOT EXISTS sponsored_impressions (
    id BIGSERIAL PRIMARY KEY,
    advertiser_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    impression_type VARCHAR(50) NOT NULL CHECK (impression_type IN ('search_result', 'suggestion', 'map_pin', 'detail_view')),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    displayed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    clicked_at TIMESTAMP WITH TIME ZONE,
    converted_at TIMESTAMP WITH TIME ZONE,
    cost_per_impression DECIMAL(10,4) DEFAULT 0,
    cost_per_click DECIMAL(10,4) DEFAULT 0,
    daily_budget_remaining DECIMAL(10,2),
    campaign_id VARCHAR(255),
    position_rank INTEGER,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(10,8),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsored_impressions_advertiser_date 
    ON sponsored_impressions(advertiser_id, DATE(displayed_at));
CREATE INDEX IF NOT EXISTS idx_sponsored_impressions_business_date 
    ON sponsored_impressions(business_id, DATE(displayed_at));
CREATE INDEX IF NOT EXISTS idx_sponsored_impressions_user_session 
    ON sponsored_impressions(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_sponsored_impressions_campaign 
    ON sponsored_impressions(campaign_id, displayed_at);

-- Sponsored campaigns table for budget management
CREATE TABLE IF NOT EXISTS sponsored_campaigns (
    id BIGSERIAL PRIMARY KEY,
    advertiser_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    campaign_name VARCHAR(255) NOT NULL,
    daily_budget DECIMAL(10,2) NOT NULL CHECK (daily_budget > 0),
    daily_impressions_limit INTEGER DEFAULT 1000,
    daily_clicks_limit INTEGER DEFAULT 100,
    target_audience JSONB DEFAULT '{}'::jsonb,
    geo_targeting JSONB DEFAULT '{}'::jsonb,
    keywords TEXT[],
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    start_date DATE NOT NULL,
    end_date DATE,
    total_budget DECIMAL(12,2),
    total_spent DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsored_campaigns_advertiser_status 
    ON sponsored_campaigns(advertiser_id, status);
CREATE INDEX IF NOT EXISTS idx_sponsored_campaigns_dates 
    ON sponsored_campaigns(start_date, end_date);

-- Daily caps tracking table
CREATE TABLE IF NOT EXISTS sponsored_daily_caps (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT REFERENCES sponsored_campaigns(id) ON DELETE CASCADE,
    cap_date DATE NOT NULL,
    impressions_served INTEGER DEFAULT 0,
    clicks_served INTEGER DEFAULT 0,
    budget_spent DECIMAL(10,2) DEFAULT 0,
    impressions_limit INTEGER NOT NULL,
    clicks_limit INTEGER NOT NULL,
    daily_budget_limit DECIMAL(10,2) NOT NULL,
    caps_reached JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, cap_date)
);

CREATE INDEX IF NOT EXISTS idx_sponsored_daily_caps_date_campaign 
    ON sponsored_daily_caps(cap_date, campaign_id);;