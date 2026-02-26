import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TextFields as TextIcon,
  NorthEast as ArrowIcon,
  CropSquare as RectangleIcon,
  RadioButtonUnchecked as EllipseIcon,
  Delete as TrashIcon,
  Visibility as EyeIcon,
  VisibilityOff as EyeOffIcon,
  Straighten as RulerIcon,
  DeleteSweep as ClearAllIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { GlassPanel } from './GlassPanel';
import { Box, Typography, IconButton, ButtonBase, Tooltip, Stack } from '@mui/material';

export function AnnotationPanel({ 
  servicesManager, 
  commandsManager, 
  activeTool: globalActiveTool, 
  setActiveTool: setGlobalActiveTool 
}) {
  const { measurementService, viewportGridService, toolGroupService } = servicesManager.services;
  const [measurements, setMeasurements] = useState([]);
  const [activeViewportId, setActiveViewportId] = useState(null);
  const [activeTool, setActiveTool] = useState(null);

  // Sync with active viewport
  useEffect(() => {
    const { activeViewportId: activeId } = viewportGridService.getState();
    setActiveViewportId(activeId);

    const unsubGrid = viewportGridService.subscribe(
      viewportGridService.EVENTS.ACTIVE_VIEWPORT_ID_CHANGED,
      (state) => {
        if (state.activeViewportId) {
          setActiveViewportId(state.activeViewportId);
        }
      }
    );

    return () => unsubGrid.unsubscribe();
  }, [viewportGridService]);

  // Sync measurements
  useEffect(() => {
    const updateMeasurements = () => {
      setMeasurements(measurementService.getMeasurements());
    };

    updateMeasurements();

    const subscriptions = [
      measurementService.subscribe(measurementService.EVENTS.MEASUREMENT_ADDED, updateMeasurements),
      measurementService.subscribe(measurementService.EVENTS.MEASUREMENT_REMOVED, updateMeasurements),
      measurementService.subscribe(measurementService.EVENTS.MEASUREMENT_UPDATED, updateMeasurements),
      measurementService.subscribe(measurementService.EVENTS.MEASUREMENTS_CLEARED, updateMeasurements),
    ];

    return () => subscriptions.forEach(s => s.unsubscribe());
  }, [measurementService]);

  // Track active tool and UI state
  useEffect(() => {
    const updateActiveTool = () => {
      if (!activeViewportId) return;
      const toolGroup = toolGroupService.getToolGroupForViewport(activeViewportId);
      if (toolGroup) {
        const toolName = toolGroup.getActivePrimaryMouseButtonTool();
        setActiveTool(toolName);
        
        // Update global state to sync toolbar
        if (setGlobalActiveTool && toolName) {
          setGlobalActiveTool(toolName);
        }
      }
    };

    updateActiveTool();

    const unsubTools = toolGroupService.subscribe(
      toolGroupService.EVENTS.TOOL_ACTIVATED,
      updateActiveTool
    );

    return () => unsubTools.unsubscribe();
  }, [activeViewportId, toolGroupService, setGlobalActiveTool]);

  const handleToolClick = (toolName) => {
    const toolGroup = toolGroupService.getToolGroupForViewport(activeViewportId);
    const toolGroupId = toolGroup?.id || 'default';
    const toolGroupIds = ['default', 'mpr', 'SRToolGroup', 'volume3d', toolGroupId];
    
    // Optimistic UI update
    setActiveTool(toolName);
    if (setGlobalActiveTool) {
      setGlobalActiveTool(toolName);
    }

    try {
      commandsManager.run('setToolActiveToolbar', {
        toolName,
        itemId: toolName,
        toolGroupIds,
      });
    } catch (e) {
      console.warn('AnnotationPanel: Failed to run setToolActiveToolbar', e);
      toolGroupIds.forEach(id => {
        commandsManager.run('setToolActive', { 
          toolName, 
          toolGroupId: id,
        });
      });
    }
  };

  const handleDelete = (uid) => {
    measurementService.remove(uid);
  };

  const handleToggleVisibility = (uid) => {
    commandsManager.run('toggleVisibilityMeasurement', { uid });
  };

  const handleClearAll = () => {
    measurementService.clearMeasurements();
  };

  const getDisplayName = (ann, index, allMeasurements) => {
    if (ann.label) return ann.label;
    
    const sameType = allMeasurements.filter(m => (m.toolName || m.type) === (ann.toolName || ann.type));
    const typeIndex = sameType.indexOf(ann) + 1;
    const typeName = ann.toolName || ann.type || 'Measurement';
    
    // Clean up internal names (e.g. ArrowAnnotate -> Arrow)
    const cleanName = typeName.replace('Annotate', '').replace('ROI', '');
    return `${cleanName} ${typeIndex}`;
  };

  const handleRename = (uid) => {
    commandsManager.run('setMeasurementLabel', { uid });
  };

  const handleJumpTo = (uid) => {
    commandsManager.run('jumpToMeasurement', { uid });
  };

  const tools = [
    { id: 'ArrowAnnotate', icon: TextIcon, label: 'Text' },
    { id: 'ArrowAnnotate', icon: ArrowIcon, label: 'Arrow' },
    { id: 'RectangleROI', icon: RectangleIcon, label: 'Rect' },
    { id: 'EllipticalROI', icon: EllipseIcon, label: 'Ellipse' },
  ];

  return (
    <GlassPanel sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          color="text.primary"
          sx={{ letterSpacing: 1.2, textTransform: 'uppercase' }}
        >
          ANNOTATIONS
        </Typography>
        <Tooltip title="Clear All Annotations">
          <IconButton
            size="small"
            onClick={handleClearAll}
            sx={{ 
                color: 'error.main',
                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }
            }}
          >
            <ClearAllIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Tools Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1.5,
          mb: 4,
        }}
      >
        {tools.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <Tooltip key={tool.id} title={tool.label} placement="top">
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
                  sx={{ 
                    fontSize: '0.65rem', 
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: 0.5 
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
            fontSize: '0.7rem'
          }}
        >
          Recent Activity
        </Typography>

        <AnimatePresence mode="popLayout">
          {measurements.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, opacity: 0.4 }}>
              <Typography variant="body2" color="text.secondary">
                No annotations found
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {measurements.map((ann, index) => (
                <motion.div
                  key={ann.uid}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Box
                    onClick={() => handleJumpTo(ann.uid)}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': { 
                        bgcolor: 'rgba(59, 130, 246, 0.04)', 
                        borderColor: 'primary.main',
                        '& .tool-actions': { opacity: 1 }
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                         <Box sx={{ 
                           width: 8, 
                           height: 8, 
                           borderRadius: '50%', 
                           bgcolor: ann.color || 'primary.main' 
                         }} />
                        <Typography
                          variant="caption"
                          sx={{ 
                            fontWeight: 800, 
                            color: ann.label ? 'primary.main' : 'text.primary', 
                            letterSpacing: 0.5 
                          }}
                        >
                          {getDisplayName(ann, index, measurements)}
                        </Typography>
                      </Box>
                      
                      <Box 
                        className="tool-actions"
                        sx={{ 
                          display: 'flex', 
                          gap: 0.3, 
                          opacity: 0.6,
                          transition: 'opacity 0.2s' 
                        }}
                      >
                        <Tooltip title="Rename">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRename(ann.uid);
                            }}
                            sx={{ p: 0.5, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                          >
                            <EditIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={(e) => {
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
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(ann.uid);
                          }}
                          sx={{ 
                            p: 0.5, 
                            color: 'text.secondary',
                            '&:hover': { color: 'error.main' }
                          }}
                        >
                          <TrashIcon sx={{ fontSize: 16 }} />
                        </IconButton>
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
                          borderLeft: '2px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        {Array.isArray(ann.displayText) ? ann.displayText.join(', ') : ann.displayText}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Typography
                        variant="caption"
                        sx={{
                            color: 'text.disabled',
                            fontSize: '0.6rem',
                            fontWeight: 600,
                        }}
                        >
                        {ann.metadata?.SeriesDescription || 'Local Annotation'}
                        </Typography>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Stack>
          )}
        </AnimatePresence>
      </Box>
    </GlassPanel>
  );
}
