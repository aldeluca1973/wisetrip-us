// Health check endpoint for monitoring

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: 'production',
      services: {
        database: false,
        auth: false,
        ai: false
      },
      uptime: Date.now(),
      region: Deno.env.get('VERCEL_REGION') || 'unknown'
    };

    // Test database connection
    try {
      const dbResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?limit=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey
        }
      });
      health.services.database = dbResponse.ok;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // Test auth service
    try {
      const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users?per_page=1`, {
        method: 'GET', 
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey
        }
      });
      health.services.auth = authResponse.ok;
    } catch (error) {
      console.error('Auth health check failed:', error);
    }

    // Test AI service availability
    health.services.ai = !!openaiKey;

    // Determine overall status
    const allHealthy = Object.values(health.services).every(Boolean);
    health.status = allHealthy ? 'healthy' : 'degraded';

    return new Response(JSON.stringify(health), {
      status: allHealthy ? 200 : 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});