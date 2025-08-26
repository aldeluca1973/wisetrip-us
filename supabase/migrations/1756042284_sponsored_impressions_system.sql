-- Migration: sponsored_impressions_system
-- Created at: 1756042284

-- Sponsored Impressions System for WiseTrip
-- Server-side caps enforcement and tracking

CREATE TABLE IF NOT EXISTS sponsored_impressions (
    id BIGSERIAL PRIMARY KEY,
    advertiser_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    business_id BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
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
    caps_reached JSONB DEFAULT '{}'::jsonb, -- Track which caps were hit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, cap_date)
);

CREATE INDEX IF NOT EXISTS idx_sponsored_daily_caps_date_campaign 
    ON sponsored_daily_caps(cap_date, campaign_id);

-- Function to check and enforce daily caps
CREATE OR REPLACE FUNCTION check_sponsored_caps(
    p_campaign_id BIGINT,
    p_impression_cost DECIMAL DEFAULT 0,
    p_is_click BOOLEAN DEFAULT FALSE
) RETURNS JSONB AS $$
DECLARE
    v_campaign sponsored_campaigns%ROWTYPE;
    v_daily_caps sponsored_daily_caps%ROWTYPE;
    v_today DATE := CURRENT_DATE;
    v_result JSONB := '{}'::jsonb;
    v_click_cost DECIMAL := 0;
BEGIN
    -- Get campaign details
    SELECT * INTO v_campaign FROM sponsored_campaigns 
    WHERE id = p_campaign_id AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'campaign_inactive');
    END IF;
    
    -- Get or create daily caps record
    INSERT INTO sponsored_daily_caps (
        campaign_id, cap_date, impressions_limit, 
        clicks_limit, daily_budget_limit
    ) VALUES (
        p_campaign_id, v_today, v_campaign.daily_impressions_limit,
        v_campaign.daily_clicks_limit, v_campaign.daily_budget
    ) ON CONFLICT (campaign_id, cap_date) 
    DO UPDATE SET updated_at = NOW()
    RETURNING * INTO v_daily_caps;
    
    -- Check budget cap
    IF v_daily_caps.budget_spent + p_impression_cost + 
       (CASE WHEN p_is_click THEN p_impression_cost * 5 ELSE 0 END) > v_daily_caps.daily_budget_limit THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'budget_exceeded');
    END IF;
    
    -- Check impressions cap
    IF v_daily_caps.impressions_served >= v_daily_caps.impressions_limit THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'impressions_exceeded');
    END IF;
    
    -- Check clicks cap (if this is a click)
    IF p_is_click AND v_daily_caps.clicks_served >= v_daily_caps.clicks_limit THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'clicks_exceeded');
    END IF;
    
    RETURN jsonb_build_object('allowed', true, 'remaining_budget', 
        v_daily_caps.daily_budget_limit - v_daily_caps.budget_spent);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update daily caps automatically
CREATE OR REPLACE FUNCTION update_sponsored_caps() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update impression count and budget
        UPDATE sponsored_daily_caps 
        SET 
            impressions_served = impressions_served + 1,
            budget_spent = budget_spent + COALESCE(NEW.cost_per_impression, 0),
            updated_at = NOW()
        WHERE campaign_id = (
            SELECT id FROM sponsored_campaigns 
            WHERE advertiser_id = NEW.advertiser_id 
            AND status = 'active' 
            LIMIT 1
        ) AND cap_date = DATE(NEW.displayed_at);
        
    ELSIF TG_OP = 'UPDATE' AND OLD.clicked_at IS NULL AND NEW.clicked_at IS NOT NULL THEN
        -- Update click count and budget
        UPDATE sponsored_daily_caps 
        SET 
            clicks_served = clicks_served + 1,
            budget_spent = budget_spent + COALESCE(NEW.cost_per_click, 0),
            updated_at = NOW()
        WHERE campaign_id = (
            SELECT id FROM sponsored_campaigns 
            WHERE advertiser_id = NEW.advertiser_id 
            AND status = 'active' 
            LIMIT 1
        ) AND cap_date = DATE(NEW.displayed_at);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sponsored_caps_trigger ON sponsored_impressions;
CREATE TRIGGER sponsored_caps_trigger
    AFTER INSERT OR UPDATE ON sponsored_impressions
    FOR EACH ROW EXECUTE FUNCTION update_sponsored_caps();

-- Sample sponsored campaigns data
INSERT INTO sponsored_campaigns (
    advertiser_id, campaign_name, daily_budget, daily_impressions_limit,
    daily_clicks_limit, start_date, end_date, total_budget, status
) VALUES
    ((SELECT id FROM profiles LIMIT 1), 'Winter Adventure Packages', 250.00, 1500, 75, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 7500.00, 'active'),
    ((SELECT id FROM profiles LIMIT 1), 'Cultural Heritage Tours', 180.00, 1200, 60, CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 10800.00, 'active')
ON CONFLICT DO NOTHING;;