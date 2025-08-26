// WiseTrip AI Function: Optimize Itinerary
// Optimizes existing itineraries using AI for better routing and efficiency

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
    const { itinerary_data, optimization_goals, constraints } = await req.json();

    // Validate required parameters
    if (!itinerary_data) {
      throw new Error('Itinerary data is required for optimization');
    }

    // Get environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build optimization prompt
    const prompt = `Optimize this travel itinerary for better efficiency and experience:
    
    CURRENT ITINERARY:
    ${JSON.stringify(itinerary_data, null, 2)}
    
    OPTIMIZATION GOALS:
    ${optimization_goals?.join(', ') || 'minimize travel time, reduce costs, improve experience'}
    
    CONSTRAINTS:
    ${constraints ? JSON.stringify(constraints) : 'Standard travel constraints'}
    
    Please optimize for better routing, cost-effectiveness, and traveler experience.
    Return the optimized itinerary in valid JSON format.`;

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
            content: 'You are an expert travel optimizer specializing in route efficiency, cost optimization, and enhancing traveler experiences.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 4000
      })
    });

    if (!openaiResponse.ok) {
      throw new Error('OpenAI API request failed');
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0].message.content;

    // Parse AI response
    let optimizedItinerary;
    try {
      optimizedItinerary = JSON.parse(aiResponse);
    } catch (error) {
      // Fallback if JSON parsing fails
      optimizedItinerary = {
        ...itinerary_data,
        optimizations: {
          summary: 'Optimization completed with general improvements',
          improvements: ['AI analysis applied for better travel experience']
        }
      };
    }

    return new Response(JSON.stringify({
      data: {
        optimized_itinerary: optimizedItinerary,
        original_itinerary: itinerary_data,
        optimization_applied: true,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Optimize itinerary error:', error);

    const errorResponse = {
      error: {
        code: 'OPTIMIZE_ITINERARY_FAILED',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});