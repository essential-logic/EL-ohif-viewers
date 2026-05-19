import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rectangle as RectangleIcon,
  RadioButtonUnchecked as EllipseIcon,
  Delete as TrashIcon,
  Visibility as EyeIcon,
  VisibilityOff as EyeOffIcon,
  Edit as EditIcon,
  CloudDone as SavedIcon,
  CloudUpload as SaveIcon,
  CloudDownload as CloudDownloadIcon,
  NorthEast as ArrowIcon,
  Straighten as LengthIcon,
  SquareFoot as AngleIcon,
  Architecture as CobbIcon,
  CompareArrows as BidirectionalIcon,
  Adjust as ProbeIcon,
  Gesture as FreehandIcon,
  Timeline as SplineIcon,
  Polyline as LivewireIcon,
  InvertColors as ThresholdIcon,
  CircleOutlined as CircleIcon,
  Layers as LayersIcon,
  Description as NotesIcon,
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
  extensionManager: any;
  activeTool?: string;
  setActiveTool?: (tool: string) => void;
  studyInstanceUIDs?: string | string[];
}

// ─── Tool definitions ───────────────────────────────────────────────────────

const TOOL_GROUPS = [
  {
    name: 'Measure',
    items: [
      { id: 'Length', icon: LengthIcon, label: 'Length' },
      { id: 'Bidirectional', icon: BidirectionalIcon, label: 'Bi-Dir' },
      { id: 'Angle', icon: AngleIcon, label: 'Angle' },
      { id: 'CobbAngle', icon: CobbIcon, label: 'Cobb' },
      { id: 'Probe', icon: ProbeIcon, label: 'Probe' },
    ],
  },
  {
    name: 'ROI',
    items: [
      { id: 'ArrowAnnotate', icon: ArrowIcon, label: 'Arrow' },
      { id: 'RectangleROI', icon: RectangleIcon, label: 'Rect' },
      { id: 'EllipticalROI', icon: EllipseIcon, label: 'Ellipse' },
      { id: 'CircleROI', icon: CircleIcon, label: 'Circle' },
    ],
  },
  {
    name: 'Draw',
    items: [
      { id: 'PlanarFreehandROI', icon: FreehandIcon, label: 'Free' },
      { id: 'SplineROI', icon: SplineIcon, label: 'Spline' },
      { id: 'LivewireContour', icon: LivewireIcon, label: 'Live' },
      { id: 'RectangleROIThreshold', icon: ThresholdIcon, label: 'Thresh' },
    ],
  },
] as const;

// ─── Helpers ────────────────────────────────────────────────────────────────

const getDisplayName = (
  ann: Measurement,
  index: number,
  allMeasurements: Measurement[]
): string => {
  const label = typeof ann.label === 'string' ? ann.label : '';
  if (label) return label;
  
  const type = String(ann.toolName || ann.type || 'Measurement');
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

  const [activeTab, setActiveTab] = useState<'tools' | 'layers' | 'notes'>('tools');
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [notes, setNotes] = useState('');
  const [activeViewportId, setActiveViewportId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const studyInstanceUID = Array.isArray(studyInstanceUIDs)
    ? studyInstanceUIDs[0]
    : studyInstanceUIDs;

  const syncMeasurements = useCallback(() => {
    setMeasurements(measurementService.getMeasurements());
  }, [measurementService]);

  useEffect(() => {
    syncMeasurements();
    const subs = [
      measurementService.subscribe(measurementService.EVENTS.MEASUREMENT_ADDED, syncMeasurements),
      measurementService.subscribe(measurementService.EVENTS.MEASUREMENT_REMOVED, syncMeasurements),
      measurementService.subscribe(measurementService.EVENTS.MEASUREMENT_UPDATED, syncMeasurements),
      measurementService.subscribe(measurementService.EVENTS.MEASUREMENTS_CLEARED, syncMeasurements),
    ];
    return () => subs.forEach(s => s.unsubscribe());
  }, [measurementService, syncMeasurements]);

  useEffect(() => {
    const { activeViewportId: id } = viewportGridService.getState();
    setActiveViewportId(id);
    const unsub = viewportGridService.subscribe(viewportGridService.EVENTS.ACTIVE_VIEWPORT_ID_CHANGED, (s: any) => setActiveViewportId(s.activeViewportId));
    return () => unsub.unsubscribe();
  }, [viewportGridService]);

  useEffect(() => {
    const update = () => {
      if (!activeViewportId) return;
      const tg = toolGroupService.getToolGroupForViewport(activeViewportId);
      if (tg) {
        const t = tg.getActivePrimaryMouseButtonTool();
        setActiveTool(t);
        if (setGlobalActiveTool && t) setGlobalActiveTool(t);
      }
    };
    update();
    const unsub = (toolGroupService as any).subscribe(toolGroupService.EVENTS.TOOL_ACTIVATED, update);
    return () => unsub.unsubscribe();
  }, [activeViewportId, toolGroupService, setGlobalActiveTool]);

  const handleLoadPrevious = useCallback(async () => {
    if (!studyInstanceUID) return;
    setIsLoadingPrevious(true);
    try {
      const saved = await loadAnnotations(studyInstanceUID);
      if (!saved?.length) return;
      const { displaySetService } = servicesManager.services;
      let count = 0;
      saved.forEach(m => {
        try {
          if (!validateAnnotation(m).isValid) return;
          const clean: any = { ...m };
          delete clean.displaySetInstanceUID;
          const sop = m.SOPInstanceUID || m.sopInstanceUid;
          const series = m.referenceSeriesUID || m.seriesInstanceUid;
          const ds = displaySetService.getDisplaySetForSOPInstanceUID(sop, series) || displaySetService.getDisplaySetForSOPInstanceUID(sop, null);
          if (!ds) return;
          clean.displaySetInstanceUID = ds.displaySetInstanceUID;
          const source = measurementService.getSource(clean.source?.name || 'Cornerstone3DTools', clean.source?.version || '0.1');
          if (measurementService.addRawMeasurement(source, clean.toolName || clean.type, { annotation: clean }, (d: any) => d.annotation, extensionManager.getActiveDataSourceOrNull())) count++;
        } catch (e) { console.warn(e); }
      });
      if (count > 0) setTimeout(() => (servicesManager.services.cornerstoneViewportService as any).getRenderingEngine()?.render(), 250);
    } catch (e) { console.error(e); } finally { setIsLoadingPrevious(false); }
  }, [studyInstanceUID, measurementService, servicesManager.services, extensionManager]);

  const handleSave = useCallback(async () => {
    if (!studyInstanceUID) return;
    setSaveStatus('saving');
    try {
      commandsManager.runCommand('promptSaveReport', { viewportId: activeViewportId });
      await saveAnnotations(studyInstanceUID, measurementService.getMeasurements());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) { setSaveStatus('idle'); }
  }, [studyInstanceUID, measurementService, commandsManager, activeViewportId]);

  const handleToolClick = useCallback((toolName: string) => {
    setActiveTool(toolName);
    if (setGlobalActiveTool) setGlobalActiveTool(toolName);
    const tgId = toolGroupService.getToolGroupForViewport(activeViewportId)?.id || 'default';
    const groups = ['default', 'mpr', 'SRToolGroup', 'volume3d', tgId];
    commandsManager.runCommand('setToolActiveToolbar', { toolName, itemId: toolName, toolGroupIds: groups });
    try {
      const tgs = (toolGroupService as any).getToolGroups?.() || [];
      tgs.forEach((tg: any) => commandsManager.runCommand('setToolActive', { toolName, toolGroupId: tg.id || tg }));
    } catch (e) {}
  }, [activeViewportId, commandsManager, toolGroupService, setGlobalActiveTool]);

  const handleDelete = useCallback((uid: string) => measurementService.remove(uid), [measurementService]);
  const handleToggleVisibility = useCallback((uid: string) => commandsManager.runCommand('toggleVisibilityMeasurement', { uid }), [commandsManager]);
  const handleRename = useCallback((uid: string) => commandsManager.runCommand('setMeasurementLabel', { uid }), [commandsManager]);
  const handleJumpTo = useCallback((uid: string) => commandsManager.runCommand('jumpToMeasurement', { uid }), [commandsManager]);
  const handleClearAll = useCallback(() => setConfirmClearOpen(true), []);
  const handleConfirmedClear = useCallback(() => {
    measurementService.getMeasurements().forEach(m => measurementService.remove(m.uid));
    commandsManager.runCommand('clearMeasurements', {});
    setConfirmClearOpen(false);
  }, [measurementService, commandsManager]);

  return (
    <GlassPanel sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 1.2 }}>
      {/* Title Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, px: 0.5 }}>
        <Typography variant="subtitle1" fontWeight={900} sx={{ color: 'white', letterSpacing: 2, textTransform: 'uppercase', fontSize: '0.85rem' }}>
          Annotations
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
          <Tooltip title={saveStatus === 'saved' ? 'Saved' : 'Save all'}>
            <IconButton size="small" onClick={handleSave} sx={{ width: 28, height: 28, bgcolor: saveStatus === 'saved' ? 'success.main' : 'rgba(255,255,255,0.06)', color: 'white' }}>
              {saveStatus === 'saved' ? <SavedIcon sx={{ fontSize: 16 }} /> : <SaveIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={handleClearAll} disabled={measurements.length === 0} sx={{ width: 28, height: 28, color: 'error.main', bgcolor: 'rgba(239, 68, 68, 0.05)' }}>
            <TrashIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Tabs Switcher - Block Style */}
      <Box sx={{ display: 'flex', gap: '4px', mb: 2 }}>
        {[
          { id: 'tools', label: 'Tools', icon: EditIcon },
          { id: 'layers', label: 'Layers', icon: LayersIcon },
          { id: 'notes', label: 'Notes', icon: NotesIcon }
        ].map((t) => {
          const isSel = activeTab === t.id;
          return (
            <ButtonBase 
              key={t.id} 
              onClick={() => setActiveTab(t.id as any)} 
              sx={{ 
                flex: 1, 
                py: 1, 
                px: 0.5,
                display: 'flex', 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 0.8, 
                borderRadius: '4px',
                bgcolor: isSel ? '#ffffff' : 'rgba(255, 255, 255, 0.04)',
                color: isSel ? '#000000' : 'rgba(255, 255, 255, 0.5)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isSel ? '0 4px 12px rgba(0,0,0,0.5)' : 'none',
                '&:hover': {
                  bgcolor: isSel ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
                }
              }}
            >
              <t.icon sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                {t.label}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>

      {/* Content Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, pr: 0.5 }}>
        <AnimatePresence mode="wait">
          {activeTab === 'tools' && (
            <motion.div key="tools" initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }} transition={{ duration: 0.1 }}>
              {TOOL_GROUPS.map((group) => (
                <Box key={group.name} sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800, fontSize: '0.6rem', mb: 0.8, ml: 0.5, display: 'block' }}>{group.name}</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.6 }}>
                    {group.items.map(tool => {
                      const isActive = activeTool === tool.id;
                      return (
                        <Tooltip key={tool.id} title={tool.label} placement="top">
                          <ButtonBase onClick={() => handleToolClick(tool.id)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 0.8, borderRadius: 1.2, bgcolor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.02)', border: '1px solid', borderColor: isActive ? 'primary.main' : 'rgba(255, 255, 255, 0.03)', color: isActive ? 'primary.light' : 'text.secondary' }}>
                            <tool.icon sx={{ fontSize: 16, mb: 0.1 }} />
                            <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: isActive ? 700 : 500 }}>{tool.label}</Typography>
                          </ButtonBase>
                        </Tooltip>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </motion.div>
          )}

          {activeTab === 'layers' && (
            <motion.div key="layers" initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }} transition={{ duration: 0.1 }}>
              {measurements.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, px: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.05)' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem' }}>No annotations</Typography>
                  <Button onClick={handleLoadPrevious} disabled={isLoadingPrevious} startIcon={isLoadingPrevious ? <CircularProgress size={14} color="inherit" /> : <CloudDownloadIcon sx={{ fontSize: 16 }} />} sx={{ textTransform: 'none', fontSize: '0.75rem', px: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', color: 'primary.light' }}>{isLoadingPrevious ? 'Loading...' : 'Load Previous'}</Button>
                </Box>
              ) : (
                <Stack spacing={0.8}>
                   {measurements.map((ann, idx) => (
                    <Box key={ann.uid} onClick={() => handleJumpTo(ann.uid)} sx={{ p: 0.8, borderRadius: 1.2, bgcolor: 'rgba(255, 255, 255, 0.015)', border: '1px solid rgba(255, 255, 255, 0.04)', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.04)', borderColor: 'rgba(59, 130, 246, 0.4)', '& .actions': { opacity: 1 } } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: (typeof ann.color === 'string' ? ann.color : null) || 'primary.main' }} />
                          <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.7rem', color: 'text.primary' }}>{String(getDisplayName(ann, idx, measurements))}</Typography>
                        </Box>
                        <Box className="actions" sx={{ display: 'flex', gap: 0.2, opacity: 0, transition: 'opacity 0.2s' }}>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleRename(ann.uid); }} sx={{ p: 0.3, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}><EditIcon sx={{ fontSize: 12 }} /></IconButton>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleToggleVisibility(ann.uid); }} sx={{ p: 0.3, color: ann.isVisible ? 'primary.main' : 'text.disabled' }}>{ann.isVisible ? <EyeIcon sx={{ fontSize: 14 }} /> : <EyeOffIcon sx={{ fontSize: 14 }} />}</IconButton>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(ann.uid); }} sx={{ p: 0.3, color: 'text.secondary', '&:hover': { color: 'error.main' } }}><TrashIcon sx={{ fontSize: 14 }} /></IconButton>
                        </Box>
                      </Box>
                      {ann.displayText && (
                        <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem', color: 'text.secondary', mt: 0.2, ml: 2, borderLeft: '1px solid rgba(255,255,255,0.1)', pl: 1 }}>
                          {(() => {
                            if (typeof ann.displayText === 'string') return ann.displayText;
                            if (Array.isArray(ann.displayText)) return ann.displayText.join(', ');
                            if (typeof ann.displayText === 'object' && ann.displayText !== null) {
                              const { primary = [], secondary = [] } = ann.displayText as any;
                              return [...primary, ...secondary].filter(Boolean).join(', ');
                            }
                            return '';
                          })()}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div key="notes" initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }} transition={{ duration: 0.1 }}>
              <Box sx={{ p: 0.5 }}>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Clinical findings..."
                  style={{ width: '100%', minHeight: '180px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: 'white', padding: '12px', fontSize: '0.8rem', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                />
                <Button fullWidth variant="contained" onClick={() => setSaveStatus('saved')} sx={{ mt: 1.5, bgcolor: 'rgba(59, 130, 246, 0.1)', color: 'primary.light', py: 1, borderRadius: 1.5, textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' } }}>Save Findings</Button>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Persistence Notifications */}
      <Snackbar open={saveStatus === 'saved'} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} autoHideDuration={2000} onClose={() => setSaveStatus('idle')}>
        <Alert severity="success" variant="filled" sx={{ fontSize: '0.75rem' }}>Changes synchronized</Alert>
      </Snackbar>

      {/* Global Dialogs */}
      <Dialog open={confirmClearOpen} onClose={() => setConfirmClearOpen(false)} PaperProps={{ sx: { bgcolor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, backgroundImage: 'none' } }}>
        <DialogTitle sx={{ color: 'text.primary', fontWeight: 700, fontSize: '1rem' }}>Clear All Annotations?</DialogTitle>
        <DialogContent><Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>This will permanently remove all measurements from the current session.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmClearOpen(false)} sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleConfirmedClear} variant="contained" color="error" sx={{ textTransform: 'none', px: 3 }}>Clear All</Button>
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
