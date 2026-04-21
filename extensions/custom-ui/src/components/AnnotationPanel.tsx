import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TextFields as TextIcon,
  NorthEast as ArrowIcon,
  CropSquare as RectangleIcon,
  RadioButtonUnchecked as EllipseIcon,
  Delete as TrashIcon,
  Visibility as EyeIcon,
  VisibilityOff as EyeOffIcon,
  DeleteSweep as ClearAllIcon,
  Edit as EditIcon,
  CloudDone as SavedIcon,
  CloudUpload as SaveIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { ServicesManager, CommandsManager } from '@ohif/core';
import { GlassPanel } from './GlassPanel';
import { saveAnnotations, loadAnnotations } from '../lib/studyService';
import { validateAnnotation } from '../lib/annotationValidation';
import {
  Box,
  Typography,
  IconButton,
  ButtonBase,
  Tooltip,
  Stack,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Measurement {
  uid: string;
  label?: string;
  toolName?: string;
  type?: string;
  color?: string;
  isVisible?: boolean;
  displayText?: string | string[];
  metadata?: { SeriesDescription?: string };
}

interface AnnotationPanelProps {
  servicesManager: ServicesManager;
  commandsManager: CommandsManager;
  extensionManager: ExtensionManager;
  activeTool?: string;
  setActiveTool?: (tool: string) => void;
  studyInstanceUIDs?: string | string[];
}

// ─── Tool definitions ───────────────────────────────────────────────────────

const TOOLS = [
  { id: 'ArrowAnnotate', icon: ArrowIcon, label: 'Arrow' },
  { id: 'RectangleROI', icon: RectangleIcon, label: 'Rect' },
  { id: 'CircleROI', icon: EllipseIcon, label: 'Ellipse' },
  { id: 'Length', icon: TextIcon, label: 'Length' },
] as const;

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Clean tool names for display: "ArrowAnnotate" → "Arrow", "RectangleROI" → "Rectangle" */
const getDisplayName = (
  ann: Measurement,
  index: number,
  allMeasurements: Measurement[]
): string => {
  if (ann.label) {
    return ann.label;
  }
  const type = ann.toolName || ann.type || 'Measurement';
  const sameType = allMeasurements.filter(m => (m.toolName || m.type) === type);
  const typeIndex = sameType.indexOf(ann) + 1;
  const cleanName = type.replace('Annotate', '').replace('ROI', '');
  return `${cleanName} ${typeIndex}`;
};

// ─── AnnotationPanel ────────────────────────────────────────────────────────

export function AnnotationPanel({
  servicesManager,
  commandsManager,
  extensionManager,
  activeTool: globalActiveTool,
  setActiveTool: setGlobalActiveTool,
  studyInstanceUIDs,
}: AnnotationPanelProps) {
  const { measurementService, viewportGridService, toolGroupService } = servicesManager.services;

  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [activeViewportId, setActiveViewportId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const studyInstanceUID = Array.isArray(studyInstanceUIDs)
    ? studyInstanceUIDs[0]
    : studyInstanceUIDs;

  // ─── Sync measurements from OHIF's measurementService (single source of truth) ─

  const syncMeasurements = useCallback(() => {
    const all = measurementService.getMeasurements();
    setMeasurements(all);
  }, [measurementService]);

  useEffect(() => {
    syncMeasurements();

    const subscriptions = [
      measurementService.subscribe(measurementService.EVENTS.MEASUREMENT_ADDED, syncMeasurements),
      measurementService.subscribe(measurementService.EVENTS.MEASUREMENT_REMOVED, syncMeasurements),
      measurementService.subscribe(measurementService.EVENTS.MEASUREMENT_UPDATED, syncMeasurements),
      measurementService.subscribe(
        measurementService.EVENTS.MEASUREMENTS_CLEARED,
        syncMeasurements
      ),
    ];

    return () => subscriptions.forEach(s => s.unsubscribe());
  }, [measurementService, syncMeasurements]);

  // ─── Sync active viewport ───────────────────────────────────────────────

  useEffect(() => {
    const { activeViewportId: id } = viewportGridService.getState();
    setActiveViewportId(id);

    const unsub = viewportGridService.subscribe(
      viewportGridService.EVENTS.ACTIVE_VIEWPORT_ID_CHANGED,
      (state: { activeViewportId: string }) => {
        if (state.activeViewportId) {
          setActiveViewportId(state.activeViewportId);
        }
      }
    );

    return () => unsub.unsubscribe();
  }, [viewportGridService]);

  // ─── Sync active tool state ─────────────────────────────────────────────

  useEffect(() => {
    const updateActiveTool = () => {
      if (!activeViewportId) {
        return;
      }
      const toolGroup = toolGroupService.getToolGroupForViewport(activeViewportId);
      if (toolGroup) {
        const toolName = toolGroup.getActivePrimaryMouseButtonTool();
        setActiveTool(toolName);
        if (setGlobalActiveTool && toolName) {
          setGlobalActiveTool(toolName);
        }
      }
    };

    updateActiveTool();

    const unsub = (
      toolGroupService as unknown as {
        subscribe: (name: string, cb: () => void) => { unsubscribe: () => void };
      }
    ).subscribe(toolGroupService.EVENTS.TOOL_ACTIVATED, updateActiveTool);

    return () => unsub.unsubscribe();
  }, [activeViewportId, toolGroupService, setGlobalActiveTool]);

  // ─── Manual Load Previous ───────────────────────────────────────────────

  const handleLoadPrevious = useCallback(async () => {
    if (!studyInstanceUID) {
      return;
    }

    setIsLoadingPrevious(true);
    try {
      const saved = await loadAnnotations(studyInstanceUID);
      if (saved && saved.length > 0) {
        const ALLOWED_KEYS = [
          'uid', 'color', 'data', 'getReport', 'displayText', 'SOPInstanceUID',
          'FrameOfReferenceUID', 'referenceStudyUID', 'referenceSeriesUID',
          'frameNumber', 'displaySetInstanceUID', 'label', 'isLocked', 'isVisible',
          'description', 'type', 'unit', 'points', 'source', 'toolName', 'metadata',
          'area', 'mean', 'stdDev', 'perimeter', 'length', 'shortestDiameter',
          'longestDiameter', 'cachedStats', 'isSelected', 'textBox', 'referencedImageId', 'isDirty',
        ];

        const { displaySetService } = servicesManager.services;

        let loadedCount = 0;
        saved.forEach(m => {
          try {
            // Validate the annotation data before attempting to hydrate.
            // This prevents crashes in the rendering engine due to malformed point data.
            const validation = validateAnnotation(m);
            if (!validation.isValid) {
              console.warn(`[AnnotationPanel] Skipping malformed annotation ${m.uid}: ${validation.reason}`);
              return;
            }

            // Strict filtering of keys to pass MeasurementService validation.
            // Database-specific keys like 'id' or 'study_instance_uid' will be stripped.
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
              console.warn(`[AnnotationPanel] Skipping annotation ${m.uid} - no matching display set found in current session.`);
              return;
            }

            // Deep clean to force imageId resolution by the extension.
            // Stale referencedImageIds from previous sessions can prevent rendering.
            if (cleanData.metadata) {
              const { referencedImageId, ...cleanMetadata } = cleanData.metadata;
              cleanData.metadata = cleanMetadata;
            }
            delete cleanData.referencedImageId;

            const source = measurementService.getSource(
              cleanData.source?.name || 'Cornerstone3DTools',
              cleanData.source?.version || '0.1'
            );

            // Structure required by cornerstone extension's RAW_MEASUREMENT_ADDED subscriber
            const wrappedData = {
              annotation: cleanData,
            };

            const result = measurementService.addRawMeasurement(
              source,
              cleanData.toolName || cleanData.type,
              wrappedData,
              (data: any) => data.annotation, // Schema passthrough
              extensionManager.getActiveDataSourceOrNull()
            );

            if (result) {
              loadedCount++;
            }
          } catch (err) {
            console.warn('[AnnotationPanel] Failed to hydrate measurement:', err);
          }
        });

        // Trigger a re-render of all viewports to show the newly added annotations
        const { cornerstoneViewportService } = servicesManager.services;
        if (cornerstoneViewportService && loadedCount > 0) {
          setTimeout(() => {
            try {
              cornerstoneViewportService.getRenderingEngine()?.render();
            } catch (renderError) {
              console.warn('[AnnotationPanel] Failed to trigger re-render:', renderError);
            }
          }, 250);
        }
        
        const { uiNotificationService } = servicesManager.services;
        if (loadedCount > 0) {
          uiNotificationService.show({
            title: 'Success',
            message: `Successfully loaded ${loadedCount} previous annotations`,
            type: 'success',
          });
        } else {
          uiNotificationService.show({
            title: 'Info',
            message: saved.length > 0 
              ? 'No annotations were valid for this study'
              : 'No previous annotations found for this study',
            type: 'info',
          });
        }
      } else {
        const { uiNotificationService } = servicesManager.services;
        uiNotificationService.show({
          title: 'Info',
          message: 'No previous annotations found for this study',
          type: 'info',
        });
      }
    } catch (e) {
      console.error('Failed to load measurements', e);
      const { uiNotificationService } = servicesManager.services;
      uiNotificationService.show({
        title: 'Error',
        message: 'Failed to fetch previous annotations',
        type: 'error',
      });
    } finally {
      setIsLoadingPrevious(false);
    }
  }, [studyInstanceUID, measurementService, servicesManager.services, extensionManager]);

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!studyInstanceUID) {
      return;
    }

    setSaveStatus('saving');
    try {
      // 1. Trigger OHIF local save prompt (UI behavior)
      const { activeViewportId: id } = viewportGridService.getState();
      commandsManager.runCommand('promptSaveReport', { viewportId: id });

      // 2. Immediate direct save to Supabase (bypassing debounce for manual click)
      const all = measurementService.getMeasurements();
      await saveAnnotations(studyInstanceUID, all);

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (e) {
      console.error('Failed to save measurements', e);
      setSaveStatus('idle');
      const { uiNotificationService } = servicesManager.services;
      uiNotificationService.show({
        title: 'Save Failed',
        message: e instanceof Error ? e.message : 'Failed to save measurements to database',
        type: 'error',
      });
    }
  }, [commandsManager, viewportGridService, measurementService, studyInstanceUID]);

  const handleToolClick = useCallback(
    (toolName: string) => {
      const toolGroup = toolGroupService.getToolGroupForViewport(activeViewportId) as unknown as {
        id: string;
      } | null;
      const toolGroupId = toolGroup?.id || 'default';
      const toolGroupIds = ['default', 'mpr', 'SRToolGroup', 'volume3d', toolGroupId];

      setActiveTool(toolName);
      if (setGlobalActiveTool) {
        setGlobalActiveTool(toolName);
      }

      // 1. Try to activate the tool in the active tool group first
      try {
        commandsManager.runCommand('setToolActiveToolbar', {
          toolName,
          itemId: toolName,
          toolGroupIds,
        });
      } catch {
        // Fallback if setToolActiveToolbar is not available or fails
        toolGroupIds.forEach(id => {
          commandsManager.runCommand('setToolActive', { toolName, toolGroupId: id });
        });
      }

      try {
        const tgs =
          (toolGroupService as any).getToolGroups?.() ||
          Object.values((toolGroupService as any).getState?.()?.toolGroups || {});

        tgs.forEach((tg: any) => {
          try {
            commandsManager.runCommand('setToolActive', {
              toolName,
              toolGroupId: tg.id || tg,
            });
          } catch (err) {
            // Ignore
          }
        });
      } catch (err) {
        console.warn('AnnotationPanel: Failed to iterate tool groups', err);
      }
    },
    [activeViewportId, commandsManager, toolGroupService, setGlobalActiveTool]
  );

  const handleDelete = useCallback(
    (uid: string) => {
      measurementService.remove(uid);
    },
    [measurementService]
  );

  const handleToggleVisibility = useCallback(
    (uid: string) => {
      commandsManager.runCommand('toggleVisibilityMeasurement', { uid });
    },
    [commandsManager]
  );

  const handleClearAll = useCallback(() => {
    setConfirmClearOpen(true);
  }, []);

  const handleConfirmedClear = useCallback(() => {
    const all = measurementService.getMeasurements();
    all.forEach(m => measurementService.remove(m.uid));
    commandsManager.runCommand('clearMeasurements', {});
    setConfirmClearOpen(false);
  }, [measurementService, commandsManager]);

  const handleRename = useCallback(
    (uid: string) => {
      commandsManager.runCommand('setMeasurementLabel', { uid });
    },
    [commandsManager]
  );

  const handleJumpTo = useCallback(
    (uid: string) => {
      commandsManager.runCommand('jumpToMeasurement', { uid });
    },
    [commandsManager]
  );

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <GlassPanel sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          color="text.primary"
          sx={{ letterSpacing: 1.2, textTransform: 'uppercase' }}
        >
          Annotations
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={saveStatus === 'saved' ? 'Saved!' : 'Mark as Saved'}>
            <IconButton
              size="small"
              onClick={handleSave}
              sx={{
                color: saveStatus === 'saved' ? 'success.main' : 'text.secondary',
                '&:hover': { bgcolor: 'rgba(34, 197, 94, 0.1)', color: 'success.main' },
                transition: 'color 0.3s',
              }}
            >
              {saveStatus === 'saved' ? (
                <SavedIcon fontSize="small" />
              ) : (
                <SaveIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear All Annotations">
            <span>
              <IconButton
                size="small"
                onClick={handleClearAll}
                disabled={measurements.length === 0}
                sx={{ color: 'error.main', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
              >
                <ClearAllIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Tool Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mb: 4 }}>
        {TOOLS.map(tool => {
          const isActive = activeTool === tool.id;
          return (
            <Tooltip
              key={tool.id + tool.label}
              title={tool.label}
              placement="top"
            >
              <ButtonBase
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleToolClick(tool.id)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1.5,
                  borderRadius: 3,
                  aspectRatio: '1/1',
                  bgcolor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid',
                  borderColor: isActive ? 'primary.main' : 'rgba(255, 255, 255, 0.08)',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'primary.main',
                    color: 'primary.main',
                  },
                }}
              >
                <tool.icon sx={{ fontSize: 24, mb: 1 }} />
                <Typography
                  variant="caption"
                  noWrap
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%',
                    textAlign: 'center',
                  }}
                >
                  {tool.label}
                </Typography>
              </ButtonBase>
            </Tooltip>
          );
        })}
      </Box>

      {/* Annotations List */}
      <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            fontWeight: 800,
            display: 'block',
            mb: 2,
            px: 0.5,
            fontSize: '0.7rem',
          }}
        >
          {measurements.length > 0
            ? `${measurements.length} Annotation${measurements.length !== 1 ? 's' : ''}`
            : 'No Annotations'}
        </Typography>

        <AnimatePresence mode="popLayout">
          {measurements.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                px: 2,
                borderRadius: 4,
                bgcolor: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                Use a tool above to add an annotation
              </Typography>

              <Button
                onClick={handleLoadPrevious}
                disabled={isLoadingPrevious}
                startIcon={
                  isLoadingPrevious ? (
                    <CircularProgress
                      size={16}
                      color="inherit"
                    />
                  ) : (
                    <CloudDownloadIcon sx={{ fontSize: 18 }} />
                  )
                }
                sx={{
                  color: 'primary.main',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  py: 1,
                  px: 4,
                  borderRadius: 2,
                  bgcolor: 'rgba(59, 130, 246, 0.08)',
                  '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.15)', transform: 'translateY(-1px)' },
                  '&:active': { transform: 'translateY(0px)' },
                  transition: 'all 0.2s',
                }}
              >
                {isLoadingPrevious ? 'Loading...' : 'Load Previous Annotations'}
              </Button>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {measurements.map((ann, index) => (
                <motion.div
                  key={ann.uid}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.3) }}
                >
                  <Box
                    onClick={() => handleJumpTo(ann.uid)}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      cursor: 'pointer',
                      position: 'relative',
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      '&:hover': {
                        bgcolor: 'rgba(59, 130, 246, 0.04)',
                        borderColor: 'primary.main',
                        '& .tool-actions': { opacity: 1 },
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: ann.color || 'primary.main',
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            color: ann.label ? 'primary.main' : 'text.primary',
                            letterSpacing: 0.5,
                          }}
                        >
                          {getDisplayName(ann, index, measurements)}
                        </Typography>
                      </Box>

                      <Box
                        className="tool-actions"
                        sx={{ display: 'flex', gap: 0.3, opacity: 0.6, transition: 'opacity 0.2s' }}
                      >
                        <Tooltip title="Rename">
                          <IconButton
                            size="small"
                            onClick={e => {
                              e.stopPropagation();
                              handleRename(ann.uid);
                            }}
                            sx={{
                              p: 0.5,
                              color: 'text.secondary',
                              '&:hover': { color: 'primary.main' },
                            }}
                          >
                            <EditIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={ann.isVisible ? 'Hide' : 'Show'}>
                          <IconButton
                            size="small"
                            onClick={e => {
                              e.stopPropagation();
                              handleToggleVisibility(ann.uid);
                            }}
                            sx={{ p: 0.5, color: ann.isVisible ? 'primary.main' : 'text.disabled' }}
                          >
                            {ann.isVisible ? (
                              <EyeIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <EyeOffIcon sx={{ fontSize: 16 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={e => {
                              e.stopPropagation();
                              handleDelete(ann.uid);
                            }}
                            sx={{
                              p: 0.5,
                              color: 'text.secondary',
                              '&:hover': { color: 'error.main' },
                            }}
                          >
                            <TrashIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {ann.displayText && ann.displayText.length > 0 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          fontSize: '0.75rem',
                          lineHeight: 1.4,
                          mb: 1,
                          pl: 2,
                          borderLeft: '2px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        {Array.isArray(ann.displayText)
                          ? ann.displayText.join(', ')
                          : ann.displayText}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.disabled', fontSize: '0.6rem', fontWeight: 600 }}
                      >
                        {ann.metadata?.SeriesDescription || 'Current Viewport'}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Stack>
          )}
        </AnimatePresence>
      </Box>

      {/* Save confirmation toast */}
      <Snackbar
        open={saveStatus === 'saved'}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={2500}
        onClose={() => setSaveStatus('idle')}
      >
        <Alert
          severity="success"
          variant="filled"
          sx={{ fontSize: '0.8rem', py: 0.5 }}
        >
          Annotations acknowledged
        </Alert>
      </Snackbar>

      {/* Confirm Clear Dialog */}
      <Dialog
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
            backgroundImage: 'none',
          },
        }}
      >
        <DialogTitle sx={{ color: 'text.primary', fontWeight: 700 }}>
          Clear All Annotations?
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            This will permanently remove all {measurements.length} annotation
            {measurements.length !== 1 ? 's' : ''} from this session. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setConfirmClearOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmedClear}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2 }}
          >
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </GlassPanel>
  );
}

AnnotationPanel.propTypes = {
  servicesManager: PropTypes.object.isRequired,
  commandsManager: PropTypes.object.isRequired,
  activeTool: PropTypes.string,
  setActiveTool: PropTypes.func,
};
