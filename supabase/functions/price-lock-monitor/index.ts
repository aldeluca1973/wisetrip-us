// WiseTrip AI Function: Price Lock Monitor
// Monitors and analyzes price changes for transparency

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { action, listing_id, business_id, current_price, currency } = await req.json();

    // Validate required parameters
    if (!action) {
      throw new Error('Action is required (monitor, lock, check)');
    }

    // Get environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get user from auth header
    let userId = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': serviceRoleKey
        }
      });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        userId = userData.id;
      }
    }

    if (action === 'lock' && current_price && userId) {
      // Create a price lock
      const lockExpiresAt = new Date();
      lockExpiresAt.setHours(lockExpiresAt.getHours() + 24); // 24-hour lock

      const insertData = {
        user_id: userId,
        listing_id: listing_id,
        business_id: business_id,
        original_price: current_price,
        locked_price: current_price,
        currency: currency || 'USD',
        lock_expires_at: lockExpiresAt.toISOString(),
        status: 'active'
      };

      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/price_locks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(insertData)
      });

      if (insertResponse.ok) {
        const insertResult = await insertResponse.json();
        return new Response(JSON.stringify({
          data: {
            price_lock: insertResult[0],
            action: 'lock_created',
            message: 'Price locked for 24 hours'
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (action === 'check' && userId) {
      // Check existing price locks for user
      const userLocksResponse = await fetch(`${supabaseUrl}/rest/v1/price_locks?user_id=eq.${userId}&status=eq.active`, {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        }
      });

      if (userLocksResponse.ok) {
        const userLocks = await userLocksResponse.json();
        return new Response(JSON.stringify({
          data: {
            active_locks: userLocks,
            action: 'locks_retrieved',
            count: userLocks.length
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (action === 'monitor') {
      // Use AI to analyze price trends and provide insights
      const prompt = `Analyze this travel pricing scenario and provide insights:
      
      Listing ID: ${listing_id || 'N/A'}
      Current Price: ${current_price || 'N/A'} ${currency || 'USD'}
      
      Provide price monitoring insights including:
      1. General pricing trends for this type of service
      2. Best booking timing recommendations
      3. Price volatility assessment
      4. Money-saving tips
      5. When to lock in prices
      
      Format as JSON:
      {
        "analysis": {
          "price_trend": "increasing/decreasing/stable",
          "volatility": "high/medium/low",
          "confidence": 85,
          "best_booking_window": "2-4 weeks ahead"
        },
        "recommendations": [
          "Book now if price is favorable",
          "Wait for potential price drops"
        ],
        "insights": [
          "Insight about pricing patterns",
          "Local market conditions"
        ],
        "money_saving_tips": [
          "Tip 1",
          "Tip 2"
        ]
      }`;

      // Call OpenAI API
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a travel pricing analyst with expertise in market trends, booking strategies, and cost optimization. Provide practical, data-driven insights about travel pricing.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.4,
          max_tokens: 2000
        })
      });

      if (!openaiResponse.ok) {
        throw new Error('OpenAI API request failed');
      }

      const openaiData = await openaiResponse.json();
      const aiResponse = openaiData.choices[0].message.content;

      // Parse AI response
      let analysisData;
      try {
        analysisData = JSON.parse(aiResponse);
      } catch (error) {
        // Fallback if JSON parsing fails
        analysisData = {
          analysis: {
            price_trend: 'stable',
            volatility: 'medium',
            confidence: 75
          },
          recommendations: ['Monitor prices regularly'],
          insights: [aiResponse],
          money_saving_tips: ['Book in advance for better deals']
        };
      }

      return new Response(JSON.stringify({
        data: {
          price_analysis: analysisData,
          monitoring_active: true,
          timestamp: new Date().toISOString()
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('Price lock monitor error:', error);

    const errorResponse = {
      error: {
        code: 'PRICE_LOCK_MONITOR_FAILED',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});