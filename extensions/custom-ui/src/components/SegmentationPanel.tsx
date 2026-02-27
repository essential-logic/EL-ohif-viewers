import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brush as BrushIcon,
  AutoFixHigh as EraserIcon,
  Psychology as AiIcon,
  Add as PlusIcon,
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
import { ServicesManager, CommandsManager } from '@ohif/core';
import { GlassPanel } from './GlassPanel';
import { Box, Typography, IconButton, Slider, ButtonBase, Tooltip, Stack } from '@mui/material';

interface OHIFSegment {
  segmentIndex: number;
  label: string;
  visible?: boolean;
  locked?: boolean;
  cachedStats?: Record<string, unknown>;
  active?: boolean;
}

interface RenderingConfig {
  fillAlpha?: number;
}

interface SegmentationPanelProps {
  servicesManager: ServicesManager;
  commandsManager: CommandsManager;
  activeTool?: string;
  setActiveTool?: (tool: string) => void;
}

export function SegmentationPanel({
  servicesManager,
  commandsManager,
  setActiveTool: setGlobalActiveTool,
}: SegmentationPanelProps) {
  const { segmentationService, viewportGridService, toolGroupService } = servicesManager.services;
  const [segmentations, setSegmentations] = useState([]);
  const [activeViewportId, setActiveViewportId] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [activeStrategy, setActiveStrategy] = useState(null);
  const [globalOpacity, setGlobalOpacity] = useState(0.5);

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
        return {
          ...segmentation,
          representation: rep,
        };
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
        segmentationService.EVENTS.SEGMENTATION_DATA_MODIFIED,
        updateSegmentations
      ),
      segmentationService.subscribe(
        segmentationService.EVENTS.SEGMENTATION_REPRESENTATION_MODIFIED,
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

        // Get active strategy from options - more reliable in Cornerstone3D
        const options = toolGroup.getToolOptions(toolName);
        setActiveStrategy((options as { strategy?: string })?.strategy || null);

        // Update global state if available to sync toolbar
        if (setGlobalActiveTool && toolName) {
          setGlobalActiveTool(toolName);
        }
      }
    };

    updateActiveTool();

    const unsubTools = (
      toolGroupService as unknown as {
        subscribe: (name: string, cb: () => void) => { unsubscribe: () => void };
      }
    ).subscribe(toolGroupService.EVENTS.TOOL_ACTIVATED, updateActiveTool);

    return () => unsubTools.unsubscribe();
  }, [activeViewportId, toolGroupService, setGlobalActiveTool]);

  const activeSegmentation = useMemo(() => {
    if (!activeViewportId) {
      return null;
    }
    return segmentationService.getActiveSegmentation(activeViewportId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const toolGroup = toolGroupService.getToolGroupForViewport(activeViewportId) as unknown as {
      id: string;
    } | null;
    const toolGroupId = toolGroup?.id || 'default';
    const toolGroupIds = ['default', 'mpr', 'SRToolGroup', 'volume3d', toolGroupId];

    // Optimistic UI update
    setActiveTool(toolName);
    setActiveStrategy(options.strategy || null);
    if (setGlobalActiveTool) {
      setGlobalActiveTool(toolName);
    }

    try {
      commandsManager.runCommand('setToolActiveToolbar', {
        toolName,
        itemId: toolName,
        toolGroupIds,
        ...options,
      });
    } catch (e) {
      console.warn('SegmentationPanel: Failed to run setToolActiveToolbar', e);
      toolGroupIds.forEach(id => {
        commandsManager.runCommand('setToolActive', {
          toolName,
          toolGroupId: id,
          ...options,
        });
      });
    }
  };

  const handleAddSegment = () => {
    if (activeSegmentation) {
      commandsManager.runCommand('addSegment', {
        segmentationId: activeSegmentation.segmentationId,
      });
    } else {
      commandsManager.runCommand('createLabelmapForViewport', {
        viewportId: activeViewportId,
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

  const toggleVisibility = (segmentIndex: number) => {
    if (!activeSegmentation) {
      return;
    }
    commandsManager.runCommand('toggleSegmentVisibility', {
      segmentationId: activeSegmentation.segmentationId,
      segmentIndex,
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

  const getSegmentColor = segmentIndex => {
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
    if (!activeSegmentation) {
      return [];
    }
    return Object.values(activeSegmentation.segments).filter(s => s !== undefined);
  }, [activeSegmentation]);

  const toolGroups = [
    {
      title: 'Manual Tools',
      tools: [
        { id: 'Brush', icon: BrushIcon, label: 'Paint' },
        { id: 'Eraser', icon: EraserIcon, label: 'Erase', strategy: 'ERASE' },
        { id: 'PaintFill', icon: FillIcon, label: 'Fill' },
        { id: 'Sculptor', icon: SculptIcon, label: 'Sculpt' },
      ],
    },
    {
      title: 'Scissors',
      tools: [
        { id: 'CircleScissors', icon: CircleIcon, label: 'Circle' },
        { id: 'RectangleScissors', icon: RectIcon, label: 'Square' },
        { id: 'SphereScissors', icon: SphereIcon, label: 'Sphere' },
      ],
    },
    {
      title: 'AI & Automation',
      tools: [
        { id: 'MarkerLabelmap', icon: AiIcon, label: 'AI Label' },
        { id: 'LabelmapSlicePropagation', icon: InterpolateIcon, label: 'Propagate' },
      ],
    },
  ];

  return (
    <GlassPanel sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography
          variant="subtitle2"
          fontWeight={800}
          color="text.primary"
          sx={{ letterSpacing: 1.5, fontSize: '0.75rem' }}
        >
          SEGMENTATION
        </Typography>
        <Tooltip title="Add New Segment">
          <IconButton
            size="small"
            onClick={handleAddSegment}
            sx={{
              color: 'primary.main',
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' },
            }}
          >
            <PlusIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Tools Section */}
      <Box sx={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {toolGroups.map((group, gIdx) => (
          <Box
            key={gIdx}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
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
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 1,
              }}
            >
              {group.tools.map(tool => {
                const isEraser = tool.id === 'Eraser';
                const actualToolName = isEraser ? 'Brush' : tool.id;

                // Distinguish between Paint (Brush) and Eraser (Brush + ERASE strategy)
                let isActive = activeTool === actualToolName;
                if (isActive && actualToolName === 'Brush') {
                  if (isEraser) {
                    isActive = activeStrategy === 'ERASE';
                  } else {
                    isActive = activeStrategy !== 'ERASE';
                  }
                }

                return (
                  <Tooltip
                    key={tool.id}
                    title={tool.label}
                    placement="top"
                  >
                    <ButtonBase
                      component={motion.button}
                      onClick={() =>
                        handleToolClick(
                          actualToolName,
                          tool.strategy ? { strategy: tool.strategy } : {}
                        )
                      }
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
                        bgcolor: isActive
                          ? 'rgba(59, 130, 246, 0.15)'
                          : 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid',
                        borderColor: isActive ? 'primary.main' : 'rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: isActive
                            ? 'rgba(59, 130, 246, 0.2)'
                            : 'rgba(255, 255, 255, 0.06)',
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <tool.icon
                        sx={{ fontSize: 18, color: isActive ? 'primary.main' : 'text.secondary' }}
                      />
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
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            textTransform: 'uppercase',
            fontWeight: 800,
            mb: 1.5,
            fontSize: '0.6rem',
            opacity: 0.6,
          }}
        >
          Segments {segments.length > 0 && `(${segments.length})`}
        </Typography>

        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            pr: 0.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
          }}
        >
          <AnimatePresence mode="popLayout">
            {segments.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center', opacity: 0.4 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  No segments created
                </Typography>
              </Box>
            ) : (
              segments.map(segment => {
                const isActive = activeSegmentIndex === segment.segmentIndex;
                const color = getSegmentColor(segment.segmentIndex);
                const ohifSegment = segment as OHIFSegment;

                return (
                  <motion.div
                    key={segment.segmentIndex}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                  >
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
                        bgcolor: isActive
                          ? 'rgba(59, 130, 246, 0.08)'
                          : 'rgba(255, 255, 255, 0.02)',
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
                        {segment.label}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={0}
                        onClick={e => e.stopPropagation()}
                      >
                        <Tooltip title={ohifSegment.visible !== false ? 'Hide' : 'Show'}>
                          <IconButton
                            size="small"
                            onClick={() => toggleVisibility(segment.segmentIndex)}
                            sx={{
                              p: 0.5,
                              color:
                                ohifSegment.visible !== false ? 'primary.main' : 'text.disabled',
                              opacity: 0.8,
                            }}
                          >
                            {ohifSegment.visible !== false ? (
                              <EyeIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <EyeOffIcon sx={{ fontSize: 16 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={ohifSegment.locked ? 'Unlock' : 'Lock'}>
                          <IconButton
                            size="small"
                            onClick={() => toggleLock(segment.segmentIndex)}
                            sx={{
                              p: 0.5,
                              color: ohifSegment.locked ? 'warning.main' : 'text.disabled',
                              opacity: 0.8,
                            }}
                          >
                            {ohifSegment.locked ? (
                              <LockIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <UnlockIcon sx={{ fontSize: 16 }} />
                            )}
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
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            sx={{ fontSize: '0.65rem' }}
          >
            Global Opacity
          </Typography>
          <Typography
            variant="caption"
            color="primary.main"
            fontWeight={800}
            sx={{ fontSize: '0.65rem' }}
          >
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
