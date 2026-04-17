import { supabase } from './supabase';

// ─── Fetch user's allowed study UIDs ───────────────────────────────────────

/**
 * Fetches the list of StudyInstanceUIDs that belong to the current user.
 * Returns null if the user is not authenticated or if RLS blocks access.
 */
export async function getUserStudyUIDs(): Promise<string[] | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_studies')
    .select('study_instance_uid')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[studyService] Failed to fetch user studies:', error.message);
    return null;
  }

  return data.map(row => row.study_instance_uid);
}

/**
 * Fetches the user's total active storage consumption in bytes.
 */
export async function getUserStorageUsage(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  
  const { data, error } = await supabase
    .from('dicom_files')
    .select('file_size')
    .eq('user_id', user.id);
    
  if (error || !data) {
    console.error('[studyService] Failed to fetch storage usage:', error?.message);
    return 0;
  }
  
  return data.reduce((acc, row) => acc + (Number(row.file_size) || 0), 0);
}

// ─── Remove a study from user's list ──────────────────────────────────────

/**
 * Removes a study from the user's registry (does NOT delete from Orthanc).
 */
export async function removeUserStudy(studyInstanceUid: string) {
  const { error } = await supabase
    .from('user_studies')
    .delete()
    .eq('study_instance_uid', studyInstanceUid);

  if (error) {
    console.error('[studyService] Failed to remove study:', error.message);
  }

  return { error };
}

/**
 * Extract StudyInstanceUID and basic metadata from a DICOM file.
 * Dynamically imports dcmjs to avoid bundling issues.
 */
async function extractMetadata(file: File) {
  try {
    const dcmjsModule = await import('dcmjs');
    const dcmjs = dcmjsModule.default || dcmjsModule;

    const buffer = await file.arrayBuffer();
    const dicomData = dcmjs.data.DicomMessage.readFile(buffer);
    const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomData.dict);

    const metadata = {
      studyInstanceUid: dataset.StudyInstanceUID,
      patientName:
        typeof dataset.PatientName === 'object'
          ? dataset.PatientName.Alphabetic || 'Anonymous'
          : dataset.PatientName || 'Anonymous',
      studyDescription: dataset.StudyDescription || '',
      studyDate: dataset.StudyDate || '',
      modality: dataset.Modality || '',
    };
    
    console.log('[studyService] Extracted Metadata from', file.name, ':', metadata);
    return metadata;
  } catch (err) {
    console.error('[studyService] Failed to parse DICOM for metadata:', file.name, err);
    return null;
  }
}

/**
 * Uploads DICOM files directly to Orthanc using the STOW-RS protocol,
 * then registers each study with the current user in Supabase.
 *
 * @param files - Array of .dcm File objects
 * @param orthancRoot - The DICOMweb root URL (e.g. "http://76.13.99.8:8042/dicom-web")
 * @param metadataOverride - Optional patient name / study description override
 * @returns Object with uploaded study UIDs and any errors
 */
export async function uploadDICOMToOrthanc(
  files: File[],
  orthancRoot: string,
  metadataOverride?: {
    patientName?: string;
    studyDescription?: string;
    studyDate?: string;
  },
  auth?: string, // Basic auth 'user:pass' string
  onProgress?: (progress: { total: number; current: number; status: string }) => void
): Promise<{ studyUIDs: string[]; errors: string[] }> {
  const studyUIDs = new Set<string>();
  const errors: string[] = [];
  const total = files.length;
  let current = 0;

  // Concurrency limit to prevent UI freezing and network saturation
  const CONCURRENCY = 3;
  let running = 0;
  let index = 0;

  return new Promise(resolve => {
    if (files.length === 0) {
      resolve({ studyUIDs: [], errors: [] });
      return;
    }

    const processNext = async () => {
      if (index >= files.length) {
        if (running === 0) {
          resolve({ studyUIDs: Array.from(studyUIDs), errors });
        }
        return;
      }

      const fileIndex = index++;
      const file = files[fileIndex];
      running++;

      try {
        onProgress?.({ total, current, status: `Processing ${file.name}...` });

        // 1. Extract metadata (optional, used for local tracking)
        const dicomMeta = await extractMetadata(file);
        const uid = dicomMeta?.studyInstanceUid;

        // 2. Prepare for Secure Upload
        // We use the new /upload-dicom endpoint which handles tagging and DB mapping.
        // We replace /dicom-web with /upload-dicom in the orthancRoot.
        const uploadUrl = orthancRoot.replace(/\/dicom-web\/?$/, '/upload-dicom');
        const arrayBuffer = await file.arrayBuffer();

        const { data: { session } } = await supabase.auth.getSession();

        const headers: Record<string, string> = {
          'Content-Type': 'application/octet-stream',
          'Accept': 'application/json',
          'x-study-name': (dicomMeta as any)?.studyDescription || 'Imported Study',
          'x-category': (dicomMeta as any)?.category || 'General',
          'x-tags': (dicomMeta as any)?.tags || '',
        };

        if (session && session.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers,
          body: arrayBuffer,
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => response.statusText);
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        const result = await response.json();

        // 3. Tracking locally
        if (result.study_instance_uid) {
          studyUIDs.add(result.study_instance_uid);
          console.log('[studyService] Upload success:', result.study_instance_uid);
        }
        
        current++;
        onProgress?.({ total, current, status: `Uploaded ${file.name}` });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[studyService] Failed to upload ${file.name}:`, msg);
        errors.push(`${file.name}: ${msg}`);
        current++;
        onProgress?.({ total, current, status: `Failed: ${file.name}` });
      } finally {
        running--;
        processNext();
      }
    };

    // Start initial batch
    for (let i = 0; i < Math.min(CONCURRENCY, files.length); i++) {
      processNext();
    }
  });
}

/**
 * Deletes a study from Orthanc and Supabase via the secure proxy.
 * Only the owner can perform this action.
 */
export async function deleteStudy(studyInstanceUid: string, orthancRoot: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('User must be authenticated to delete studies');
  }

  // We replace /dicom-web with /studies/[:uid] in the orthancRoot for the proxy
  const deleteUrl = orthancRoot.replace(/\/dicom-web\/?$/, `/studies/${studyInstanceUid}`);

  const response = await fetch(deleteUrl, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete study: ${response.statusText}`);
  }
}

// ─── Annotation Persistence ────────────────────────────────────────────────

/**
 * Saves a list of measurements/annotations to Supabase for a specific study.
 */
export async function saveAnnotations(studyInstanceUid: string, measurements: any[]) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: new Error('Not authenticated') };
  }

  const { error } = await supabase.from('study_annotations').upsert(
    {
      user_id: user.id,
      study_instance_uid: studyInstanceUid,
      data: measurements,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,study_instance_uid' }
  );

  if (error) {
    console.error('[studyService] Failed to save annotations:', error);
    throw new Error(error.message);
  }

  return { error };
}

/**
 * Loads saved measurements/annotations from Supabase for a specific study.
 */
export async function loadAnnotations(studyInstanceUid: string): Promise<any[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.warn('[studyService] No user session for loading annotations');
    return [];
  }

  const { data, error } = await supabase
    .from('study_annotations')
    .select('data')
    .eq('user_id', user.id)
    .eq('study_instance_uid', studyInstanceUid)
    .maybeSingle();

  if (error) {
    console.error('[studyService] Failed to load annotations:', error.message);
  }

  return data?.data || [];
}
