import React from 'react';
import { Box, Divider, IconButton, Tooltip } from '@mui/material';
import {
  Straighten as RulerIcon,
  NearMe as MousePointerIcon,
  PanTool as HandIcon,
  Contrast as PaletteIcon,
  Edit as ActivityIcon,
  RotateRight as RotateCwIcon,
  CameraAlt as ScreenshotIcon,
  FlipCameraAndroid as FlipHorizontalIcon,
  FlipCameraIos as FlipVerticalIcon,
  InvertColors as InvertIcon,
  RestartAlt as ResetIcon,
  SwapVert as ScrollIcon,
  Search as MagnifyIcon,
  ZoomIn as ZoomIcon,
  FilterCenterFocus as CrosshairsIcon,
  Animation as CineIcon,
  Architecture as AngleIcon,
  LinearScale as CalibrationIcon,
  BugReport as ProbeIcon,
  Label as LabelIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import { ToolGroup } from './ui/ToolGroup';

interface Manager {
  runCommand: (id: string, args?: any) => any;
}

interface ToolPanelProps {
  servicesManager?: any;
  commandsManager?: Manager;
  activeTool: string;
  setActiveTool: (tool: string) => void;
  isMobile?: boolean;
}

export function ToolPanel({
  servicesManager,
  commandsManager,
  activeTool,
  setActiveTool,
  isMobile,
}: ToolPanelProps) {
  const handleToolClick = (id: string, isAction: boolean = false) => {
    setActiveTool?.(id);

    if (isAction) {
      commandsManager?.runCommand(id);
    } else {
      // First, directly inform the cornerstone tool groups
      const toolGroupIds = ['default', 'mpr', 'SRToolGroup', 'volume3d'];
      toolGroupIds.forEach(toolGroupId => {
        try {
          commandsManager?.runCommand('setToolActive', { toolName: id, toolGroupId });
        } catch (e) {
          console.warn(`Could not set tool active for group ${toolGroupId}:`, e);
        }
      });

      // Crucially, inform OHIF's toolbar synchronization system
      // by passing both itemId and toolName as OHIF natively expects.
      try {
        commandsManager?.runCommand('setToolActiveToolbar', {
          itemId: id,
          toolName: id,
          toolGroupIds,
        });
      } catch (e) {
        // Silently fail if OHIF can't resolve the toolbar layout
      }
    }
  };

  // Tool Definitions from Sample UI
  const navTools = [
    { id: 'WindowLevel', icon: MousePointerIcon, label: 'Select' },
    { id: 'Pan', icon: HandIcon, label: 'Pan' },
    { id: 'StackScroll', icon: ScrollIcon, label: 'Stack Scroll' },
    { id: 'Zoom', icon: ZoomIcon, label: 'Zoom' },
    { id: 'Magnify', icon: MagnifyIcon, label: 'Magnify' },
  ];

  const transformTools = [
    {
      id: 'RotateRight',
      icon: RotateCwIcon,
      label: 'Rotate 90°',
      action: () => handleToolClick('rotateViewportCW', true),
    },
    {
      id: 'flipHorizontal',
      icon: FlipHorizontalIcon,
      label: 'Flip Horizontal',
      action: () => handleToolClick('flipViewportHorizontal', true),
    },
    {
      id: 'flipVertical',
      icon: FlipVerticalIcon,
      label: 'Flip Vertical',
      action: () => handleToolClick('flipViewportVertical', true),
    },
  ];

  const measureTools = [
    { id: 'Length', icon: RulerIcon, label: 'Length' },
    { id: 'Angle', icon: AngleIcon, label: 'Angle' },
    {
      id: 'EllipticalROI',
      icon: (props: Record<string, unknown>) => (
        <Box
          sx={{
            border: '2px solid',
            borderRadius: '50%',
            width: 18,
            height: 18,
            borderColor: 'currentColor',
            ...(props.sx as object),
          }}
        />
      ),
      label: 'Ellipse ROI',
    },
    {
      id: 'RectangleROI',
      icon: (props: Record<string, unknown>) => (
        <Box
          sx={{
            border: '2px dashed',
            width: 18,
            height: 18,
            borderColor: 'currentColor',
            ...(props.sx as object),
          }}
        />
      ),
      label: 'Rectangle ROI',
    },
    { id: 'Probe', icon: ProbeIcon, label: 'Probe' },
    { id: 'Crosshairs', icon: CrosshairsIcon, label: 'Crosshairs' },
    { id: 'CalibrationLine', icon: CalibrationIcon, label: 'Calibration' },
  ];

  const annotateTools = [
    { id: 'ArrowAnnotate', icon: ActivityIcon, label: 'Annotate' },
    { id: 'Bidirectional', icon: LabelIcon, label: 'Bidirectional' },
  ];

  const adjustmentTools = [
    { id: 'WindowLevel', icon: PaletteIcon, label: 'Window / Level' },
    {
      id: 'invert',
      icon: InvertIcon,
      label: 'Invert Colors',
      action: () => handleToolClick('invertViewport', true),
    },
    {
      id: 'Reset',
      icon: ResetIcon,
      label: 'Reset View',
      action: () => handleToolClick('resetViewport', true),
    },
  ];

  const viewTools = [
    {
      id: 'Cine',
      icon: CineIcon,
      label: 'Cine Player',
      action: () => handleToolClick('toggleCine', true),
    },
  ];

  const exportTools = [
    {
      id: 'Capture',
      icon: ScreenshotIcon,
      label: 'Screenshot',
      action: () => handleToolClick('showDownloadViewportModal', true),
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 2,
        px: isMobile ? 0 : 1,
        gap: 1,
        bgcolor: isMobile ? 'transparent' : 'rgba(15, 23, 42, 0.6) !important',
        backdropFilter: isMobile ? 'none' : 'blur(20px)',
        borderRight: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
        height: '100%',
        width: 64,
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: 0 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <ToolGroup
          tools={navTools}
          activeTool={activeTool}
          onSelect={setActiveTool}
        />

        <Divider sx={{ width: '60%', bgcolor: 'rgba(255,255,255,0.1)' }} />

        <ToolGroup
          tools={transformTools}
          activeTool={activeTool}
          onSelect={id => handleToolClick(id)}
        />
        <ToolGroup
          tools={adjustmentTools}
          activeTool={activeTool}
          onSelect={id => handleToolClick(id)}
        />

        <Divider sx={{ width: '60%', bgcolor: 'rgba(255,255,255,0.1)' }} />

        <ToolGroup
          tools={measureTools}
          activeTool={activeTool}
          onSelect={setActiveTool}
        />
        <ToolGroup
          tools={annotateTools}
          activeTool={activeTool}
          onSelect={setActiveTool}
        />

        <Divider sx={{ width: '60%', bgcolor: 'rgba(255,255,255,0.1)' }} />

        <ToolGroup
          tools={viewTools}
          activeTool={activeTool}
          onSelect={setActiveTool}
        />

        <Tooltip
          title="Grid Layout"
          placement="right"
        >
          <IconButton
            sx={{
              p: 1.5,
              borderRadius: 1,
              color: '#94a3b8',
              '&:hover': { color: '#f8fafc', bgcolor: 'rgba(255,255,255,0.05)' },
              width: '100%',
              aspectRatio: '1/1',
              minHeight: 44,
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 0.25,
                width: 14,
                height: 14,
              }}
            >
              <Box sx={{ bgcolor: 'currentColor', borderRadius: 0.25 }} />
              <Box sx={{ bgcolor: 'currentColor', borderRadius: 0.25 }} />
              <Box sx={{ bgcolor: 'currentColor', borderRadius: 0.25 }} />
              <Box sx={{ bgcolor: 'currentColor', borderRadius: 0.25 }} />
            </Box>
          </IconButton>
        </Tooltip>

        <Divider sx={{ width: '60%', bgcolor: 'rgba(255,255,255,0.1)' }} />

        <ToolGroup
          tools={exportTools}
          activeTool={activeTool}
          onSelect={() => {}}
        />

        <Box
          sx={{
            mt: 'auto',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Tooltip
            title="Image Adjustments"
            placement="right"
          >
            <IconButton
              sx={{
                color: '#94a3b8',
                p: 1.5,
                '&:hover': { color: '#f8fafc', bgcolor: 'rgba(255,255,255,0.05)' },
                width: '100%',
                aspectRatio: '1/1',
                minHeight: 44,
                mb: 1,
              }}
            >
              <TuneIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
