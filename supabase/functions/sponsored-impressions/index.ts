// Sponsored Impressions Management with Server-Side Caps Enforcement

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { 
      action, 
      business_id, 
      impression_type = 'search_result',
      user_id,
      session_id,
      location_lat,
      location_lng,
      campaign_id 
    } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!serviceKey) {
      throw new Error('Service key not available');
    }

    if (action === 'check_caps') {
      // Check if impression can be served based on daily caps
      const today = new Date().toISOString().split('T')[0];
      
      // Get active campaigns for the advertiser
      const campaignsResponse = await fetch(
        `${supabaseUrl}/rest/v1/sponsored_campaigns?status=eq.active&select=*`, {
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Content-Type': 'application/json'
        }
      });

      const campaigns = await campaignsResponse.json();
      if (!campaigns || campaigns.length === 0) {
        return new Response(JSON.stringify({
          allowed: false,
          reason: 'no_active_campaigns'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check caps for each campaign
      for (const campaign of campaigns) {
        const capsResponse = await fetch(
          `${supabaseUrl}/rest/v1/sponsored_daily_caps?campaign_id=eq.${campaign.id}&cap_date=eq.${today}`, {
          headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey
          }
        });

        const caps = await capsResponse.json();
        let dailyCap = caps[0];

        // Create daily cap record if it doesn't exist
        if (!dailyCap) {
          const createResponse = await fetch(`${supabaseUrl}/rest/v1/sponsored_daily_caps`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${serviceKey}`,
              'apikey': serviceKey,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              campaign_id: campaign.id,
              cap_date: today,
              impressions_limit: campaign.daily_impressions_limit,
              clicks_limit: campaign.daily_clicks_limit,
              daily_budget_limit: campaign.daily_budget
            })
          });
          dailyCap = (await createResponse.json())[0];
        }

        // Check if caps allow this impression
        const budgetCheck = dailyCap.budget_spent + 0.05; // Cost per impression
        const impressionCheck = dailyCap.impressions_served + 1;

        if (budgetCheck > dailyCap.daily_budget_limit) {
          continue; // Try next campaign
        }

        if (impressionCheck > dailyCap.impressions_limit) {
          continue; // Try next campaign
        }

        // This campaign can serve the impression
        return new Response(JSON.stringify({
          allowed: true,
          campaign_id: campaign.id,
          remaining_budget: dailyCap.daily_budget_limit - dailyCap.budget_spent,
          remaining_impressions: dailyCap.impressions_limit - dailyCap.impressions_served
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // No campaigns can serve impression
      return new Response(JSON.stringify({
        allowed: false,
        reason: 'all_caps_exceeded'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'record_impression') {
      // Record the impression and update caps
      if (!business_id || !campaign_id) {
        throw new Error('business_id and campaign_id required for recording impression');
      }

      // Get advertiser from campaign
      const campaignResponse = await fetch(
        `${supabaseUrl}/rest/v1/sponsored_campaigns?id=eq.${campaign_id}&select=advertiser_id`, {
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey
        }
      });
      const campaignData = await campaignResponse.json();
      
      if (!campaignData || campaignData.length === 0) {
        throw new Error('Campaign not found');
      }

      const advertiser_id = campaignData[0].advertiser_id;

      // Record impression
      const impressionResponse = await fetch(`${supabaseUrl}/rest/v1/sponsored_impressions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          advertiser_id,
          business_id,
          impression_type,
          user_id,
          session_id,
          campaign_id,
          location_lat,
          location_lng,
          cost_per_impression: 0.05,
          position_rank: 1
        })
      });

      if (!impressionResponse.ok) {
        throw new Error('Failed to record impression');
      }

      const impression = await impressionResponse.json();

      // Update daily caps
      const today = new Date().toISOString().split('T')[0];
      await fetch(`${supabaseUrl}/rest/v1/sponsored_daily_caps?campaign_id=eq.${campaign_id}&cap_date=eq.${today}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          impressions_served: 'sponsored_daily_caps.impressions_served + 1',
          budget_spent: 'sponsored_daily_caps.budget_spent + 0.05'
        })
      });

      return new Response(JSON.stringify({
        success: true,
        impression_id: impression[0].id,
        message: 'Impression recorded and caps updated'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'record_click') {
      // Update impression with click timestamp and adjust caps
      const { impression_id } = await req.json();
      
      if (!impression_id) {
        throw new Error('impression_id required for recording click');
      }

      // Update impression with click timestamp
      const clickResponse = await fetch(
        `${supabaseUrl}/rest/v1/sponsored_impressions?id=eq.${impression_id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clicked_at: new Date().toISOString(),
          cost_per_click: 0.25
        })
      });

      if (!clickResponse.ok) {
        throw new Error('Failed to record click');
      }

      // Update daily caps for clicks
      const today = new Date().toISOString().split('T')[0];
      await fetch(`${supabaseUrl}/rest/v1/sponsored_daily_caps?campaign_id=eq.${campaign_id}&cap_date=eq.${today}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clicks_served: 'sponsored_daily_caps.clicks_served + 1',
          budget_spent: 'sponsored_daily_caps.budget_spent + 0.25'
        })
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'Click recorded and caps updated'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'get_analytics') {
      // Get sponsored impressions analytics
      const { start_date, end_date, campaign_id: filter_campaign } = await req.json();
      
      let query = `${supabaseUrl}/rest/v1/sponsored_impressions?select=*,businesses(name),sponsored_campaigns(campaign_name)`;
      
      if (filter_campaign) {
        query += `&campaign_id=eq.${filter_campaign}`;
      }
      
      if (start_date) {
        query += `&displayed_at=gte.${start_date}`;
      }
      
      if (end_date) {
        query += `&displayed_at=lte.${end_date}`;
      }

      const analyticsResponse = await fetch(query, {
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey
        }
      });

      const data = await analyticsResponse.json();
      
      // Calculate summary metrics
      const metrics = {
        total_impressions: data.length,
        total_clicks: data.filter(imp => imp.clicked_at).length,
        total_cost: data.reduce((sum, imp) => sum + (parseFloat(imp.cost_per_impression) || 0) + (parseFloat(imp.cost_per_click) || 0), 0),
        ctr: data.length > 0 ? (data.filter(imp => imp.clicked_at).length / data.length * 100).toFixed(2) : 0,
        avg_cost_per_impression: data.length > 0 ? (data.reduce((sum, imp) => sum + (parseFloat(imp.cost_per_impression) || 0), 0) / data.length).toFixed(4) : 0
      };

      return new Response(JSON.stringify({
        success: true,
        data,
        metrics
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('Sponsored impressions error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});