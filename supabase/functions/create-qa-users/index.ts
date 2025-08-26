// Create QA users with strong random passwords

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
    // Generate strong random passwords
    function generatePassword() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => chars[b % chars.length])
        .join('');
    }

    const qaUsers = [
      { email: 'qa+traveler@wisetrip.us', password: generatePassword() },
      { email: 'qa+collab@wisetrip.us', password: generatePassword() },
      { email: 'qa+biz@wisetrip.us', password: generatePassword() },
      { email: 'qa+office@wisetrip.us', password: generatePassword() }
    ];

    const results = [];
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!serviceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not available');
    }

    for (const user of qaUsers) {
      const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            role: 'qa',
            created_by: 'hardening-script'
          }
        })
      });

      const result = await response.json();
      results.push({ 
        email: user.email, 
        password: user.password,
        success: response.ok,
        id: result.user?.id
      });
    }

    return new Response(JSON.stringify({ 
      message: 'QA users creation completed',
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});