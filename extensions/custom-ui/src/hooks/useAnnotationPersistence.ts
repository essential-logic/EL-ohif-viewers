import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { ServicesManager, CommandsManager, ExtensionManager } from '@ohif/core';
import { filterValidMeasurements } from '../lib/annotationValidation';

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useAnnotationPersistence — auto-load and save annotations for a study via DICOM SR.
 */
export function useAnnotationPersistence(
  servicesManager: ServicesManager,
  commandsManager: CommandsManager,
  extensionManager: ExtensionManager,
  studyInstanceUIDs: string | string[]
) {
  const { measurementService, displaySetService } = servicesManager.services;
  const isHydrating = useRef(false);
  const hasHydrated = useRef(false); // Prevents auto-save before initial load is settled
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pendingAnnotationsCount, setPendingAnnotationsCount] = useState(0);
  const pendingSRsRef = useRef<any[]>([]);

  const studyInstanceUID = useMemo(() => (
    Array.isArray(studyInstanceUIDs) ? studyInstanceUIDs[0] : studyInstanceUIDs
  ), [studyInstanceUIDs]);

  // ─── Save (debounced) ───────────────────────────────────────────────────

  const debouncedSave = useCallback(() => {
    if (isHydrating.current || !hasHydrated.current || !studyInstanceUID) {
      return;
    }

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(async () => {
      try {
        const rawMeasurements = measurementService.getMeasurements();
        const measurements = filterValidMeasurements(rawMeasurements);
        
        if (measurements.length === 0) {
           return;
        }

        console.log('[AnnotationPersistence] Auto-Saving', measurements.length, 'measurements via DICOM SR');
        
        const dataSource = extensionManager.getActiveDataSource()[0];

        await commandsManager.runCommand('storeMeasurements', {
          measurementData: measurements,
          dataSource,
          additionalFindingTypes: [],
          options: {
            SeriesDescription: 'Annotation Report (Auto-saved)',
          },
        });
        
        console.log('[AnnotationPersistence] DICOM SR Save Successful');
      } catch (err) {
        console.error('[AnnotationPersistence] Auto-Save error:', err);
      }
    }, 3000); // Wait longer for annotations to settle
  }, [studyInstanceUID, measurementService, commandsManager, extensionManager]);

  // ─── Load (manual, triggered by user clicking "Load Annotations") ────────

  const loadPendingAnnotations = useCallback(async () => {
    const srs = pendingSRsRef.current;
    if (srs.length === 0) {
      return;
    }

    console.log('[AnnotationPersistence] Hydrating', srs.length, 'SRs');
    isHydrating.current = true;

    try {
      for (const sr of srs) {
        try {
          await commandsManager.runCommand('hydrateStructuredReport', {
            displaySetInstanceUID: sr.displaySetInstanceUID,
          });
        } catch (e) {
          console.error('[AnnotationPersistence] Failed to hydrate SR:', sr.displaySetInstanceUID, e);
        }
      }
      
      hasHydrated.current = true;
      setPendingAnnotationsCount(0);
      pendingSRsRef.current = [];
    } finally {
      isHydrating.current = false;
    }
  }, [commandsManager]);

  // ─── Detect SRs on Study Load ───────────────────────────────────────────

  useEffect(() => {
    if (!studyInstanceUID) {
      return;
    }

    // Small delay to ensure displaySetService has populated
    const checkTimer = setTimeout(() => {
      // Use getDisplaySetsBy with a comparator function
      const allDisplaySets = displaySetService.getDisplaySetsBy(ds => {
        const dsStudyUID = ds.StudyInstanceUID || (ds as any).studyInstanceUID;
        return dsStudyUID === studyInstanceUID;
      });
      
      console.log('[AnnotationPersistence] Total display sets for study:', allDisplaySets.length);
      
      const srDisplaySets = allDisplaySets.filter(ds => {
        const modality = ds.Modality || (ds as any).modality;
        return modality === 'SR';
      });
      
      console.log('[AnnotationPersistence] Found', srDisplaySets.length, 'SR display sets for study', studyInstanceUID);
      
      if (srDisplaySets.length > 0) {
        pendingSRsRef.current = srDisplaySets;
        setPendingAnnotationsCount(srDisplaySets.length);
        hasHydrated.current = false;
      } else {
        hasHydrated.current = true; // No previous SRs, safe to auto-save
      }
    }, 3000);

    const subs = [
      measurementService.subscribe(measurementService.EVENTS.MEASUREMENT_ADDED, debouncedSave),
      measurementService.subscribe(measurementService.EVENTS.MEASUREMENT_REMOVED, debouncedSave),
      measurementService.subscribe(measurementService.EVENTS.MEASUREMENT_UPDATED, debouncedSave),
    ];

    return () => {
      clearTimeout(checkTimer);
      subs.forEach(s => s.unsubscribe());
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [studyInstanceUID, measurementService, displaySetService, debouncedSave]);

  return { pendingAnnotationsCount, loadPendingAnnotations };
}
