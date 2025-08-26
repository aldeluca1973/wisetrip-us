import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// Inline helper functions
function getSupabase(req: Request) {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const client = createClient(url, key, {
    auth: {
      persistSession: false
    }
  });
  return { supabase: client };
}

function getUserId(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  
  try {
    const token = authHeader.replace("Bearer ", "");
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  } catch {
    return null;
  }
}

async function llmJSON(system: string, user: unknown) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(user) }
      ]
    })
  });
  
  if (!r.ok) {
    throw new Error(`OpenAI API error: ${r.status} ${r.statusText}`);
  }
  
  const data = await r.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error("No content received from OpenAI API");
  }
  
  return JSON.parse(content);
}

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
    const { supabase } = getSupabase(req);
    const userId = getUserId(req);
    
    if (!userId) {
      return new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const requestData = await req.json();
    const { destination, duration_days, budget_range, travel_style, interests } = requestData;

    if (!destination || !duration_days) {
      return new Response(JSON.stringify({ error: { code: 'INVALID_INPUT', message: 'Destination and duration are required' } }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user preferences if not provided
    const { data: userPrefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    const finalInterests = interests || userPrefs?.interests || [];
    const finalBudgetRange = budget_range || userPrefs?.budget_range || 'medium';
    const finalTravelStyle = travel_style || userPrefs?.travel_style || 'balanced';

    // AI System prompt for deterministic itinerary generation
    const systemPrompt = `You are WiseTrip AI, an expert travel planner. Generate a detailed, personalized itinerary based on the provided criteria. \n\nRESPONSE FORMAT: Return a JSON object with this exact structure:\n{\n  "title": "string - catchy itinerary title",\n  "overview": "string - brief overview of the trip",\n  "total_estimated_cost": "string - cost range estimate",\n  "days": [\n    {\n      "day_number": number,\n      "title": "string - day theme/title",\n      "activities": [\n        {\n          "time": "string - time slot (e.g., '9:00 AM')",\n          "activity": "string - activity name",\n          "description": "string - detailed description",\n          "location": "string - specific location/address",\n          "estimated_cost": "string - cost estimate",\n          "tips": "string - helpful tips"\n        }\n      ],\n      "meals": {\n        "breakfast": "string - breakfast recommendation",\n        "lunch": "string - lunch recommendation", \n        "dinner": "string - dinner recommendation"\n      },\n      "accommodation_tip": "string - where to stay suggestions"\n    }\n  ],\n  "packing_list": ["string array - essential items to pack"],\n  "budget_breakdown": {\n    "accommodation": "string - cost range",\n    "food": "string - cost range",\n    "activities": "string - cost range",\n    "transportation": "string - cost range"\n  },\n  "local_tips": ["string array - insider tips and cultural insights"]\n}\n\nGUIDELINES:\n- Tailor recommendations to the specified budget range (budget/medium/luxury)\n- Incorporate the travel style preferences (adventure/cultural/relaxed/balanced)\n- Include specific, real places and activities in the destination\n- Provide practical, actionable information\n- Consider interests when selecting activities\n- Balance popular attractions with hidden gems\n- Include realistic time estimates and costs\n- Add cultural sensitivity and local etiquette tips`;

    const userInput = {
      destination,
      duration_days,
      budget_range: finalBudgetRange,
      travel_style: finalTravelStyle,
      interests: finalInterests
    };

    // Generate itinerary using AI
    const aiResponse = await llmJSON(systemPrompt, userInput);
    
    // Save to database
    const { data: itinerary, error: dbError } = await supabase
      .from('itineraries')
      .insert({
        user_id: userId,
        title: aiResponse.title,
        destination,
        duration_days,
        budget_range: finalBudgetRange,
        travel_style: finalTravelStyle,
        itinerary_data: aiResponse,
        ai_prompt_used: systemPrompt
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(JSON.stringify({ error: { code: 'DB_ERROR', message: 'Failed to save itinerary' } }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Track usage analytics
    await supabase.from('usage_analytics').insert({
      user_id: userId,
      event_type: 'itinerary_generated',
      event_data: {
        destination,
        duration_days,
        budget_range: finalBudgetRange,
        travel_style: finalTravelStyle,
        itinerary_id: itinerary.id
      }
    });

    return new Response(JSON.stringify({ data: itinerary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI Itinerary error:', error);
    const errorResponse = {
      error: {
        code: 'FUNCTION_ERROR',
        message: error.message || 'Failed to generate itinerary'
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
