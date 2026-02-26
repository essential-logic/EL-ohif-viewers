import { useState, type MouseEvent } from 'react';
import { 
  Straighten as RulerIcon, 
  Circle as CircleIcon, 
  CropRotate as CropRotateIcon,
  CropSquare as SquareIcon, 
  NearMe as MousePointerIcon, 
  PanTool as HandIcon,
  ContentCut as ScissorsIcon,
  Contrast as PaletteIcon,
  Layers as LayersIcon,
  Edit as ActivityIcon,
  ZoomIn as ZoomInIcon, 
  ZoomOut as ZoomOutIcon, 
  RotateRight as RotateCwIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Fullscreen as MaximizeIcon, 
  Tune as TuneIcon,
  Print as PrintIcon,
  CameraAlt as ScreenshotIcon,
  Save as SaveIcon,

  FlipCameraAndroid as FlipHorizontalIcon,
  FlipCameraIos as FlipVerticalIcon,
  InvertColors as InvertIcon,
  RestartAlt as ResetIcon,
  SwapVert as ScrollIcon,
  Search as MagnifyIcon,
  FilterCenterFocus as CrosshairsIcon,
  // More Menu Icons
  Sync as SyncIcon,
  Grid3x3 as GridIcon,
  ViewQuilt as OverlayIcon,
  Animation as CineIcon,
  Architecture as AngleIcon,
  LinearScale as CalibrationIcon,
  Description as TagIcon,
  BugReport as ProbeIcon,
  Label as LabelIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { GlassPanel } from './ui/glass-panel';
import { ToolGroup } from './ui/ToolGroup';
import { MeasurementPalette } from './MeasurementPalette';
import { Box, Divider, IconButton, Tooltip, Popover, Slider, Typography } from '@mui/material';
import { LayoutSelector } from './LayoutSelector';
import { ScreenshotModal } from './ScreenshotModal';
import { WindowLevelMenu } from './WindowLevelMenu';
import { motion, AnimatePresence } from 'motion/react';

interface ToolPanelProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  rotation: number;
  setRotation: (rotation: number) => void;
  brightness: number;
  setBrightness: (brightness: number) => void;
  contrast: number;
  setContrast: (contrast: number) => void;
  showOverlays: boolean;
  setShowOverlays: (show: boolean) => void;
  layout: { rows: number; cols: number };
  setLayout: (layout: { rows: number; cols: number }) => void;
  flipHorizontal: boolean;
  setFlipHorizontal: (flip: boolean) => void;
  flipVertical: boolean;
  setFlipVertical: (flip: boolean) => void;
  invert: boolean;
  setInvert: (invert: boolean) => void;
  onReset: () => void;
  onCaptureScreenshot: (settings: any) => void;
  onCineToggle: () => void;
  onSelectPreset?: (preset: string) => void;
  onSelectLut?: (lut: string) => void;
}

export function ToolPanel({
  activeTool,
  setActiveTool,
  rotation,
  setRotation,
  brightness,
  setBrightness,
  contrast,
  setContrast,
  showOverlays,
  setShowOverlays,
  layout,
  setLayout,
  flipHorizontal,
  setFlipHorizontal,
  flipVertical,
  setFlipVertical,
  invert,
  setInvert,
  onReset,
  onCaptureScreenshot,
  onCineToggle,
  onSelectPreset,
  onSelectLut
}: ToolPanelProps) {
  
  // State
  const [screenshotOpen, setScreenshotOpen] = useState(false);
  const [windowMenuAnchor, setWindowMenuAnchor] = useState<null | HTMLElement>(null);
  const [adjustmentsAnchor, setAdjustmentsAnchor] = useState<null | HTMLElement>(null);

  // Tool Definitions
  const navTools = [
    { id: 'select', icon: MousePointerIcon, label: 'Select' },
    { id: 'pan', icon: HandIcon, label: 'Pan' },
    { id: 'scroll', icon: ScrollIcon, label: 'Stack Scroll' },
    { id: 'magnify', icon: MagnifyIcon, label: 'Magnify' }
  ];

  const transformTools = [
    { id: 'rotate', icon: RotateCwIcon, label: 'Rotate 90°', action: () => setRotation((rotation + 90) % 360) },
    { id: 'flip-h', icon: FlipHorizontalIcon, label: 'Flip Horizontal', action: () => setFlipHorizontal(!flipHorizontal) },
    { id: 'flip-v', icon: FlipVerticalIcon, label: 'Flip Vertical', action: () => setFlipVertical(!flipVertical) }
  ];

  const measureTools = [
    { id: 'measure', icon: RulerIcon, label: 'Length' },
    { id: 'angle', icon: AngleIcon, label: 'Angle' },
    { id: 'circle', icon: CircleIcon, label: 'Circle ROI' },
    { id: 'rectangle', icon: SquareIcon, label: 'Rectangle ROI' },
    { id: 'probe', icon: ProbeIcon, label: 'Probe' },
    { id: 'crosshairs', icon: CrosshairsIcon, label: 'Crosshairs' },
    { id: 'calibration', icon: CalibrationIcon, label: 'Calibration' }
  ];

  const annotateTools = [
    { id: 'annotate', icon: ActivityIcon, label: 'Annotate' },
    { id: 'label', icon: LabelIcon, label: 'Label' },
    { id: 'tags', icon: TagIcon, label: 'DICOM Tags' }
  ];

  const adjustmentTools = [
    { id: 'windowing', icon: PaletteIcon, label: 'Window / Level', action: (e: any) => setWindowMenuAnchor(e.currentTarget) },
    { id: 'invert', icon: InvertIcon, label: 'Invert Colors', action: () => setInvert(!invert) },
    { id: 'reset', icon: ResetIcon, label: 'Reset View', action: onReset }
  ];

  const viewTools = [
    { id: 'overlays', icon: showOverlays ? VisibilityIcon : VisibilityOffIcon, label: showOverlays ? 'Hide Overlays' : 'Show Overlays', action: () => setShowOverlays(!showOverlays) },
    { id: 'cine', icon: CineIcon, label: 'Cine Player', action: onCineToggle },
    { id: 'sync', icon: SyncIcon, label: 'Sync Slices' },
    { id: 'ref-lines', icon: GridIcon, label: 'Reference Lines' },
    { id: 'layers', icon: LayersIcon, label: 'Layers' },
    { id: 'fullscreen', icon: MaximizeIcon, label: 'Fullscreen' }
  ];

  const exportTools = [
    { id: 'screenshot', icon: ScreenshotIcon, label: 'Screenshot', action: () => setScreenshotOpen(true) },
    { id: 'print', icon: PrintIcon, label: 'Print' },
    { id: 'save', icon: SaveIcon, label: 'Save Study' }
  ];


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0, width: '100%', alignItems: 'center' }}>
      
      {/* Main Toolkit */}
      <GlassPanel 
        className="flex-shrink scrollbar-hide" 
        sx={{ 
            p: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            width: '100%',
            overflowY: 'auto',
            minHeight: 0,
            gap: 1.5,
            bgcolor: 'rgba(15, 23, 42, 0.6) !important', // Updates for dark theme consistency
            border: '1px solid rgba(255,255,255,0.08) !important'
        }}
      >
        {/* Navigation Group */}
        <ToolGroup tools={navTools} activeTool={activeTool} onSelect={setActiveTool} />
        
        <Divider sx={{ width: '60%', bgcolor: 'rgba(255,255,255,0.1)' }} />
        
        {/* Transform Group */}
        <ToolGroup tools={transformTools} activeTool={activeTool} onSelect={(id) => { /* Action handles it */ }} />

        {/* Adjustment Group */}
        <ToolGroup tools={adjustmentTools} activeTool={activeTool} onSelect={(id) => { /* Action handles it */ }} />
        
        <Divider sx={{ width: '60%', bgcolor: 'rgba(255,255,255,0.1)' }} />

        {/* Measurement Group */}
        <ToolGroup tools={measureTools} activeTool={activeTool} onSelect={setActiveTool} />

        {/* Annotation Group */}
        <ToolGroup tools={annotateTools} activeTool={activeTool} onSelect={setActiveTool} />

        <Divider sx={{ width: '60%', bgcolor: 'rgba(255,255,255,0.1)' }} />

        {/* View Group */}
        <ToolGroup tools={viewTools} activeTool={activeTool} onSelect={setActiveTool} />
        
        {/* Layout Selector (Keep as is, distinct interactive element) */}
        <LayoutSelector 
            currentLayout={`${layout.rows}x${layout.cols}`}
            onLayoutChange={(_, rows, cols) => setLayout({ rows, cols })}
            trigger={
                <Tooltip title="Grid Layout" placement="right">
                    <IconButton 
                        sx={{ 
                            p: 1.5, 
                            borderRadius: 1, 
                            color: '#94a3b8',
                            '&:hover': { color: '#f8fafc', bgcolor: 'rgba(255,255,255,0.05)' }
                        }}
                    >
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.25, width: 14, height: 14 }}>
                            <Box sx={{ bgcolor: 'currentColor', borderRadius: 0.25 }} />
                            <Box sx={{ bgcolor: 'currentColor', borderRadius: 0.25 }} />
                            <Box sx={{ bgcolor: 'currentColor', borderRadius: 0.25 }} />
                            <Box sx={{ bgcolor: 'currentColor', borderRadius: 0.25 }} />
                        </Box>
                    </IconButton>
                </Tooltip>
            }
        />

        <Divider sx={{ width: '60%', bgcolor: 'rgba(255,255,255,0.1)' }} />

        {/* Export Group */}
        <ToolGroup tools={exportTools} activeTool={activeTool} onSelect={() => {}} />

        <Box sx={{ mt: 'auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            
            {/* Measurement Palette (Inline) */}
            <AnimatePresence>
                {(activeTool === 'measure' || activeTool === 'annotate' || activeTool === 'angle' || activeTool === 'circle' || activeTool === 'rectangle') && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ width: '100%', overflow: 'hidden' }}
                >
                    <MeasurementPalette />
                </motion.div>
                )}
            </AnimatePresence>

            {/* Image Adjustments (Tune) */}
            <Tooltip title="Image Adjustments" placement="right">
                <IconButton 
                    onClick={(e) => setAdjustmentsAnchor(e.currentTarget)} 
                    sx={{ 
                        color: Boolean(adjustmentsAnchor) ? '#3b82f6' : '#94a3b8',
                        p: 1.5,
                        '&:hover': { color: '#f8fafc', bgcolor: 'rgba(255,255,255,0.05)' } 
                    }}
                >
                    <TuneIcon />
                </IconButton>
            </Tooltip>
        </Box>
      </GlassPanel>

      {/* Popovers / Modals */}
      <ScreenshotModal 
        open={screenshotOpen}
        onClose={() => setScreenshotOpen(false)}
        onSave={onCaptureScreenshot}
      />

      <Popover
        open={Boolean(windowMenuAnchor)}
        anchorEl={windowMenuAnchor}
        onClose={() => setWindowMenuAnchor(null)}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none', ml: 1 } }}
      >
         <GlassPanel sx={{ p: 0, overflow: 'hidden' }}>
            <WindowLevelMenu 
                onBack={() => setWindowMenuAnchor(null)}
                onSelectPreset={(p) => { onSelectPreset?.(p); setWindowMenuAnchor(null); }}
                onSelectLut={(l) => { onSelectLut?.(l); setWindowMenuAnchor(null); }}
            />
         </GlassPanel>
      </Popover>

      <Popover
        open={Boolean(adjustmentsAnchor)}
        anchorEl={adjustmentsAnchor}
        onClose={() => setAdjustmentsAnchor(null)}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        PaperProps={{
          sx: { p: 0, bgcolor: '#0f172a', overflow: 'visible', ml: 2, boxShadow: 6, border: '1px solid rgba(255,255,255,0.1)' }
        }}
      >
        <Box sx={{ p: 2, width: 200, color: 'text.secondary' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', mb: 2, display: 'block', color: '#94a3b8' }}>
               Adjustments
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                 <Typography variant="caption" color="inherit">Brightness</Typography>
                 <Typography variant="caption" color="inherit">{brightness}%</Typography>
              </Box>
              <Slider 
                size="small"
                value={brightness}
                onChange={(_, v) => setBrightness(v as number)}
                min={50}
                max={150}
                sx={{ color: '#3b82f6', height: 3, '& .MuiSlider-thumb': { width: 10, height: 10 } }}
              />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                 <Typography variant="caption" color="inherit">Contrast</Typography>
                 <Typography variant="caption" color="inherit">{contrast}%</Typography>
              </Box>
              <Slider 
                size="small"
                value={contrast}
                onChange={(_, v) => setContrast(v as number)}
                min={50}
                max={150}
                sx={{ color: '#3b82f6', height: 3, '& .MuiSlider-thumb': { width: 10, height: 10 } }}
              />
            </Box>
          </Box>
        </Box>
      </Popover>

    </Box>
  );
}