import React, { useState } from 'react';
import {
  ThemeProvider,
  Box,
  CssBaseline,
  useTheme,
  useMediaQuery,
  Drawer,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { theme } from './Theme';
import { GlassLayout } from './components/GlassLayout';
import { GlassToolbar } from './components/GlassToolbar';
import { ToolPanel } from './components/ToolPanel';
import { ImageInfo } from './components/ImageInfo';
import { SegmentationPanel } from './components/SegmentationPanel';
import { AnnotationPanel } from './components/AnnotationPanel';
import { CinePlayer } from './components/CinePlayer';

interface CustomLayoutProps {
  servicesManager: any;
  extensionManager: any;
  viewports: unknown[];
  ViewportGridComp: any; // OHIF specific component injection
  commandsManager: any;
  hotkeysManager: any;
  studyInstanceUIDs: string | string[];
}

export default function CustomLayout({
  servicesManager,
  extensionManager,
  viewports,
  ViewportGridComp,
  commandsManager,
  hotkeysManager,
  studyInstanceUIDs,
}: CustomLayoutProps) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const [activeTool, setActiveTool] = useState('Zoom');
  const [viewMode, setViewMode] = useState('viewer'); // 'viewer' | 'segmentation' | 'annotation'
  const [isCineOpen, setIsCineOpen] = useState(false);
  const [isCinePlaying, setIsCinePlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // RESOLUTION LOGIC: Convert viewport namespaces (strings) into actual components
  const getViewportComponentData = (viewportComponent: any) => {
    const entry = extensionManager.getModuleEntry(viewportComponent.namespace);

    if (!entry || !entry.component) {
      console.warn(`No component found for viewport namespace: ${viewportComponent.namespace}`);
      return null;
    }

    return {
      component: entry.component,
      isReferenceViewable: entry.isReferenceViewable,
      displaySetsToDisplay: viewportComponent.displaySetsToDisplay,
    };
  };

  const resolvedViewportComponents = viewports
    .map(getViewportComponentData)
    .filter(v => v !== null);

  const sidebarWidth = 64; // Slim vertical toolbar

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlassLayout
        sidebarWidth={sidebarWidth}
        header={
          <GlassToolbar
            servicesManager={servicesManager}
            studyInstanceUIDs={studyInstanceUIDs}
            onToggleCine={() => setIsCineOpen(!isCineOpen)}
            isCineOpen={isCineOpen}
            onLayoutChange={(id, rows, cols) => console.log('Layout changed:', id, rows, cols)}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onMenuClick={() => setIsDrawerOpen(true)}
            isMobile={isMobile}
          />
        }
        sidebar={
          <ToolPanel
            servicesManager={servicesManager}
            commandsManager={commandsManager}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            isMobile={isMobile}
          />
        }
        rightPanel={
          viewMode === 'viewer' ? (
            <ImageInfo />
          ) : viewMode === 'segmentation' ? (
            <SegmentationPanel />
          ) : (
            <AnnotationPanel />
          )
        }
      >
        <Box
          sx={{
            flexGrow: 1,
            height: '100%',
            overflow: 'hidden',
            borderRadius: isMobile ? 0 : 4,
            bgcolor: 'black',
            border: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
            position: 'relative',
          }}
        >
          {/* Mobile Tool Drawer */}
          <Drawer
            anchor="left"
            open={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            PaperProps={{
              sx: {
                width: { xs: '85vw', sm: 360 },
                bgcolor: 'rgba(15, 23, 42, 0.98)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                p: { xs: 1.5, sm: 2 },
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <IconButton
                onClick={() => setIsDrawerOpen(false)}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, height: '100%', overflow: 'hidden' }}>
              <ToolPanel
                servicesManager={servicesManager}
                commandsManager={commandsManager}
                activeTool={activeTool}
                setActiveTool={tool => {
                  setActiveTool(tool);
                  if (isMobile) {
                    setIsDrawerOpen(false);
                  }
                }}
                isMobile={isMobile}
              />
              <Box sx={{ flex: 1, overflowY: 'auto' }}>
                {viewMode === 'viewer' ? (
                  <ImageInfo />
                ) : viewMode === 'segmentation' ? (
                  <SegmentationPanel />
                ) : (
                  <AnnotationPanel />
                )}
              </Box>
            </Box>
          </Drawer>

          <CinePlayer
            open={isCineOpen}
            isPlaying={isCinePlaying}
            onPlayPause={() => setIsCinePlaying(!isCinePlaying)}
            onClose={() => setIsCineOpen(false)}
            frameRate={24}
            onFrameRateChange={() => {}}
            currentFrame={currentFrame}
            totalFrames={100}
            onFrameChange={setCurrentFrame}
          />

          <ViewportGridComp
            servicesManager={servicesManager}
            viewportComponents={resolvedViewportComponents}
            commandsManager={commandsManager}
          />
        </Box>
      </GlassLayout>
    </ThemeProvider>
  );
}
