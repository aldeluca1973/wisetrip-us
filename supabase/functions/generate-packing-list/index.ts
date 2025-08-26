// WiseTrip AI Function: Generate Packing List
// Generates comprehensive packing lists based on destination, activities, and weather

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
    const { destination, duration_days, activities, weather_conditions, travel_style, special_requirements } = await req.json();

    // Validate required parameters
    if (!destination || !duration_days) {
      throw new Error('Destination and duration are required');
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

    // Build AI prompt
    const prompt = `Generate a comprehensive packing list for a trip to ${destination} for ${duration_days} days.
    
    Trip details:
    - Destination: ${destination}
    - Duration: ${duration_days} days
    - Activities: ${activities?.join(', ') || 'general tourism'}
    - Weather expected: ${weather_conditions || 'varied conditions'}
    - Travel style: ${travel_style || 'standard'}
    - Special requirements: ${special_requirements || 'none'}
    
    Provide a detailed, categorized packing list with clothing, personal care, electronics, documents, activity-specific equipment, health items, and local recommendations.
    Return as valid JSON with categories and items.`;

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
            content: 'You are an expert travel packing advisor. Create comprehensive, practical packing lists tailored to specific destinations, activities, and weather conditions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 3000
      })
    });

    if (!openaiResponse.ok) {
      throw new Error('OpenAI API request failed');
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0].message.content;

    // Parse AI response
    let packingData;
    try {
      packingData = JSON.parse(aiResponse);
    } catch (error) {
      // Fallback if JSON parsing fails
      packingData = {
        title: `Packing List for ${destination}`,
        destination: destination,
        duration_days: duration_days,
        categories: [{
          name: 'Essentials',
          items: [{
            item: 'Passport and documents',
            quantity: '1 set',
            essential: true
          }]
        }],
        tips: ['Pack light and bring essentials only']
      };
    }

    // Save to database if user is authenticated
    let savedPackingList = null;
    if (userId && supabaseUrl && serviceRoleKey) {
      const insertData = {
        user_id: userId,
        title: packingData.title,
        destination: destination,
        duration_days: duration_days,
        weather_conditions: weather_conditions,
        activities: activities || [],
        items: packingData
      };

      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/packing_lists`, {
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
        savedPackingList = insertResult[0];
      }
    }

    return new Response(JSON.stringify({
      data: {
        packing_list: packingData,
        saved_list: savedPackingList,
        ai_generated: true,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Generate packing list error:', error);

    const errorResponse = {
      error: {
        code: 'GENERATE_PACKING_LIST_FAILED',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});