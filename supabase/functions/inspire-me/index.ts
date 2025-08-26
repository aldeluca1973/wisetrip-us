// Enhanced Inspire Me function with strict Zod validation

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Zod schemas for request validation
const InspireMeRequestSchema = z.object({
  mood: z.string().optional().default('adventurous'),
  interests: z.array(z.string()).optional().default([]),
  budget_range: z.string().optional().default('flexible'),
  season: z.string().optional().default('any'),
  travel_style: z.string().optional().default('balanced'),
  inspiration_type: z.string().optional().default('destination'),
  theme: z.string().optional(),
  style: z.string().optional()
});

// Zod schema for AI response validation
const InspirationDestinationSchema = z.object({
  name: z.string().min(1),
  country: z.string().min(1),
  description: z.string().min(10),
  why_perfect: z.string().min(5),
  best_season: z.string().optional(),
  signature_experiences: z.array(z.string()).min(1),
  hidden_gems: z.array(z.string()).optional().default([]),
  budget_estimate: z.object({
    daily_average: z.number().positive(),
    currency: z.string().min(3).max(3),
    what_includes: z.string().optional()
  }),
  mood_keywords: z.array(z.string()).min(1),
  image_suggestions: z.array(z.string()).optional().default([])
});

const AIInspirationResponseSchema = z.object({
  inspiration_theme: z.string().min(1),
  mood_match: z.string().min(1),
  destinations: z.array(InspirationDestinationSchema).min(1).max(5),
  planning_tips: z.array(z.string()).optional().default([]),
  next_steps: z.array(z.string()).optional().default([])
});

// Simplified schema for frontend response
const FrontendInspirationSchema = z.object({
  inspiration: z.object({
    title: z.string(),
    destination: z.string(),
    description: z.string(),
    inspiration_text: z.string(),
    estimated_budget: z.number(),
    currency: z.string(),
    duration_days: z.number(),
    difficulty_level: z.string(),
    highlights: z.array(z.string())
  })
});

// Assertion function for inspire validation
function assertInspire(data: unknown): z.infer<typeof AIInspirationResponseSchema> {
  try {
    return AIInspirationResponseSchema.parse(data);
  } catch (error) {
    console.error('Inspire validation failed:', error);
    throw new Error(`Invalid inspiration data: ${error.message}`);
  }
}

function validateInspireRequest(data: unknown): z.infer<typeof InspireMeRequestSchema> {
  try {
    return InspireMeRequestSchema.parse(data);
  } catch (error) {
    console.error('Request validation failed:', error);
    throw new Error(`Invalid request data: ${error.message}`);
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Validate request body
    const requestBody = await req.json().catch(() => ({}));
    const validatedRequest = validateInspireRequest(requestBody);

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
      try {
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
      } catch (error) {
        console.log('Auth validation failed:', error);
      }
    }

    // Build comprehensive AI prompt
    const prompt = `Generate inspiring travel destination recommendations based on these preferences:
    
    User mood/feeling: ${validatedRequest.mood}
    Interests: ${validatedRequest.interests.join(', ') || 'exploration'}
    Budget range: ${validatedRequest.budget_range}
    Preferred season: ${validatedRequest.season}
    Travel style: ${validatedRequest.travel_style}
    Inspiration type: ${validatedRequest.inspiration_type}
    Theme: ${validatedRequest.theme || 'varied'}
    
    Create 3-5 inspiring destination suggestions with:
    1. Captivating destination descriptions that evoke emotion
    2. What makes each place special and unique
    3. Best time to visit
    4. Signature experiences and activities
    5. Realistic budget estimates
    6. Why it matches their mood and interests
    7. Hidden gems and local secrets
    
    STRICT FORMAT REQUIREMENT - Return ONLY valid JSON:
    {
      "inspiration_theme": "Theme title",
      "mood_match": "How these match the user's mood",
      "destinations": [
        {
          "name": "Destination name",
          "country": "Country",
          "description": "Captivating description (min 10 chars)",
          "why_perfect": "Why it matches user preferences (min 5 chars)",
          "best_season": "Best time to visit",
          "signature_experiences": ["Experience 1", "Experience 2"],
          "hidden_gems": ["Secret spot 1", "Local favorite 2"],
          "budget_estimate": {
            "daily_average": 150,
            "currency": "USD",
            "what_includes": "Accommodation, meals, activities"
          },
          "mood_keywords": ["relaxing", "cultural", "adventure"],
          "image_suggestions": ["Scenic landmark", "Local culture", "Signature activity"]
        }
      ],
      "planning_tips": ["Tip 1", "Tip 2"],
      "next_steps": ["Action 1", "Action 2"]
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
            content: 'You are an inspiring travel advisor who creates emotionally resonant destination recommendations. Always return valid JSON in the exact format specified. Ensure all required fields are present and meet minimum length requirements.'
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

    console.log('Raw AI Response:', aiResponse);

    // Parse and validate AI response
    let inspirationData;
    try {
      const parsed = JSON.parse(aiResponse);
      // Use assertInspire for strict validation
      inspirationData = assertInspire(parsed);
    } catch (error) {
      console.error('AI response validation failed:', error);
      // Return validated fallback data
      inspirationData = assertInspire({
        inspiration_theme: 'Curated Travel Inspiration',
        mood_match: 'Tailored recommendations for your travel mood',
        destinations: [{
          name: 'Serene Mountain Retreat',
          country: 'Switzerland',
          description: 'Pristine Alpine landscapes offering tranquility and adventure',
          why_perfect: 'Perfect blend of relaxation and outdoor activities',
          best_season: 'Summer/Winter',
          signature_experiences: ['Mountain hiking', 'Scenic railways', 'Alpine dining'],
          hidden_gems: ['Local mountain huts', 'Secret viewpoints'],
          budget_estimate: {
            daily_average: 200,
            currency: 'USD',
            what_includes: 'Accommodation, meals, activities'
          },
          mood_keywords: ['peaceful', 'scenic', 'refreshing'],
          image_suggestions: ['Mountain peaks', 'Alpine lakes', 'Cozy chalets']
        }],
        planning_tips: ['Book mountain accommodations early', 'Check seasonal accessibility'],
        next_steps: ['Choose specific region', 'Plan activity schedule']
      });
    }

    // Convert to frontend format for compatibility
    const frontendResponse = {
      inspiration: {
        title: inspirationData.inspiration_theme,
        destination: inspirationData.destinations[0].name,
        description: inspirationData.destinations[0].description,
        inspiration_text: inspirationData.mood_match,
        estimated_budget: inspirationData.destinations[0].budget_estimate.daily_average,
        currency: inspirationData.destinations[0].budget_estimate.currency,
        duration_days: 7, // Default duration
        difficulty_level: 'moderate',
        highlights: inspirationData.destinations[0].signature_experiences
      },
      full_inspiration: inspirationData // Include full validated data
    };

    // Save inspiration to database if user is authenticated
    if (userId && supabaseUrl && serviceRoleKey) {
      try {
        const saveResponse = await fetch(`${supabaseUrl}/rest/v1/inspirations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            title: frontendResponse.inspiration.title,
            description: frontendResponse.inspiration.description,
            destination: frontendResponse.inspiration.destination,
            theme: validatedRequest.theme || 'adventure',
            season: validatedRequest.season,
            image_urls: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
            inspiration_data: frontendResponse.inspiration,
            tags: frontendResponse.inspiration.highlights,
            likes_count: 0,
            user_id: userId,
            ai_generated: true,
            validation_passed: true
          })
        });

        console.log('Save to database:', saveResponse.ok ? 'success' : 'failed');
      } catch (error) {
        console.log('Database save failed:', error);
      }
    }

    return new Response(JSON.stringify(frontendResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Inspire Me error:', error);
    
    // Return error response with fallback data
    const errorResponse = {
      inspiration: {
        title: 'Travel Inspiration Available',
        destination: 'Worldwide',
        description: 'Discover amazing destinations tailored to your preferences',
        inspiration_text: 'Let us help you find your next perfect getaway',
        estimated_budget: 150,
        currency: 'USD',
        duration_days: 7,
        difficulty_level: 'moderate',
        highlights: ['Personalized recommendations', 'Expert insights', 'Hidden gems']
      },
      error: error.message
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});