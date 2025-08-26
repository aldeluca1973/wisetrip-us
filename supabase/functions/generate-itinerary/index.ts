// WiseTrip AI Function: Generate Itinerary
// Generates personalized travel itineraries using OpenAI

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
    const { destination, duration_days, budget_range, travel_style, interests, preferences } = await req.json();

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
    const prompt = `Generate a detailed travel itinerary for ${destination} for ${duration_days} days.
    
Travel preferences:
    - Budget: ${budget_range || 'moderate'}
    - Style: ${travel_style || 'balanced'}
    - Interests: ${interests?.join(', ') || 'general tourism'}
    ${preferences ? `- Additional preferences: ${JSON.stringify(preferences)}` : ''}
    
Provide a comprehensive itinerary with day-by-day activities, restaurants, accommodations, and backup options.
    Return as valid JSON.`;

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
            content: 'You are an expert travel planner. Generate detailed, practical itineraries with accurate information and valid JSON responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!openaiResponse.ok) {
      throw new Error('OpenAI API request failed');
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0].message.content;

    // Parse AI response
    let itineraryData;
    try {
      itineraryData = JSON.parse(aiResponse);
    } catch (error) {
      // Fallback if JSON parsing fails
      itineraryData = {
        title: `${destination} Adventure`,
        overview: aiResponse,
        total_budget_estimate: 1000,
        currency: 'USD',
        days: []
      };
    }

    // Save to database if user is authenticated
    let savedItinerary = null;
    if (userId && supabaseUrl && serviceRoleKey) {
      const insertData = {
        user_id: userId,
        title: itineraryData.title,
        destination: destination,
        duration_days: duration_days,
        budget_range: budget_range,
        travel_style: travel_style,
        itinerary_data: itineraryData,
        ai_prompt_used: prompt
      };

      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/itineraries`, {
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
        savedItinerary = insertResult[0];
      }
    }

    return new Response(JSON.stringify({
      data: {
        itinerary: itineraryData,
        saved_itinerary: savedItinerary,
        ai_generated: true,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Generate itinerary error:', error);

    const errorResponse = {
      error: {
        code: 'GENERATE_ITINERARY_FAILED',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});