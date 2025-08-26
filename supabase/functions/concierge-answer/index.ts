// WiseTrip AI Function: Concierge Answer
// AI-powered travel concierge for answering travel questions

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
    const { question, context, conversation_id, travel_data } = await req.json();

    // Validate required parameters
    if (!question) {
      throw new Error('Question is required');
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

    // Get existing conversation context if conversation_id provided
    let conversationHistory = [];
    if (conversation_id && supabaseUrl && serviceRoleKey) {
      const conversationResponse = await fetch(`${supabaseUrl}/rest/v1/ai_conversations?id=eq.${conversation_id}`, {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        }
      });
      
      if (conversationResponse.ok) {
        const conversations = await conversationResponse.json();
        if (conversations.length > 0) {
          conversationHistory = conversations[0].messages || [];
        }
      }
    }

    // Build conversation context
    const contextInfo = {
      travel_data: travel_data || {},
      user_context: context || {},
      conversation_history: conversationHistory
    };

    // Build AI prompt with context
    const prompt = `You are WiseTrip's AI travel concierge. Answer this travel question with helpful, accurate, and personalized advice:
    
    QUESTION: ${question}
    
    CONTEXT:
    ${JSON.stringify(contextInfo, null, 2)}
    
    Provide a comprehensive, helpful response that:
    1. Directly answers their question
    2. Offers practical, actionable advice
    3. Includes relevant tips and insights
    4. Suggests follow-up actions if appropriate
    5. Maintains a friendly, professional tone
    
    Format as JSON:
    {
      "answer": "Comprehensive answer to the question",
      "key_points": [
        "Main point 1",
        "Main point 2"
      ],
      "practical_tips": [
        "Actionable tip 1",
        "Actionable tip 2"
      ],
      "follow_up_suggestions": [
        "Suggested next question or action",
        "Related topic to explore"
      ],
      "confidence_level": 95,
      "sources_recommended": [
        "Official tourism website",
        "Local travel resources"
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
            content: 'You are WiseTrip\'s expert AI travel concierge. Provide helpful, accurate travel advice with a warm, professional tone. Draw on comprehensive travel knowledge to give practical, actionable responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 2500
      })
    });

    if (!openaiResponse.ok) {
      throw new Error('OpenAI API request failed');
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0].message.content;

    // Parse AI response
    let conciergeResponse;
    try {
      conciergeResponse = JSON.parse(aiResponse);
    } catch (error) {
      // Fallback if JSON parsing fails
      conciergeResponse = {
        answer: aiResponse,
        key_points: ['AI-generated travel advice'],
        practical_tips: ['Consult additional sources for specific details'],
        follow_up_suggestions: ['Feel free to ask more specific questions'],
        confidence_level: 80
      };
    }

    // Save conversation to database if user is authenticated
    let savedConversation = null;
    if (userId && supabaseUrl && serviceRoleKey) {
      const newMessage = {
        role: 'user',
        content: question,
        timestamp: new Date().toISOString()
      };
      
      const aiMessage = {
        role: 'assistant',
        content: conciergeResponse.answer,
        timestamp: new Date().toISOString(),
        confidence: conciergeResponse.confidence_level
      };

      const updatedMessages = [...conversationHistory, newMessage, aiMessage];

      if (conversation_id) {
        // Update existing conversation
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/ai_conversations?id=eq.${conversation_id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: updatedMessages,
            last_message_at: new Date().toISOString()
          })
        });
        
        if (updateResponse.ok) {
          savedConversation = { id: conversation_id, updated: true };
        }
      } else {
        // Create new conversation
        const insertData = {
          user_id: userId,
          conversation_type: 'concierge',
          messages: updatedMessages,
          context_data: contextInfo,
          last_message_at: new Date().toISOString()
        };

        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/ai_conversations`, {
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
          savedConversation = insertResult[0];
        }
      }
    }

    return new Response(JSON.stringify({
      data: {
        response: conciergeResponse,
        conversation: savedConversation,
        ai_generated: true,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Concierge answer error:', error);

    const errorResponse = {
      error: {
        code: 'CONCIERGE_ANSWER_FAILED',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});