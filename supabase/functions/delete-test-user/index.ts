// Delete specific test user and clean up test data

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
    const { targetEmail } = await req.json();
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!serviceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not available');
    }

    // Default to the specific test user if no email provided
    const emailToDelete = targetEmail || 'xotxqjly@minimax.com';
    
    console.log(`Attempting to delete user: ${emailToDelete}`);

    // First, find the user by email
    const listResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Content-Type': 'application/json'
      }
    });

    if (!listResponse.ok) {
      throw new Error('Failed to list users');
    }

    const listData = await listResponse.json();
    const targetUser = listData.users?.find((user: any) => user.email === emailToDelete);
    
    if (!targetUser) {
      return new Response(JSON.stringify({ 
        message: `User ${emailToDelete} not found`,
        success: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found user ID: ${targetUser.id}`);

    // Delete user data from custom tables first
    const tables = ['profiles', 'trips', 'wt_stripe_customers', 'wt_stripe_subscriptions'];
    const cleanupResults = [];

    for (const table of tables) {
      try {
        const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/${table}?user_id=eq.${targetUser.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json'
          }
        });
        cleanupResults.push({ table, success: deleteResponse.ok });
      } catch (error) {
        console.log(`Table ${table} cleanup failed or doesn't exist:`, error.message);
        cleanupResults.push({ table, success: false, error: error.message });
      }
    }

    // Delete the user from auth
    const deleteResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${targetUser.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey
      }
    });

    const success = deleteResponse.ok;
    
    return new Response(JSON.stringify({ 
      message: success 
        ? `User ${emailToDelete} successfully deleted` 
        : `Failed to delete user ${emailToDelete}`,
      success,
      userId: targetUser.id,
      cleanupResults,
      status: deleteResponse.status
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});