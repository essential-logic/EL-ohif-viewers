import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brush as BrushIcon,
  AutoFixHigh as EraserIcon,
  Psychology as AiIcon,
  Add as PlusIcon,
  LibraryAdd as LayersAddIcon,
  Save as SaveIcon,
  CloudDownload as DownloadIcon,
  Visibility as EyeIcon,
  VisibilityOff as EyeOffIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Delete as DeleteIcon,
  CropSquare as RectIcon,
  FiberManualRecord as CircleIcon,
  ShapeLine as SculptIcon,
  FormatColorFill as FillIcon,
  DynamicFeed as InterpolateIcon,
  RadioButtonChecked as SphereIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { utilities as cstUtils } from '@cornerstonejs/tools';
import { ServicesManager, CommandsManager } from '@ohif/core';
import { GlassPanel } from './GlassPanel';
import { Box, Typography, IconButton, Slider, ButtonBase, Tooltip, Stack } from '@mui/material';

const segmentationUtils = cstUtils.segmentation;

interface OHIFSegment {
  segmentIndex: number;
  label: string;
  visible?: boolean;
  locked?: boolean;
  cachedStats?: Record<string, unknown>;
  active?: boolean;
}

interface OHIFSegmentation {
  segmentationId: string;
  label: string;
  segments: Record<number, OHIFSegment>;
  representation?: {
    type: string;
    [key: string]: unknown;
  };
}

interface RenderingConfig {
  fillAlpha?: number;
}

interface SegmentationPanelProps {
  servicesManager: ServicesManager;
  commandsManager: CommandsManager;
  activeTool?: string;
  setActiveTool?: (tool: string) => void;
  studyInstanceUIDs?: string | string[];
}

export function SegmentationPanel({
  servicesManager,
  commandsManager,
  setActiveTool: setGlobalActiveTool,
}: SegmentationPanelProps) {
  const { segmentationService, viewportGridService, toolGroupService } = servicesManager.services;
  const [segmentations, setSegmentations] = useState<OHIFSegmentation[]>([]);
  const [activeViewportId, setActiveViewportId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [globalOpacity, setGlobalOpacity] = useState(0.5);
  const [brushSize, setBrushSizeState] = useState(10);

  // Sync with active viewport
  useEffect(() => {
    const { activeViewportId: activeId } = viewportGridService.getState();
    setActiveViewportId(activeId);

    const unsubGrid = viewportGridService.subscribe(
      viewportGridService.EVENTS.ACTIVE_VIEWPORT_ID_CHANGED,
      (state: { activeViewportId: string }) => {
        if (state.activeViewportId) {
          setActiveViewportId(state.activeViewportId);
        }
      }
    );

    return () => unsubGrid.unsubscribe();
  }, [viewportGridService]);

  // Sync segmentations
  useEffect(() => {
    const updateSegmentations = () => {
      if (!activeViewportId) {
        return;
      }
      const reps = segmentationService.getSegmentationRepresentations(activeViewportId);
      const segs = reps.map(rep => {
        const segmentation = segmentationService.getSegmentation(rep.segmentationId);
        const segments: Record<number, OHIFSegment> = { ...segmentation.segments };

        // Enrich segments with visibility info from the service/cornerstone
        Object.keys(segments).forEach(index => {
          const segmentIndex = Number(index);
          segments[segmentIndex] = {
            ...(segments[segmentIndex] as any),
            visible: segmentationService.getSegmentVisibility(
              activeViewportId,
              rep.segmentationId,
              segmentIndex,
              rep.type
            ),
          };
        });

        return {
          ...segmentation,
          segments,
          representation: rep,
        } as unknown as OHIFSegmentation;
      });
      setSegmentations(segs);

      if (reps.length > 0) {
        const config = reps[0].config as RenderingConfig;
        if (config?.fillAlpha !== undefined) {
          setGlobalOpacity(config.fillAlpha);
        }
      }
    };

    updateSegmentations();

    const subscriptions = [
      segmentationService.subscribe(
        segmentationService.EVENTS.SEGMENTATION_MODIFIED,
        updateSegmentations
      ),
      segmentationService.subscribe(
        segmentationService.EVENTS.SEGMENTATION_REMOVED,
        updateSegmentations
      ),
      segmentationService.subscribe(
        segmentationService.EVENTS.SEGMENTATION_REPRESENTATION_MODIFIED,
        updateSegmentations
      ),
      segmentationService.subscribe(
        segmentationService.EVENTS.SEGMENTATION_ADDED,
        updateSegmentations
      ),
    ];

    return () => subscriptions.forEach(s => s.unsubscribe());
  }, [segmentationService, activeViewportId]);

  // Track active tool and UI state
  useEffect(() => {
    const updateActiveTool = () => {
      if (!activeViewportId) {
        return;
      }
      const toolGroup = toolGroupService.getToolGroupForViewport(activeViewportId);
      if (toolGroup) {
        const toolName = toolGroup.getActivePrimaryMouseButtonTool();
        setActiveTool(toolName);

        // Sync brush size if applicable
        const currentBrushSize = segmentationUtils.getBrushSizeForToolGroup(toolGroup.id);
        if (currentBrushSize) {
          setBrushSizeState(currentBrushSize);
        }

        // Update global state if available to sync toolbar
        if (setGlobalActiveTool && toolName) {
          setGlobalActiveTool(toolName);
        }
      }
    };

    updateActiveTool();

    // @ts-expect-error - toolGroupService.subscribe exists but types might be missing
    const unsubTools = toolGroupService.subscribe(
      toolGroupService.EVENTS.TOOL_ACTIVATED,
      updateActiveTool
    );

    return () => unsubTools.unsubscribe();
  }, [activeViewportId, toolGroupService, setGlobalActiveTool]);

  const activeSegmentation = useMemo(() => {
    if (!activeViewportId || segmentations.length === 0) {
      return null;
    }
    const internalActive = segmentationService.getActiveSegmentation(activeViewportId);
    if (!internalActive) {
      return null;
    }
    return segmentations.find(s => s.segmentationId === internalActive.segmentationId) || null;
  }, [activeViewportId, segmentationService, segmentations]);

  const activeSegmentIndex = useMemo(() => {
    if (!activeViewportId || !activeSegmentation) {
      return null;
    }
    const activeSeg = segmentationService.getActiveSegment(activeViewportId);
    return activeSeg?.segmentIndex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeViewportId, activeSegmentation, segmentationService, segmentations]);

  const handleToolClick = (toolName: string, options: { strategy?: string } = {}) => {
    const toolGroupIds = (toolGroupService as any).getToolGroupIds?.() || [];
    
    // Iterate through all tool groups to set active
    toolGroupIds.forEach((id: string) => {
      try {
        commandsManager.runCommand('setToolActive', {
          toolName,
          toolGroupId: id,
          ...options,
        });
      } catch (err) {
        // Ignore
      }
    });

    if (setGlobalActiveTool) {
      setGlobalActiveTool(toolName);
    }
    setActiveTool(toolName);
  };

  const handleCreateSegmentation = () => {
    commandsManager.runCommand('createLabelmapForViewport', {
      viewportId: activeViewportId,
      options: { createInitialSegment: true },
    });
  };

  const handleAddSegment = () => {
    if (activeSegmentation) {
      commandsManager.runCommand('addSegment', {
        segmentationId: activeSegmentation.segmentationId,
      });
    } else {
      handleCreateSegmentation();
    }
  };

  const handleLoadSegmentations = async () => {
    const { displaySetService, segmentationService, uiNotificationService } = servicesManager.services;
    // @ts-expect-error - services are populated dynamically
    const activeDisplaySets = displaySetService.getActiveDisplaySets();
    const segDisplaySets = activeDisplaySets.filter((ds: any) => ds.Modality === 'SEG');

    if (segDisplaySets.length === 0) {
      uiNotificationService.show({
        title: 'No Segmentations',
        message: 'No saved Segmentations found for this study.',
        type: 'info',
      });
      return;
    }

    let loadCount = 0;
    uiNotificationService.show({
      title: 'Loading Segmentations',
      message: `Fetching ${segDisplaySets.length} segmentation layer(s)...`,
      type: 'info',
    });

    for (const ds of segDisplaySets) {
      if (!ds.isLoaded) {
        try {
          await ds.load({ headers: {} });
          
          if (activeViewportId) {
             await segmentationService.addSegmentationRepresentation(activeViewportId, {
               segmentationId: ds.displaySetInstanceUID,
             });
          }
          loadCount++;
        } catch (error) {
          console.error('[Load Segmentations] Failed to load display set', ds.displaySetInstanceUID, error);
        }
      }
    }

    if (loadCount > 0) {
      uiNotificationService.show({
        title: 'Segmentations Loaded',
        message: `Successfully loaded ${loadCount} segmentation layer(s).`,
        type: 'success',
      });
    } else {
      uiNotificationService.show({
        title: 'Segmentations Loaded',
        message: 'All available segmentations are already loaded.',
        type: 'info',
      });
    }
  };

  const handleSaveSegmentation = async () => {
    if (!activeSegmentation) {
      return;
    }
    const { uiNotificationService } = servicesManager.services;
    try {
      uiNotificationService.show({
        title: 'Saving Segmentation',
        message: 'Generating DICOM SEG and storing to Orthanc...',
        type: 'info',
      });
      
      await commandsManager.runCommand('storeSegmentation', {
        segmentationId: activeSegmentation.segmentationId,
      });
      
      uiNotificationService.show({
        title: 'Success',
        message: 'Segmentation saved successfully to Orthanc.',
        type: 'success',
      });
    } catch (err) {
      console.error('[SegmentationPanel] Save failed:', err);
      uiNotificationService.show({
        title: 'Save Failed',
        message: err instanceof Error ? err.message : 'Unknown error during save',
        type: 'error',
      });
    }
  };

  const handleDeleteSegment = (segmentIndex: number) => {
    if (!activeSegmentation) {
      return;
    }
    commandsManager.runCommand('deleteSegment', {
      segmentationId: activeSegmentation.segmentationId,
      segmentIndex,
    });
  };

  const handleDeleteSegmentation = () => {
    if (!activeSegmentation) {
      return;
    }
    commandsManager.runCommand('deleteSegmentation', {
      segmentationId: activeSegmentation.segmentationId,
    });
  };

  const toggleVisibility = (segmentIndex: number) => {
    if (!activeSegmentation) {
      return;
    }
    commandsManager.runCommand('toggleSegmentVisibility', {
      segmentationId: activeSegmentation.segmentationId,
      segmentIndex,
      type: activeSegmentation.representation?.type,
    });
  };

  const toggleLock = (segmentIndex: number) => {
    if (!activeSegmentation) {
      return;
    }
    commandsManager.runCommand('toggleSegmentLock', {
      segmentationId: activeSegmentation.segmentationId,
      segmentIndex,
    });
  };

  const handleOpacityChange = (_: unknown, value: number | number[]) => {
    const alpha = (value as number) / 100;
    setGlobalOpacity(alpha);
    commandsManager.runCommand('setFillAlpha', { value: alpha });
  };

  const handleBrushSizeChange = (_: unknown, value: number | number[]) => {
    const size = value as number;
    setBrushSizeState(size);
    commandsManager.runCommand('setBrushSize', { value: size });
  };

  const getSegmentColor = (segmentIndex: number) => {
    if (!activeViewportId || !activeSegmentation) {
      return '#3b82f6';
    }
    const color = segmentationService.getSegmentColor(
      activeViewportId,
      activeSegmentation.segmentationId,
      segmentIndex
    );
    return color ? `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)` : '#3b82f6';
  };

  const segments = useMemo(() => {
    if (!activeSegmentation?.segments) {
      return [];
    }
    // Numerical sort for segment indices
    return Object.values(activeSegmentation.segments)
      .filter((s): s is OHIFSegment => s !== undefined)
      .sort((a, b) => a.segmentIndex - b.segmentIndex);
  }, [activeSegmentation]);

  const toolGroups = [
    {
      title: 'Manual Tools',
      tools: [
        { id: 'Brush', actualToolName: 'CircularBrush', icon: BrushIcon, label: 'Paint' },
        { id: 'Eraser', actualToolName: 'CircularEraser', icon: EraserIcon, label: 'Erase' },
        { id: 'PaintFill', actualToolName: 'PaintFill', icon: FillIcon, label: 'Fill' },
        { id: 'SculptorTool', actualToolName: 'SculptorTool', icon: SculptIcon, label: 'Sculpt' },
      ],
    },
    {
      title: 'Scissors',
      tools: [
        { id: 'CircleScissors', actualToolName: 'CircleScissors', icon: CircleIcon, label: 'Circle' },
        { id: 'RectangleScissors', actualToolName: 'RectangleScissors', icon: RectIcon, label: 'Square' },
        { id: 'SphereScissors', actualToolName: 'SphereScissors', icon: SphereIcon, label: 'Sphere' },
      ],
    },
    {
      title: 'AI & Automation',
      tools: [
        { id: 'MarkerLabelmap', actualToolName: 'MarkerLabelmap', icon: AiIcon, label: 'AI Label' },
        { id: 'LabelmapSlicePropagation', actualToolName: 'LabelmapSlicePropagation', icon: InterpolateIcon, label: 'Propagate' },
      ],
    },
  ];

  const isBrushActive = activeTool === 'CircularBrush' || activeTool === 'CircularEraser';

  return (
    <GlassPanel sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" fontWeight={800} color="text.primary" sx={{ letterSpacing: 1.5, fontSize: '0.75rem' }}>
          SEGMENTATION
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Load Saved Segmentations">
            <IconButton
              size="small"
              onClick={handleLoadSegmentations}
              sx={{
                color: 'info.main',
                bgcolor: 'rgba(59, 130, 246, 0.1)',
                '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' },
              }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {activeSegmentation && (
            <Tooltip title="Save Current Segmentation">
              <IconButton
                size="small"
                onClick={handleSaveSegmentation}
                sx={{
                  color: 'primary.main',
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                  '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' },
                }}
              >
                <SaveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {activeSegmentation && (
            <Tooltip title="Delete Current Segmentation Layer">
              <IconButton
                size="small"
                onClick={handleDeleteSegmentation}
                sx={{
                  color: 'error.main',
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Add New Segmentation Layer">
            <IconButton
              size="small"
              onClick={handleCreateSegmentation}
              sx={{
                color: 'success.main',
                bgcolor: 'rgba(34, 197, 94, 0.1)',
                '&:hover': { bgcolor: 'rgba(34, 197, 94, 0.2)' },
              }}
            >
              <LayersAddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Brush Size Slider (Conditional) */}
      {isBrushActive && (
        <Box sx={{ px: 1, py: 1.5, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.65rem' }}>
              Brush Size
            </Typography>
            <Typography variant="caption" color="primary.main" fontWeight={800} sx={{ fontSize: '0.65rem' }}>
              {brushSize}px
            </Typography>
          </Box>
          <Slider
            size="small"
            value={brushSize}
            min={1}
            max={100}
            onChange={handleBrushSizeChange}
            sx={{
              color: 'primary.main',
              height: 4,
              '& .MuiSlider-thumb': {
                width: 10,
                height: 10,
                transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                '&:before': { display: 'none' },
              },
            }}
          />
        </Box>
      )}

      {/* Tools Section */}
      <Box sx={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {toolGroups.map((group, gIdx) => (
          <Box key={gIdx} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 700,
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                opacity: 0.6,
              }}
            >
              {group.title}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
              {group.tools.map(tool => {
                const isActive = activeTool === tool.actualToolName;
                return (
                  <Tooltip key={tool.id} title={tool.label} placement="top">
                    <ButtonBase
                      component={motion.button}
                      onClick={() => handleToolClick(tool.actualToolName)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 1,
                        borderRadius: 1.5,
                        aspectRatio: '1/1',
                        bgcolor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid',
                        borderColor: isActive ? 'primary.main' : 'rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <tool.icon sx={{ fontSize: 18, color: isActive ? 'primary.main' : 'text.secondary' }} />
                    </ButtonBase>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Segments List Section */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              textTransform: 'uppercase',
              fontWeight: 800,
              fontSize: '0.6rem',
              opacity: 0.6,
            }}
          >
            Segments {segments.length > 0 && `(${segments.length})`}
          </Typography>
          <Tooltip title="Add New Segment to Current Layer">
            <IconButton
              size="small"
              onClick={handleAddSegment}
              sx={{
                p: 0.5,
                color: 'primary.main',
                bgcolor: 'rgba(59, 130, 246, 0.05)',
                '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.15)' },
              }}
            >
              <PlusIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <AnimatePresence mode="popLayout">
            {segments.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center', opacity: 0.4 }}>
                <Typography variant="caption" color="text.secondary">
                  No segments created
                </Typography>
              </Box>
            ) : (
              segments.map(segment => {
                const isActive = activeSegmentIndex === segment.segmentIndex;
                const color = getSegmentColor(segment.segmentIndex);

                return (
                  <motion.div key={segment.segmentIndex} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} layout>
                    <Box
                      onClick={() => {
                        if (activeSegmentation) {
                          commandsManager.runCommand('setActiveSegmentAndCenter', {
                            segmentationId: activeSegmentation.segmentationId,
                            segmentIndex: segment.segmentIndex,
                          });
                        }
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                        p: 1.25,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        bgcolor: isActive ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid',
                        borderColor: isActive ? 'primary.main' : 'transparent',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.05)',
                          borderColor: isActive ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: color,
                          boxShadow: `0 0 8px ${color}`,
                          flexShrink: 0,
                        }}
                      />

                      <Typography
                        variant="body2"
                        sx={{
                          flex: 1,
                          fontWeight: 700,
                          color: 'text.primary',
                          fontSize: '0.8rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {segment.segmentIndex}. {segment.label}
                      </Typography>

                      <Stack direction="row" spacing={0} onClick={e => e.stopPropagation()}>
                        <Tooltip title={segment.visible !== false ? 'Hide' : 'Show'}>
                          <IconButton
                            size="small"
                            onClick={() => toggleVisibility(segment.segmentIndex)}
                            sx={{
                              p: 0.5,
                              color: segment.visible !== false ? 'primary.main' : 'text.disabled',
                              opacity: 0.8,
                            }}
                          >
                            {segment.visible !== false ? <EyeIcon sx={{ fontSize: 16 }} /> : <EyeOffIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={segment.locked ? 'Unlock' : 'Lock'}>
                          <IconButton
                            size="small"
                            onClick={() => toggleLock(segment.segmentIndex)}
                            sx={{
                              p: 0.5,
                              color: segment.locked ? 'warning.main' : 'text.disabled',
                              opacity: 0.8,
                            }}
                          >
                            {segment.locked ? <LockIcon sx={{ fontSize: 16 }} /> : <UnlockIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteSegment(segment.segmentIndex)}
                            sx={{
                              p: 0.5,
                              color: 'text.disabled',
                              '&:hover': { color: 'error.main' },
                              opacity: 0.6,
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </Box>
      </Box>

      {/* Global Controls Section */}
      <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.65rem' }}>
            Global Opacity
          </Typography>
          <Typography variant="caption" color="primary.main" fontWeight={800} sx={{ fontSize: '0.65rem' }}>
            {Math.round(globalOpacity * 100)}%
          </Typography>
        </Box>
        <Slider
          size="small"
          value={globalOpacity * 100}
          onChange={handleOpacityChange}
          sx={{
            color: 'primary.main',
            height: 4,
            '& .MuiSlider-thumb': {
              width: 10,
              height: 10,
              transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
              '&:before': { display: 'none' },
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0px 0px 0px 8px rgba(59, 130, 246, 0.16)',
              },
            },
          }}
        />
      </Box>
    </GlassPanel>
  );
}

SegmentationPanel.propTypes = {
  servicesManager: PropTypes.object.isRequired,
  commandsManager: PropTypes.object.isRequired,
  activeTool: PropTypes.string,
  setActiveTool: PropTypes.func,
};
