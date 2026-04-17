import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    // 1. Determine user ID from user token
    const envUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseForAuth = createClient(envUrl, Deno.env.get('SUPABASE_ANON_KEY') || '', {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: authData, error: authError } = await supabaseForAuth.auth.getUser();
    if (authError || !authData?.user) {
      throw new Error('Unauthorized');
    }
    
    const userId = authData.user.id;

    // 2. Delete user account via Service Role (Bypasses RLS and natively purges child resources via cascaded triggers/foreign keys)
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabaseAdmin = createClient(envUrl, serviceRoleKey);
    
    const { error: deletionError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deletionError) {
      throw deletionError;
    }

    return new Response(JSON.stringify({ message: 'Account successfully deleted' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message || 'Server Error' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
