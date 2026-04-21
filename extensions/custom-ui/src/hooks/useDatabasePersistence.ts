import { useEffect, useRef } from 'react';
import { ServicesManager, ExtensionManager } from '@ohif/core';
import { loadAnnotations } from '../lib/studyService';
import { validateAnnotation } from '../lib/annotationValidation';

const ALLOWED_KEYS = [
  'uid', 'color', 'data', 'getReport', 'displayText', 'SOPInstanceUID',
  'FrameOfReferenceUID', 'referenceStudyUID', 'referenceSeriesUID',
  'frameNumber', 'displaySetInstanceUID', 'label', 'isLocked', 'isVisible',
  'description', 'type', 'unit', 'points', 'source', 'toolName', 'metadata',
  'area', 'mean', 'stdDev', 'perimeter', 'length', 'shortestDiameter',
  'longestDiameter', 'cachedStats', 'isSelected', 'textBox', 'referencedImageId', 'isDirty',
];

/**
 * Hook to automatically load annotations from the database when a study is opened.
 * This runs independently of the side panels to ensure hydration happens early.
 */
export function useDatabasePersistence(
  servicesManager: ServicesManager,
  extensionManager: ExtensionManager,
  studyInstanceUIDs: string | string[]
) {
  const { measurementService } = servicesManager.services;
  const hasLoadedRef = useRef<Record<string, boolean>>({});

  const studyInstanceUID = Array.isArray(studyInstanceUIDs)
    ? studyInstanceUIDs[0]
    : studyInstanceUIDs;

  useEffect(() => {
    async function fetchAndHydrate() {
      if (!studyInstanceUID || hasLoadedRef.current[studyInstanceUID]) {
        return;
      }

      console.log('[DatabasePersistence] Loading annotations for:', studyInstanceUID);
      try {
        const saved = await loadAnnotations(studyInstanceUID);
        
        if (saved && saved.length > 0) {
          const { displaySetService } = servicesManager.services;

          const hydrate = async () => {
            const displaySets = displaySetService.getActiveDisplaySets();
            if (displaySets.length === 0) {
              console.log('[DatabasePersistence] Waiting for display sets to be ready...');
              const { unsubscribe } = displaySetService.subscribe(
                displaySetService.EVENTS.DISPLAY_SETS_CHANGED,
                () => {
                  unsubscribe();
                  hydrate();
                }
              );
              return;
            }

            console.log(`[DatabasePersistence] Found ${saved.length} annotations. Hydrating...`);
            
            // Get the active data source to pass to MeasurementService.
            // This is required so Cornerstone can correctly resolve image IDs for hydrated annotations.
            const dataSource = extensionManager.getActiveDataSourceOrNull();

            let loadedCount = 0;
            saved.forEach(m => {
              try {
                // Validate the annotation data before attempting to hydrate.
                // This prevents crashes in the rendering engine due to malformed point data.
                const validation = validateAnnotation(m);
                if (!validation.isValid) {
                  console.warn(`[DatabasePersistence] Skipping malformed annotation ${m.uid}: ${validation.reason}`);
                  return;
                }

                // Strict filtering of keys to pass MeasurementService validation.
                const cleanData: any = {};
                ALLOWED_KEYS.forEach(key => {
                  if (m[key] !== undefined) {
                    cleanData[key] = m[key];
                  }
                });

                // Resolve the correct displaySetInstanceUID for the current session.
                // IMPORTANT: We must first clear the old session-specific UID.
                // Using a stale UID from a previous session is what causes the crash.
                delete cleanData.displaySetInstanceUID;

                if (displaySetService) {
                  // Resolve UIDs even if keys are named differently in database
                  const sopUID = m.SOPInstanceUID || m.sopInstanceUid || m.sopInstanceUID;
                  const seriesUID = m.referenceSeriesUID || m.seriesInstanceUid || m.seriesInstanceUID || m.SeriesInstanceUID;

                  if (sopUID) {
                    let ds = displaySetService.getDisplaySetForSOPInstanceUID(sopUID, seriesUID);

                    // Fallback: search all display sets if the series-specific search failed
                    if (!ds) {
                      ds = displaySetService.getDisplaySetForSOPInstanceUID(sopUID, null);
                    }

                    if (ds) {
                      cleanData.displaySetInstanceUID = ds.displaySetInstanceUID;
                    }
                  }
                }

                // If we still don't have a displaySetInstanceUID, skip this annotation.
                // Interacting with measurements that don't belong to a displaySet causes crashes in OHIF.
                if (!cleanData.displaySetInstanceUID) {
                  console.warn(`[DatabasePersistence] Skipping annotation ${m.uid} - no matching display set found in current session.`);
                  return;
                }

                // Deep clean to force imageId resolution by the extension.
                if (cleanData.metadata) {
                  const { referencedImageId, ...cleanMetadata } = cleanData.metadata;
                  cleanData.metadata = cleanMetadata;
                }
                delete cleanData.referencedImageId;

                // Ensure we have a valid source object or fallback to standard Cornerstone3DTools
                const source = measurementService.getSource(
                  cleanData.source?.name || 'Cornerstone3DTools',
                  cleanData.source?.version || '0.1'
                );

                const wrappedData = {
                  annotation: cleanData,
                };

                const result = measurementService.addRawMeasurement(
                  source,
                  cleanData.toolName || cleanData.type,
                  wrappedData,
                  (data: any) => data.annotation,
                  dataSource
                );

                if (result) {
                  loadedCount++;
                }
              } catch (err) {
                console.warn(`[DatabasePersistence] Failed to hydrate measurement ${m.uid}:`, err);
              }
            });

            const { cornerstoneViewportService } = servicesManager.services;
            if (cornerstoneViewportService && loadedCount > 0) {
              setTimeout(() => {
                try {
                  cornerstoneViewportService.getRenderingEngine()?.render();
                } catch (renderError) {
                  console.warn('[DatabasePersistence] Failed to trigger re-render:', renderError);
                }
              }, 250);
            }
            
            hasLoadedRef.current[studyInstanceUID] = true;
          };

          hydrate();
        } else {
          console.log('[DatabasePersistence] No annotations found for this study.');
          hasLoadedRef.current[studyInstanceUID] = true;
        }
      } catch (err) {
        console.error('[DatabasePersistence] Error fetching annotations:', err);
      }
    }

    fetchAndHydrate();
  }, [studyInstanceUID, measurementService, servicesManager, extensionManager]);
}
