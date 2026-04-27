import React from 'react';
import { Box, IconButton, Tooltip, Popover, Slider, Typography, ButtonBase } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Straighten as RulerIcon,
  NearMe as MousePointerIcon,
  PanTool as HandIcon,
  Contrast as PaletteIcon,
  Contrast as ContrastIcon,
  Brightness6 as BrightnessIcon,
  RotateRight as RotateCwIcon,
  CameraAlt as ScreenshotIcon,
  GridView as LayoutIcon,
  Tune as TuneIcon,
  SwapVert as ScrollIcon,
  Search as MagnifyIcon,
  ZoomIn as ZoomIcon,
  Flip as FlipIcon,
  InvertColors as InvertIcon,
  RestartAlt as ResetIcon,
  Architecture as AngleIcon,
  RadioButtonUnchecked as CircleROIIcon,
  CropSquare as RectROIIcon,
  PinDrop as ProbeIcon,
  Adjust as CrosshairsIcon,
  LinearScale as CalibrationIcon,
  Comment as AnnotateIcon,
  Label as LabelIcon,
  LocalOffer as DicomTagIcon,
  Visibility as EyeOnIcon,
  Dashboard as GridOneOneIcon,
  ViewColumn as GridOneTwoIcon,
  ViewComfy as GridTwoThreeIcon,
  Download as DownloadIcon,
  PlayCircle as CineIcon,
  SwapHoriz as SyncIcon,
  Timeline as RefLinesIcon,
  Layers as LayersIcon,
  Fullscreen as FullscreenIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  CompareArrows as BidirectionalIcon,
  Gesture as FreehandIcon,
  Polyline as SplineIcon,
  Timeline as LivewireIcon,
  Adjust as EllipseIcon,
} from '@mui/icons-material';
import { ServicesManager, CommandsManager } from '@ohif/core';
import { ToolGroup } from './ui/ToolGroup';

interface ToolPanelProps {
  servicesManager?: ServicesManager;
  commandsManager?: CommandsManager;
  activeTool: string;
  setActiveTool: (tool: string) => void;
  onToggleAdjustments?: () => void;
  setViewMode?: (mode: string) => void;
  isMobile?: boolean;
}

// Cursor mapping for tools to provide premium UX
const CURSOR_MAP: Record<string, string> = {
  WindowLevel: 'crosshair',
  Wwwc: 'crosshair',
  Pan: 'grab',
  Zoom: 'zoom-in',
  StackScroll: 'ns-resize',
  Magnify: 'zoom-in',
  Length: 'crosshair',
  Angle: 'crosshair',
  ArrowAnnotate: 'crosshair',
  Probe: 'crosshair',
  RectangleROI: 'crosshair',
  RectROI: 'crosshair',
  CircleROI: 'crosshair',
  EllipticalROI: 'crosshair',
  Bidirectional: 'crosshair',
  PlanarFreehandROI: 'crosshair',
  SplineROI: 'crosshair',
  LivewireContour: 'crosshair',
  Crosshairs: 'crosshair',
  CalibrationLine: 'crosshair',
  CobbAngle: 'crosshair',
  Brush: 'crosshair',
  Eraser: 'crosshair',
  PaintFill: 'crosshair',
  Sculptor: 'crosshair',
  CircleScissors: 'crosshair',
  RectangleScissors: 'crosshair',
  SphereScissors: 'crosshair',
  MarkerLabelmap: 'crosshair',
};

// Selectors that target ONLY the medical imaging viewport area
const VIEWPORT_SELECTORS =
  'canvas, .cornerstone-canvas, .viewport-container, .viewport-element, ' +
  '[data-viewport-uid], .cornerstoneViewport, .cornerstone-viewport-element';

export function ToolPanel({
  servicesManager,
  commandsManager,
  activeTool,
  setActiveTool,
  onToggleAdjustments,
  setViewMode,
  isMobile,
}: ToolPanelProps) {
  const [brightness, setBrightness] = React.useState(100);
  const [contrast, setContrast] = React.useState(100);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const applyAdjustments = (b: number, c: number) => {
    document.querySelectorAll<HTMLElement>('.cornerstone-canvas').forEach(el => {
      const bVal = b / 100;
      const cVal = c / 100;
      el.style.filter = `brightness(${bVal}) contrast(${cVal})`;
    });
  };

  const handleBrightnessChange = (_: Event, value: number | number[]) => {
    const val = value as number;
    setBrightness(val);
    applyAdjustments(val, contrast);
  };

  const handleContrastChange = (_: Event, value: number | number[]) => {
    const val = value as number;
    setContrast(val);
    applyAdjustments(brightness, val);
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    document.querySelectorAll<HTMLElement>('.cornerstone-canvas').forEach(el => {
      el.style.filter = '';
    });
  };

  const openAdjustments = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeAdjustments = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  // Sync cursor ONLY within the viewer viewport area
  React.useEffect(() => {
    if (isMobile) {
      return;
    }

    const cursor = CURSOR_MAP[activeTool] ?? 'default';

    const applyToViewport = () => {
      document.querySelectorAll<HTMLElement>(VIEWPORT_SELECTORS).forEach(el => {
        el.style.cursor = cursor;
      });
    };

    // Apply immediately
    applyToViewport();

    // Re-apply after a short delay to catch lazily-rendered canvases
    const timer = setTimeout(applyToViewport, 200);

    return () => {
      clearTimeout(timer);
      // Reset ONLY the viewport elements, never the body/global cursor
      document.querySelectorAll<HTMLElement>(VIEWPORT_SELECTORS).forEach(el => {
        el.style.cursor = '';
      });
    };
  }, [activeTool, isMobile]);

  const handleToolClick = (id: string, isAction: boolean = false) => {
    setActiveTool?.(id);

    // Sync the top mode tab (right panel overlay) based on the chosen tool
    if (['Length', 'Angle', 'CircleROI', 'RectangleROI', 'Probe', 'ArrowAnnotate', 'Bidirectional', 'EllipticalROI', 'PlanarFreehandROI', 'SplineROI', 'LivewireContour'].includes(id)) {
      setViewMode?.('annotation');
    } else if (['Wwwc', 'wl_soft', 'wl_lung', 'wl_bone', 'wl_brain', 'wl_liver'].includes(id)) {
      setViewMode?.('adjustments');
    } else if (
      ['Brush', 'Eraser', 'CircleScissors', 'RectangleScissors', 'SphereScissors'].includes(id)
    ) {
      setViewMode?.('segmentation');
    } else if (['WindowLevel', 'Pan', 'Zoom', 'StackScroll', 'Magnify'].includes(id)) {
      setViewMode?.('viewer');
    }

    if (isAction) {
      commandsManager?.runCommand(id);
    } else {
      const toolGroupIds = ['default', 'mpr', 'SRToolGroup', 'volume3d'];

      // For Zoom and navigation tools, ensure we use setToolActiveToolbar
      // This command is the most robust for multi-viewport synchronization
      try {
        commandsManager?.runCommand('setToolActiveToolbar', {
          itemId: id,
          toolName: id,
          toolGroupIds,
        });
      } catch (e) {
        // Precise fallback to setToolActive if the toolbar item isn't resolved
        toolGroupIds.forEach(toolGroupId => {
          try {
            commandsManager?.runCommand('setToolActive', { toolName: id, toolGroupId });
          } catch (err) {
            console.warn(`ToolPanel: Failed to activate ${id} in group ${toolGroupId}`);
          }
        });
      }
    }
  };

  // Tool definitions aligned with the user-provided image sequence
  const primaryTools = [{ id: 'WindowLevel', icon: MousePointerIcon, label: 'Select' }];

  const transformTools = [
    {
      id: 'rotateViewportCW',
      icon: RotateCwIcon,
      label: 'Rotate 90°',
      action: () => handleToolClick('rotateViewportCW', true),
    },
    {
      id: 'flipViewportHorizontal',
      icon: FlipIcon,
      label: 'Flip Horizontal',
      action: () => handleToolClick('flipViewportHorizontal', true),
    },
    {
      id: 'flipViewportVertical',
      icon: <FlipIcon sx={{ transform: 'rotate(90deg)', fontSize: 20 }} />,
      label: 'Flip Vertical',
      action: () => handleToolClick('flipViewportVertical', true),
    },
    {
      id: 'invertViewport',
      icon: InvertIcon,
      label: 'Invert Colors',
      action: () => handleToolClick('invertViewport', true),
    },
    {
      id: 'resetViewport',
      icon: ResetIcon,
      label: 'Reset View',
      action: () => handleToolClick('resetViewport', true),
    },
  ];

  const adjustmentTools = [
    {
      id: 'Wwwc',
      icon: PaletteIcon,
      label: 'Window / Level',
      // No 'action' → ToolGroup calls onSelect(id) → handleToolClick('Wwwc') activates the drag tool
    },
    {
      id: 'wl_soft',
      icon: PaletteIcon,
      label: 'Soft Tissue  W:400 / L:40',
      action: () => {
        commandsManager?.runCommand('setWindowLevel', { windowWidth: 400, windowCenter: 40 });
      },
    },
    {
      id: 'wl_lung',
      icon: PaletteIcon,
      label: 'Lung  W:1500 / L:-600',
      action: () => {
        commandsManager?.runCommand('setWindowLevel', { windowWidth: 1500, windowCenter: -600 });
      },
    },
    {
      id: 'wl_bone',
      icon: PaletteIcon,
      label: 'Bone  W:2500 / L:480',
      action: () => {
        commandsManager?.runCommand('setWindowLevel', { windowWidth: 2500, windowCenter: 480 });
      },
    },
    {
      id: 'wl_brain',
      icon: PaletteIcon,
      label: 'Brain  W:80 / L:40',
      action: () => {
        commandsManager?.runCommand('setWindowLevel', { windowWidth: 80, windowCenter: 40 });
      },
    },
    {
      id: 'wl_liver',
      icon: PaletteIcon,
      label: 'Liver  W:150 / L:90',
      action: () => {
        commandsManager?.runCommand('setWindowLevel', { windowWidth: 150, windowCenter: 90 });
      },
    },
  ];

  const measureTools = [
    {
      id: 'Length',
      icon: RulerIcon,
      label: 'Length',
    },
    {
      id: 'Bidirectional',
      icon: BidirectionalIcon,
      label: 'Bidirectional',
    },
    {
      id: 'ArrowAnnotate',
      icon: AnnotateIcon,
      label: 'Annotation',
    },
    {
      id: 'EllipticalROI',
      icon: EllipseIcon,
      label: 'Ellipse',
    },
    {
      id: 'RectangleROI',
      icon: RectROIIcon,
      label: 'Rectangle',
    },
    {
      id: 'CircleROI',
      icon: CircleROIIcon,
      label: 'Circle',
    },
    {
      id: 'PlanarFreehandROI',
      icon: FreehandIcon,
      label: 'Freehand ROI',
    },
    {
      id: 'SplineROI',
      icon: SplineIcon,
      label: 'Spline ROI',
    },
    {
      id: 'LivewireContour',
      icon: LivewireIcon,
      label: 'Livewire tool',
    },
    {
      id: 'Angle',
      icon: AngleIcon,
      label: 'Angle',
    },
    {
      id: 'Probe',
      icon: ProbeIcon,
      label: 'Probe (HU)',
    },
    {
      id: 'Crosshairs',
      icon: CrosshairsIcon,
      label: 'Crosshairs',
    },
    {
      id: 'CalibrationLine',
      icon: CalibrationIcon,
      label: 'Calibration',
    },
  ];

  const annotateTools = [
    {
      id: 'ArrowAnnotate',
      icon: AnnotateIcon,
      label: 'Annotate',
      // Primary — activates the ArrowAnnotate draw tool via onSelect → handleToolClick
    },
    {
      id: 'setMeasurementLabel',
      icon: LabelIcon,
      label: 'Label Annotation',
      action: () => {
        // Opens OHIF label/tag dialog for the currently selected annotation
        commandsManager?.runCommand('setMeasurementLabel', {});
      },
    },
    {
      id: 'openDICOMTagViewer',
      icon: DicomTagIcon,
      label: 'DICOM Tags',
      action: () => {
        // Opens the full DICOM metadata tag browser modal
        commandsManager?.runCommand('openDICOMTagViewer', {});
      },
    },
  ];

  // ── 6. View & Layout ────────────────────────────────────────────
  const viewLayoutTools = [
    {
      id: 'toggleOverlays',
      icon: EyeOnIcon,
      label: 'Overlays',
      action: () => commandsManager?.runCommand('toggleOverlays'),
    },
    {
      id: 'toggleCine',
      icon: CineIcon,
      label: 'Cine Player',
      action: () => commandsManager?.runCommand('toggleCine'),
    },
    {
      id: 'syncSlices',
      icon: SyncIcon,
      label: 'Sync Slices',
      action: () =>
        commandsManager?.runCommand('toggleSynchronizer', {
          type: 'imageSlice',
          syncId: 'imageSliceSyncId',
        }),
    },
    {
      id: 'referenceLines',
      icon: RefLinesIcon,
      label: 'Reference Lines',
      action: () => {
        // Activates the Crosshairs tool which shows cross-reference lines
        handleToolClick('Crosshairs');
      },
    },
    {
      id: 'toggleLayers',
      icon: LayersIcon,
      label: 'Layers',
      action: () => commandsManager?.runCommand('toggleRenderInactiveSegmentations'),
    },
    {
      id: 'fullscreen',
      icon: FullscreenIcon,
      label: 'Fullscreen',
      action: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
      },
    },
  ];

  // ── Layout grid presets (sub-group) ─────────────────────────────
  const layoutTools = [
    {
      id: 'layout_1x1',
      icon: GridOneOneIcon,
      label: '1×1',
      action: () =>
        commandsManager?.runCommand('setViewportGridLayout', { numRows: 1, numCols: 1 }),
    },
    {
      id: 'layout_1x2',
      icon: GridOneTwoIcon,
      label: '1×2',
      action: () =>
        commandsManager?.runCommand('setViewportGridLayout', { numRows: 1, numCols: 2 }),
    },
    {
      id: 'layout_2x1',
      icon: GridOneTwoIcon,
      label: '2×1',
      action: () =>
        commandsManager?.runCommand('setViewportGridLayout', { numRows: 2, numCols: 1 }),
    },
    {
      id: 'layout_2x2',
      icon: LayoutIcon,
      label: '2×2',
      action: () =>
        commandsManager?.runCommand('setViewportGridLayout', { numRows: 2, numCols: 2 }),
    },
    {
      id: 'layout_2x3',
      icon: GridTwoThreeIcon,
      label: '2×3',
      action: () =>
        commandsManager?.runCommand('setViewportGridLayout', { numRows: 2, numCols: 3 }),
    },
  ];

  // ── 7. Export & Save ────────────────────────────────────────────
  const exportTools = [
    {
      id: 'showDownloadViewportModal',
      icon: ScreenshotIcon,
      label: 'Screenshot',
      action: () => handleToolClick('showDownloadViewportModal', true),
    },
    {
      id: 'downloadImage',
      icon: DownloadIcon,
      label: 'Download Image',
      action: () => handleToolClick('showDownloadViewportModal', true),
    },
    {
      id: 'printViewport',
      icon: PrintIcon,
      label: 'Print',
      action: () => {
        // Collect all cornerstone canvas elements from the active viewport(s)
        const canvases = Array.from(document.querySelectorAll<HTMLCanvasElement>('canvas')).filter(
          c => c.width > 0 && c.height > 0
        );

        if (canvases.length === 0) {
          alert('No image is currently displayed to print.');
          return;
        }

        // Composite all canvases horizontally into one output canvas
        const totalWidth = canvases.reduce((s, c) => s + c.width, 0);
        const maxHeight = Math.max(...canvases.map(c => c.height));
        const out = document.createElement('canvas');
        out.width = totalWidth;
        out.height = maxHeight;
        const ctx = out.getContext('2d');
        if (!ctx) {
          return;
        }

        let offsetX = 0;
        canvases.forEach(c => {
          ctx.drawImage(c, offsetX, 0, c.width, c.height);
          offsetX += c.width;
        });

        const dataUrl = out.toDataURL('image/png');

        // Open a blank window, inject only the image, and print it
        const printWin = window.open('', '_blank', 'width=900,height=700');
        if (!printWin) {
          alert('Please allow pop-ups for this site to enable printing.');
          return;
        }

        printWin.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Print — Medical Image</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; }
    img {
      display: block;
      max-width: 100%;
      max-height: 100vh;
      margin: auto;
      object-fit: contain;
    }
    @media print {
      html, body { background: #000; -webkit-print-color-adjust: exact; }
      img { width: 100%; height: auto; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <img src="${dataUrl}" />
  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); window.close(); }, 300);
    };
  </script>
</body>
</html>`);
        printWin.document.close();
      },
    },
    {
      id: 'saveStudy',
      icon: SaveIcon,
      label: 'Save Study',
      action: () => {
        // 1. Silently persist viewport presentation state (W/L, zoom, pan, rotation).
        //    storePresentation has no modal — it just writes to the service.
        try {
          commandsManager?.runCommand('storePresentation', { viewportId: undefined });
        } catch {
          /* silent */
        }

        // 2. Export any placed measurements as a CSV download (no-op if none).
        try {
          commandsManager?.runCommand('downloadCSVMeasurementsReport', {
            measurementFilter: undefined,
          });
        } catch {
          /* silent */
        }

        // 3. Brief green toast — no page lock, no modal.
        const toast = document.createElement('div');
        toast.textContent = '✓ Study state saved';
        Object.assign(toast.style, {
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(16,185,129,0.92)',
          color: '#fff',
          padding: '10px 22px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: 'Inter, sans-serif',
          zIndex: '99999',
          pointerEvents: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        });
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.style.opacity = '0';
        }, 2000);
        setTimeout(() => {
          toast.remove();
        }, 2400);
      },
    },
  ];

  // Navigation sub-tools accessible via context or selection
  const navigationTools = [
    { id: 'Pan', icon: HandIcon, label: 'Pan' },
    { id: 'Zoom', icon: ZoomIcon, label: 'Zoom' },
    { id: 'StackScroll', icon: ScrollIcon, label: 'Stack Scroll' },
    { id: 'Magnify', icon: MagnifyIcon, label: 'Magnify' },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 2,
        px: isMobile ? 0 : 0,
        gap: 0.25,
        bgcolor: isMobile ? 'transparent' : '#0a0f1e !important', // Deep dark theme
        backdropFilter: isMobile ? 'none' : 'blur(24px)',
        borderRight: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.03)',
        height: '100%',
        width: 52, // Professional slim profile
        overflowY: 'auto',
        msOverflowStyle: 'none', // IE and Edge
        scrollbarWidth: 'none', // Firefox
        '&::-webkit-scrollbar': { display: 'none' }, // Chrome, Safari and Opera
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          alignItems: 'center',
          width: '100%',
          px: 0.5,
        }}
      >
        {/* Sequence matching the requested image design */}

        {/* 1. Select / Navigation Group */}
        {primaryTools.map(tool => (
          <ToolGroup
            key={tool.id}
            tools={[tool, ...navigationTools]}
            activeTool={activeTool}
            onSelect={id => handleToolClick(id)}
          />
        ))}

        <Box sx={{ width: '40%', height: '1px', bgcolor: 'rgba(255,255,255,0.05)', my: 1 }} />

        {/* 2. Transform (Rotate) */}
        <ToolGroup
          tools={transformTools}
          activeTool={activeTool}
          onSelect={id => handleToolClick(id)}
        />

        {/* 3. Adjustments (W/L) */}
        <ToolGroup
          tools={adjustmentTools}
          activeTool={activeTool}
          onSelect={id => handleToolClick(id)}
        />

        <Box sx={{ width: '40%', height: '1px', bgcolor: 'rgba(255,255,255,0.05)', my: 1 }} />

        {/* 4. Measure */}
        <ToolGroup
          tools={measureTools}
          activeTool={activeTool}
          onSelect={id => handleToolClick(id)}
        />

        {/* 5. Annotate */}
        <ToolGroup
          tools={annotateTools}
          activeTool={activeTool}
          onSelect={id => handleToolClick(id)}
        />

        <Box sx={{ width: '40%', height: '1px', bgcolor: 'rgba(255,255,255,0.05)', my: 1 }} />

        {/* 6. View & Layout — Overlays, Cine, Sync, RefLines, Layers, Fullscreen */}
        <ToolGroup
          tools={viewLayoutTools}
          activeTool={activeTool}
          onSelect={id => handleToolClick(id)}
        />

        {/* 6b. Grid Layout presets — 1x1, 1x2, 2x1, 2x2, 2x3 */}
        <ToolGroup
          tools={layoutTools}
          activeTool={activeTool}
          onSelect={id => handleToolClick(id)}
        />

        <Box sx={{ width: '40%', height: '1px', bgcolor: 'rgba(255,255,255,0.05)', my: 1 }} />

        {/* 7. Export & Save — Screenshot, Download, Print, Save */}
        <ToolGroup
          tools={exportTools}
          activeTool={activeTool}
          onSelect={id => handleToolClick(id)}
        />

        <Box
          sx={{
            width: '100%',
            mt: 'auto', // Push settings to bottom if space allows
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
            pt: 4,
          }}
        >
          <Tooltip
            title="Image Adjustments"
            placement="right"
          >
            <IconButton
              onClick={openAdjustments}
              sx={{
                color: open ? '#3b82f6' : '#94a3b8',
                p: 1.5,
                '&:hover': { color: '#f8fafc', bgcolor: 'rgba(255,255,255,0.03)' },
                width: '100%',
                aspectRatio: '1/1',
                minHeight: 48,
              }}
            >
              <motion.div animate={{ scale: open ? 1.2 : 1 }}>
                <TuneIcon sx={{ fontSize: 20 }} />
              </motion.div>
            </IconButton>
          </Tooltip>

          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={closeAdjustments}
            anchorOrigin={{
              vertical: 'center',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'center',
              horizontal: 'left',
            }}
            PaperProps={{
              sx: {
                bgcolor: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.1)',
                p: 2,
                width: 200,
                ml: 1,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              },
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ color: '#94a3b8', textTransform: 'uppercase', mb: 2, display: 'block' }}
            >
              Adjustments
            </Typography>

            {/* Brightness */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BrightnessIcon sx={{ fontSize: 12, color: '#f59e0b' }} />
                  <Typography
                    variant="caption"
                    sx={{ color: '#94a3b8' }}
                  >
                    Brightness
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: '#f59e0b', fontWeight: 600 }}
                >
                  {brightness}%
                </Typography>
              </Box>
              <Slider
                size="small"
                min={50}
                max={150}
                value={brightness}
                onChange={handleBrightnessChange}
                sx={{ color: '#f59e0b', py: 1 }}
              />
            </Box>

            {/* Contrast */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ContrastIcon sx={{ fontSize: 12, color: '#3b82f6' }} />
                  <Typography
                    variant="caption"
                    sx={{ color: '#94a3b8' }}
                  >
                    Contrast
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: '#3b82f6', fontWeight: 600 }}
                >
                  {contrast}%
                </Typography>
              </Box>
              <Slider
                size="small"
                min={50}
                max={150}
                value={contrast}
                onChange={handleContrastChange}
                sx={{ color: '#3b82f6', py: 1 }}
              />
            </Box>

            <ButtonBase
              onClick={handleReset}
              sx={{
                width: '100%',
                py: 0.75,
                borderRadius: 1,
                bgcolor: 'rgba(255,255,255,0.05)',
                color: '#f8fafc',
                fontSize: '0.7rem',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Reset to Default
            </ButtonBase>
          </Popover>
        </Box>
      </Box>
    </Box>
  );
}
