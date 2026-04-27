import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ORTHANC_URL = Deno.env.get('ORTHANC_URL') || 'http://YOUR_VPS_IP:8042';
const ORTHANC_AUTH = Deno.env.get('ORTHANC_AUTH') || 'admin:admin';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-study-instance-uid, x-study-name, x-category, x-tags, range, accept',
  'Access-Control-Max-Age': '86400',
};

// ─── JWT Decoder (no network roundtrip) ──────────────────────────────────────
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// ─── Utility: Bypassable DICOM Paths (Capability URLs for WebWorkers) ─────
function isBypassableRequest(path: string, method: string): boolean {
  if (method !== 'GET') return false;
  const p = path.toLowerCase();
  return p.includes('/frames/') || 
         path.includes('/metadata') ||
         p.includes('/rendered') || 
         p.includes('/thumbnail') || 
         p.includes('/bulkdata') ||
         p.includes('/pixeldata') ||
         p.includes('/bulk/');
}

// ─── Fetch with exponential backoff ───────────────────────────────────────────
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  timeoutMs: number,
  maxRetries = 3
): Promise<Response> {
  let attempt = 0;

  while (attempt < maxRetries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });

      if (response.status === 503 || response.status === 429) {
        throw new Error(`Upstream returned ${response.status}`);
      }

      clearTimeout(timer);
      return response;
    } catch (err) {
      clearTimeout(timer);
      attempt++;

      if (attempt >= maxRetries) {
        throw err;
      }

      const delay = Math.pow(2, attempt) * 250;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(
        `[Proxy] Request failed (${msg}). Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries - 1})`
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Unreachable code block');
}

// ─── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Origin': req.headers.get('Origin') || '*',
      } 
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/orthanc-proxy').pop() || '/';

    // ── Fast path for binary frame data (Capability URL bypass for WebWorkers) ──
    if (isBypassableRequest(path, req.method)) {
      const orthancTarget = new URL(`${ORTHANC_URL}${path}${url.search}`);
      const outHeaders = new Headers(req.headers);
      outHeaders.set('Authorization', `Basic ${btoa(ORTHANC_AUTH)}`);
      outHeaders.delete('host');
      outHeaders.delete('accept-encoding');

      const response = await fetchWithRetry(orthancTarget.toString(), { method: req.method, headers: outHeaders }, 30000, 3);
      const resHeaders = new Headers(corsHeaders);
      for (const [key, value] of response.headers) {
        if (!['content-length', 'content-encoding', 'host', 'transfer-encoding', 'access-control-allow-origin'].includes(key.toLowerCase())) {
          resHeaders.set(key, value);
        }
      }
      return new Response(response.body, { status: response.status, headers: resHeaders });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      const receivedHeaders: Record<string, string> = {};
      req.headers.forEach((v, k) => { receivedHeaders[k] = v; });
      
      return new Response(JSON.stringify({ 
        error: 'Missing Authorization header',
        details: 'The proxy did not receive an Authorization header from the client.',
        receivedHeaders
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // ── Supabase Client (System Access) ──
    const envUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(envUrl, serviceRoleKey);

    // ── Securely Verify JWT using Supabase Auth ──
    const supabaseForAuth = createClient(envUrl, Deno.env.get('SUPABASE_ANON_KEY') || '', {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: authData, error: authError } = await supabaseForAuth.auth.getUser();
    if (authError || !authData?.user) {
      console.error('[Proxy] JWT Verification Failed:', authError?.message || 'No user');
      return new Response(JSON.stringify({ 
        error: 'Unauthorized',
        message: 'Invalid JWT', 
        details: authError?.message || 'Unauthorized'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = authData.user.id;

    // ── HANDLE UPLOAD (POST /upload-dicom) ────────────────────────────────────
    if (req.method === 'POST' && path === '/upload-dicom') {
      const studyName = req.headers.get('x-study-name') || 'Unnamed Study';
      const category = req.headers.get('x-category') || 'General';
      
      const tagsRaw = req.headers.get('x-tags');
      const tags = tagsRaw && tagsRaw.trim() ? tagsRaw.split(',').map(t => t.trim()) : [];

      const body = await req.arrayBuffer();
      if (body.byteLength === 0) {
        return new Response(JSON.stringify({ error: 'Empty file body' }), { status: 400, headers: corsHeaders });
      }

      // Check User Quota (Limit: 512 MB = 536,870,912 bytes)
      const MAX_STORAGE_BYTES = 512 * 1024 * 1024;
      const { data: usageData, error: usageError } = await supabase
        .from('dicom_files')
        .select('file_size')
        .eq('user_id', userId);
        
      if (!usageError && usageData) {
        const currentUsage = usageData.reduce((acc, row) => acc + (Number(row.file_size) || 0), 0);
        if (currentUsage + body.byteLength > MAX_STORAGE_BYTES) {
          console.warn(`[Proxy] Quota Exceeded for ${userId}: ${currentUsage} bytes used.`);
          return new Response(JSON.stringify({ 
            error: 'Account storage limit reached (512 MB). Please delete older studies.' 
          }), { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      // 1. Upload to Orthanc
      const orthancResponse = await fetch(`${ORTHANC_URL}/instances`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${btoa(ORTHANC_AUTH)}` },
        body,
      });

      if (!orthancResponse.ok) {
        const errText = await orthancResponse.text();
        return new Response(JSON.stringify({ error: `Orthanc upload failed: ${errText}` }), { status: 502, headers: corsHeaders });
      }

      const orthancResult = await orthancResponse.json();
      const instanceId = orthancResult.ID;
      const orthancStudyId = orthancResult.ParentStudy;
      const orthancSeriesId = orthancResult.ParentSeries;

      // 2. Retrieve extra metadata from Orthanc for mapping
      const studyRes = await fetch(`${ORTHANC_URL}/studies/${orthancStudyId}`, {
        headers: { 'Authorization': `Basic ${btoa(ORTHANC_AUTH)}` },
      });
      const studyMeta = await studyRes.json();
      const studyInstanceUid = studyMeta.MainDicomTags.StudyInstanceUID;

      // 3. Record in Supabase
      const { error: dbError } = await supabase
        .from('dicom_files')
        .insert({
          user_id: userId,
          orthanc_instance_id: instanceId,
          orthanc_study_id: orthancStudyId,
          orthanc_series_id: orthancSeriesId,
          study_instance_uid: studyInstanceUid,
          study_name: studyName,
          category: category,
          tags: tags,
          file_size: body.byteLength,
          uploaded_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error('[Proxy] DB Insert Error:', dbError);
        return new Response(JSON.stringify({ error: `DB registration failed: ${dbError.message}` }), { status: 500, headers: corsHeaders });
      }

      return new Response(JSON.stringify({ 
        message: 'Upload successful', 
        study_instance_uid: studyInstanceUid,
        orthanc_id: instanceId 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // ── HANDLE DELETE (DELETE /studies/:studyInstanceUid) ────────────────────
    if (req.method === 'DELETE') {
      const studyMatch = path.match(/\/studies\/([0-9.]+)/);
      if (studyMatch) {
        const studyInstanceUid = studyMatch[1];
        
        // 1. Verify Ownership & Get Orthanc ID
        const { data: studies, error: findError } = await supabase
          .from('dicom_files')
          .select('orthanc_study_id')
          .eq('study_instance_uid', studyInstanceUid)
          .eq('user_id', userId);
          
        if (findError) {
          return new Response(JSON.stringify({ error: `DB Query Error: ${findError.message}` }), { status: 500, headers: corsHeaders });
        }
        
        const studyData = studies?.[0];
        if (!studyData) {
          return new Response(JSON.stringify({ error: 'Study not found or access denied' }), { status: 403, headers: corsHeaders });
        }
        
        const orthancStudyId = studyData.orthanc_study_id;
        
        // 2. Delete from Orthanc (if ID exists)
        if (orthancStudyId) {
          const orthancTarget = `${ORTHANC_URL}/studies/${orthancStudyId}`;
          const delRes = await fetch(orthancTarget, {
            method: 'DELETE',
            headers: { 'Authorization': `Basic ${btoa(ORTHANC_AUTH)}` },
          });
          
          if (!delRes.ok && delRes.status !== 404) {
            const errText = await delRes.text().catch(() => 'Unknown error');
            console.error(`[Proxy] Orthanc deletion failed for ${orthancStudyId}:`, errText);
          }
        }
        
        // 3. Delete from Supabase
        const [delFiles, delAnn, delShared] = await Promise.all([
          supabase.from('dicom_files').delete().eq('study_instance_uid', studyInstanceUid).eq('user_id', userId),
          supabase.from('study_annotations').delete().eq('study_instance_uid', studyInstanceUid).eq('user_id', userId),
          supabase.from('user_studies').delete().eq('study_instance_uid', studyInstanceUid)
        ]);

        if (delFiles.error) {
          return new Response(JSON.stringify({ error: `DB Deletion Error: ${delFiles.error.message}` }), { status: 500, headers: corsHeaders });
        }

        return new Response(JSON.stringify({ message: 'Study and associated data successfully deleted' }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
    }

    // ── RESTRICT TO GET FOR ALL OTHER PATHS ───────────────────────────────────
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Secure Access Path: GET /my-studies ──
    if (path === '/my-studies') {
      const { data, error } = await supabase
        .from('dicom_files')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });
      
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
      }
      return new Response(JSON.stringify(data), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // ── Access Control: Get allowed StudyInstanceUIDs ──
    const [{ data: usData }, { data: dfData }] = await Promise.all([
      supabase.from('user_studies').select('study_instance_uid').eq('user_id', userId),
      supabase.from('dicom_files').select('study_instance_uid').eq('user_id', userId)
    ]);

    const allowedUIDs = Array.from(new Set([
      ...(usData || []).map(s => s.study_instance_uid),
      ...(dfData || []).map(s => s.study_instance_uid)
    ]));

    const orthancTarget = new URL(`${ORTHANC_URL}${path}${url.search}`);

    // Filter QIDO-RS Study List
    if (path.endsWith('/studies')) {
      if (allowedUIDs.length === 0) {
        return new Response(JSON.stringify([]), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const uidList = allowedUIDs.join('\\');
      
      // Delete strict OHIF date filters so all user studies appear
      orthancTarget.searchParams.delete('StudyDate');
      
      const requestedUID = orthancTarget.searchParams.get('StudyInstanceUID');
      if (requestedUID && allowedUIDs.includes(requestedUID)) {
        // The client requested a specific, allowed study (e.g. Viewer direct link) - Keep it
      } else if (allowedUIDs.length === 1) {
        orthancTarget.searchParams.set('StudyInstanceUID', allowedUIDs[0]);
      } else {
        // Orthanc QIDO-RS strictly does not support backslash-separated multi-UID matches.
        // We delete it so Orthanc returns the latest studies, which are then memory-filtered securely.
        orthancTarget.searchParams.delete('StudyInstanceUID');
      }
    }

    // Verify ownership for WADO-RS Study/Series/Instance access
    const studyMatch = path.match(/\/studies\/([0-9.]+)/);
    if (studyMatch && !allowedUIDs.includes(studyMatch[1])) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Proxy the request to Orthanc
    const outHeaders = new Headers(req.headers);
    outHeaders.set('Authorization', `Basic ${btoa(ORTHANC_AUTH)}`);
    outHeaders.delete('host');
    outHeaders.delete('accept-encoding');

    const response = await fetchWithRetry(orthancTarget.toString(), { method: req.method, headers: outHeaders }, 20000, 3);

    const resHeaders = new Headers(corsHeaders);
    for (const [key, value] of response.headers) {
      if (!['content-length', 'content-encoding', 'host', 'transfer-encoding', 'access-control-allow-origin'].includes(key.toLowerCase())) {
        resHeaders.set(key, value);
      }
    }

    let responseBody: any = response.body;

    // ── Post-processing: Secure/Fix DICOM JSON responses ──────────────────────
    const contentType = response.headers.get('content-type') || '';
    const isJsonLike = contentType.includes('json') || path.includes('/studies') || path.includes('/metadata');

    if (response.ok && isJsonLike) {
      try {
        // Clone so we don't disturb the stream for non-JSON fallbacks
        const clone = response.clone();
        const json = await clone.json();
        const proxyUrl = `${url.origin}${url.pathname.split('/orthanc-proxy')[0]}/orthanc-proxy`;

        // 1. Rewrite absolute Orthanc URLs to point back through the proxy
        const orthancIp = "YOUR_VPS_IP";
        let jsonString = JSON.stringify(json);
        
        // Match both standard and escaped (JSON-style) Orthanc URLs
        const rewriteRegex = new RegExp(`http:\\/\\/(?:\\\\\\/)?${orthancIp}(?::8042)?`, 'g');
        if (jsonString.includes(orthancIp)) {
          console.log(`[Proxy] Rewriting absolute URLs in JSON for study/metadata: ${path}`);
          jsonString = jsonString.replace(rewriteRegex, proxyUrl);
        }
        
        const processedJson = JSON.parse(jsonString);

        // 2. Secure Post-processing for study lists
        if (path.includes('/studies') && !path.includes('/metadata')) {
          const filteredStudies = Array.isArray(processedJson) 
            ? processedJson.filter((study: any) => {
                const uid = study['0020000D']?.Value?.[0];
                return uid && allowedUIDs.includes(uid);
              })
            : processedJson;
          responseBody = JSON.stringify(filteredStudies);
        } else {
          responseBody = JSON.stringify(processedJson);
        }
      } catch (err) {
        // If JSON parsing fails (e.g. malformed or actually binary), fall back to original body
        console.warn('[Proxy] Skipping JSON post-processing for:', path, (err as any).message);
      }
    }

    return new Response(responseBody, { 
      status: response.status >= 500 ? 502 : response.status, 
      headers: resHeaders 
    });

  } catch (error) {
    console.error('[Proxy] Unhandled error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown' }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
