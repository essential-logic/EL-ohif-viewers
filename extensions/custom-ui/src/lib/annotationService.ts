import { supabase } from './supabase';

const SCOPE = '[annotationService]';
const FUNCTIONS_URL = 'https://xyuxiachrjpcrmiephqa.supabase.co/functions/v1/annotation-service';

/**
 * Helper to fetch with auth token
 */
async function authenticatedFetch(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  console.log(`${SCOPE} Fetching ${path}`, options.body ? JSON.parse(options.body as string) : '');
  const response = await fetch(`${FUNCTIONS_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`${SCOPE} Error response from ${path}:`, response.status, errorBody);
    throw new Error(`HTTP ${response.status}: ${errorBody}`);
  }

  const result = await response.json();
  console.log(`${SCOPE} Success response from ${path}:`, result);
  return result;
}

/**
 * Saves annotations for a study to the database.
 */
export async function saveAnnotationsToDb(studyInstanceUid: string, annotations: any[]) {
  try {
    return await authenticatedFetch('/save-annotations', {
      method: 'POST',
      body: JSON.stringify({ studyInstanceUid, annotations }),
    });
  } catch (error) {
    console.error(`${SCOPE} Failed to save annotations:`, error);
    throw error;
  }
}

/**
 * Loads annotations for a study from the database.
 */
export async function loadAnnotationsFromDb(studyInstanceUid: string): Promise<any[]> {
  try {
    return await authenticatedFetch(`/load-annotations?studyInstanceUid=${studyInstanceUid}`);
  } catch (error) {
    console.error(`${SCOPE} Failed to load annotations:`, error);
    return [];
  }
}

/**
 * Saves segmentation metadata to the database.
 */
export async function saveSegmentationToDb(studyInstanceUid: string, segmentationId: string, data: any) {
  try {
    return await authenticatedFetch('/save-segmentation', {
      method: 'POST',
      body: JSON.stringify({ studyInstanceUid, segmentationId, data }),
    });
  } catch (error) {
    console.error(`${SCOPE} Failed to save segmentation:`, error);
    throw error;
  }
}

/**
 * Loads all segmentations for a study from the database.
 */
export async function loadSegmentationsFromDb(studyInstanceUid: string): Promise<any[]> {
  try {
    return await authenticatedFetch(`/load-segmentations?studyInstanceUid=${studyInstanceUid}`);
  } catch (error) {
    console.error(`${SCOPE} Failed to load segmentations:`, error);
    return [];
  }
}

