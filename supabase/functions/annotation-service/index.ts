import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are automatically injected
// by Supabase into every deployed Edge Function.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Use service role client to verify the user's JWT
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);

    if (authError || !user) {
      console.error('[Edge Function] Auth failed:', authError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;
    console.log(`[Edge Function] Authenticated userId: ${userId}`);

    // Use service role client for DB ops (bypasses RLS, we enforce manually via user_id filter)
    const db = adminClient;

    const url = new URL(req.url);
    const { pathname } = url;
    console.log(`[Edge Function] ${req.method} ${pathname}`);

    // ─── ANNOTATIONS ─────────────────────────────────────────────────────────

    if (pathname.endsWith('/save-annotations') && req.method === 'POST') {
      const { studyInstanceUid, annotations } = await req.json();

      const { error } = await db
        .from('study_annotations')
        .upsert(
          {
            user_id: userId,
            study_instance_uid: studyInstanceUid,
            data: annotations,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,study_instance_uid' }
        );

      if (error) throw error;

      console.log(`[Edge Function] Saved ${annotations.length} annotations for ${studyInstanceUid}`);
      return new Response(JSON.stringify({ message: 'Saved' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (pathname.endsWith('/load-annotations') && req.method === 'GET') {
      const studyInstanceUid = url.searchParams.get('studyInstanceUid');

      const { data, error } = await db
        .from('study_annotations')
        .select('data')
        .eq('user_id', userId)
        .eq('study_instance_uid', studyInstanceUid)
        .maybeSingle();

      if (error) throw error;

      console.log(`[Edge Function] Loaded annotations for ${studyInstanceUid}: ${data?.data?.length ?? 0} items`);
      return new Response(JSON.stringify(data?.data || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── SEGMENTATIONS ───────────────────────────────────────────────────────

    if (pathname.endsWith('/save-segmentation') && req.method === 'POST') {
      const { studyInstanceUid, segmentationId, data } = await req.json();

      const { error } = await db
        .from('study_segmentations')
        .upsert(
          {
            user_id: userId,
            study_instance_uid: studyInstanceUid,
            segmentation_id: segmentationId,
            data,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,study_instance_uid,segmentation_id' }
        );

      if (error) throw error;

      console.log(`[Edge Function] Saved segmentation ${segmentationId} for ${studyInstanceUid}`);
      return new Response(JSON.stringify({ message: 'Saved' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (pathname.endsWith('/load-segmentations') && req.method === 'GET') {
      const studyInstanceUid = url.searchParams.get('studyInstanceUid');

      const { data, error } = await db
        .from('study_segmentations')
        .select('*')
        .eq('user_id', userId)
        .eq('study_instance_uid', studyInstanceUid);

      if (error) throw error;

      console.log(`[Edge Function] Loaded ${data?.length ?? 0} segmentations for ${studyInstanceUid}`);
      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Not Found', 
      detail: `No handler for ${req.method} ${pathname}`,
      hint: 'Check if the URL ends with the correct endpoint (e.g., /load-annotations)'
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Edge Function] Error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
