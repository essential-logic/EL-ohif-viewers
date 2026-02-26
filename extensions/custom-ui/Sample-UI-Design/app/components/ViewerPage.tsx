import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import LogoImage from '../essential-logic-logo.png';
import { 
  ArrowBack as ArrowLeftIcon, 
  Settings as SettingsIcon, 
  Share as ShareIcon, 
  Help as HelpIcon, 
  GridView as LayoutGridIcon, 
  Psychology as BrainCircuitIcon,
  Edit as AnnotationIcon
} from '@mui/icons-material';
import { Box, Typography, Button, IconButton, useTheme, Chip, Divider } from '@mui/material';

import { ToolPanel } from '../components/ToolPanel';
import { ViewerCanvas } from '../components/ViewerCanvas';
import { ImageInfo } from '../components/ImageInfo';
import { AnnotationPanel } from '../components/AnnotationPanel';
import { SegmentationPanel } from '../components/SegmentationPanel';
import { Timeline } from '../components/Timeline';
import { GlassLayout } from '../components/layout/GlassLayout';
import { GlassToolbar } from '../components/ui/glass-toolbar';
import { CinePlayer } from '../components/CinePlayer';

type ViewMode = 'viewer' | 'segmentation' | 'annotation';

export function ViewerPage() {
  const params = useParams();
  const studyId = params?.studyId as string;
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('viewer');
  const theme = useTheme();
  
  // Lifted State for Viewer Control
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [activeTool, setActiveTool] = useState('select');
  const [showOverlays, setShowOverlays] = useState(false);
  const [layout, setLayout] = useState({ rows: 1, cols: 1 });
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [invert, setInvert] = useState(false);
  
  // Advanced Feature State
  const [cineOpen, setCineOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameRate, setFrameRate] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(1);
  const totalFrames = 10; // Mock total frames
  
  const [windowPreset, setWindowPreset] = useState('soft_tissue');
  const [windowLut, setWindowLut] = useState('Grayscale');

  // Cine Playback Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame(prev => (prev >= totalFrames ? 1 : prev + 1));
      }, 1000 / frameRate);
    }
    return () => clearInterval(interval);
  }, [isPlaying, frameRate, totalFrames]);

  const handleWindowPreset = (preset: string) => {
    setWindowPreset(preset);
    // Mock mapping presets to brightness/contrast for demo
    switch(preset) {
        case 'lung': setBrightness(140); setContrast(140); break;
        case 'bone': setBrightness(120); setContrast(150); break;
        case 'brain': setBrightness(110); setContrast(130); break;
        case 'soft_tissue': setBrightness(100); setContrast(100); break;
        default: break;
    }
  };

  const handleCaptureScreenshot = (data: any) => {
    console.log('Capture screenshot', data);
    // In a real app, this would use html2canvas or similar
    alert(`Screenshot saved: ${data.filename}.${data.fileType || 'jpg'} (${data.width}x${data.height})`);
  };

  const handleReset = () => {
    setZoom(100);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setInvert(false);
    setLayout({ rows: 1, cols: 1 });
  };
  
  const medicalImageUrl = "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=2070&auto=format&fit=crop";

  return (
    <GlassLayout
      sidebar={
        <ToolPanel 
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          zoom={zoom}
          setZoom={setZoom}
          rotation={rotation}
          setRotation={setRotation}
          brightness={brightness}
          setBrightness={setBrightness}
          contrast={contrast}
          setContrast={setContrast}
          showOverlays={showOverlays}
          setShowOverlays={setShowOverlays}
          layout={layout}
          setLayout={setLayout}
          flipHorizontal={flipHorizontal}
          setFlipHorizontal={setFlipHorizontal}
          flipVertical={flipVertical}
          setFlipVertical={setFlipVertical}
          invert={invert}
          setInvert={setInvert}
          onReset={handleReset}
          onCaptureScreenshot={handleCaptureScreenshot}
          onCineToggle={() => setCineOpen(!cineOpen)}
          onSelectPreset={handleWindowPreset}
          onSelectLut={setWindowLut}
        />
      }
      sidebarWidth={72}
      header={
        <GlassToolbar 
          position="floating"
          sx={{ 
            width: '100%', 
            justifyContent: 'space-between', 
            borderRadius: 0,
            borderLeft: 'none',
            borderRight: 'none',
            borderTop: 'none',
            bgcolor: 'rgba(15, 23, 42, 0.6) !important', // Match dark theme
            py: 1
          }}
        >
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {/* Branding Block */}
             <Box sx={{ display: 'flex', flexDirection: 'column', width: 'fit-content' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ p: 0.5, borderRadius: 2, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex' }}>
                    <Image 
                      src={LogoImage} 
                      alt="Essential Logic Logo" 
                      width={32} 
                      height={32} 
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ 
                        background: 'linear-gradient(to right, #3b82f6, #93c5fd, #22d3ee)', 
                        backgroundClip: 'text', 
                        color: 'transparent',
                        fontWeight: 800,
                        lineHeight: 1.3,
                        fontSize: '1.3rem',
                        letterSpacing: 0.1
                    }}>
                      DICOM Pro
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'white', fontSize: '0.78rem', fontWeight: 600, display: 'block', lineHeight: 1 }}>
                      by Essential Logic
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 0.5, px: 0.2 }}>
                   <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.55rem', textTransform: 'uppercase', width: '100%', textAlign: 'center', letterSpacing: 2 }}>
                    Powered by OHIF Viewer
                  </Typography>
                </Box>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)', height: 40, my: 'auto' }} />

              {/* Navigation & Study Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    startIcon={<ArrowLeftIcon />}
                    onClick={() => router.push('/')}
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { color: 'text.primary', bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    Back
                  </Button>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" fontWeight={600} color="text.primary">Brain MRI T1/T2</Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontFamily: 'monospace' }}>{studyId || 'ST-2026-001'}</Typography>
                  </Box>
              </Box>
           </Box>

           {/* Mode Switcher */}
           <Box sx={{ display: 'flex', bgcolor: 'rgba(0,0,0,0.2)', p: 0.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Button
                onClick={() => setViewMode('viewer')}
                startIcon={<LayoutGridIcon />}
                size="small"
                sx={{
                  borderRadius: 1.5,
                  fontWeight: 500,
                  bgcolor: viewMode === 'viewer' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  color: viewMode === 'viewer' ? 'primary.main' : 'text.secondary',
                  '&:hover': { color: 'text.primary' }
                }}
              >
                Viewer
              </Button>
              <Button
                onClick={() => setViewMode('segmentation')}
                startIcon={<BrainCircuitIcon />}
                size="small"
                sx={{
                  borderRadius: 1.5,
                  fontWeight: 500,
                  bgcolor: viewMode === 'segmentation' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                  color: viewMode === 'segmentation' ? 'secondary.main' : 'text.secondary',
                  '&:hover': { color: 'text.primary' }
                }}
              >
                Segmentation
              </Button>
              <Button
                onClick={() => setViewMode('annotation')}
                startIcon={<AnnotationIcon />}
                size="small"
                sx={{
                  borderRadius: 1.5,
                  fontWeight: 500,
                  bgcolor: viewMode === 'annotation' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  color: viewMode === 'annotation' ? 'success.main' : 'text.secondary',
                  '&:hover': { color: 'text.primary' }
                }}
              >
                Annotation
              </Button>
           </Box>

           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                 <SettingsIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                 <ShareIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                 <HelpIcon fontSize="small" />
              </IconButton>
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(to top right, #3b82f6, #8b5cf6)', ml: 1, border: '1px solid rgba(255,255,255,0.2)', boxShadow: 2 }} />
           </Box>
        </GlassToolbar>
      }
      rightPanel={
        <AnimatePresence mode="wait">
          {viewMode === 'viewer' ? (
            <motion.div 
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{ height: '100%' }}
            >
              <ImageInfo />
            </motion.div>
          ) : viewMode === 'segmentation' ? (
            <motion.div 
              key="seg"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{ height: '100%' }}
            >
              <SegmentationPanel />
            </motion.div>
          ) : (
            <motion.div 
              key="ant"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{ height: '100%' }}
            >
              <AnnotationPanel />
            </motion.div>
          )}
        </AnimatePresence>
      }

    >
      <CinePlayer 
        open={cineOpen}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onClose={() => setCineOpen(false)}
        frameRate={frameRate}
        onFrameRateChange={setFrameRate}
        currentFrame={currentFrame}
        totalFrames={totalFrames}
        onFrameChange={setCurrentFrame}
      />
      
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', gap: 1.5, position: 'relative' }}>
        
        {/* Main Canvas Area (Grid Support) */}
        <Box 
          sx={{ 
            flex: 1, 
            minHeight: 0, 
            position: 'relative', 
            borderRadius: 3, 
            overflow: 'hidden', 
            boxShadow: 6, 
            border: '1px solid rgba(255,255,255,0.05)', 
            bgcolor: 'black',
            transition: 'all 0.5s',
            ...(viewMode === 'segmentation' && {
              boxShadow: `0 0 0 1px ${theme.palette.secondary.main}50`, // Ring effect
            }),
            display: 'grid',
            gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
            gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
            gap: '1px',

          }}
        >
           {Array.from({ length: layout.rows * layout.cols }).map((_, index) => (
             <Box key={index} sx={{ position: 'relative', bgcolor: 'black', overflow: 'hidden' }}>
               <ViewerCanvas 
                 imageUrl={medicalImageUrl} 
                 zoom={zoom}
                 setZoom={setZoom}
                 rotation={rotation}
                 brightness={brightness}
                 contrast={contrast}
                 showOverlays={showOverlays}
                 activeTool={activeTool}
                 flipHorizontal={flipHorizontal}
                 flipVertical={flipVertical}
                 invert={invert}
               />
               {/* Viewport Number Indicator (Optional, for clarity) */}
               { (layout.rows > 1 || layout.cols > 1) && (
                 <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 5, px: 0.75, py: 0.25, bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 0.5, border: '1px solid rgba(255,255,255,0.1)' }}>
                   <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', fontFamily: 'monospace' }}>
                     CAM {index + 1}
                   </Typography>
                 </Box>
               )}
             </Box>
           ))}
        </Box>

        {/* Bottom Timeline */}
        <Box sx={{ flexShrink: 0 }}>
          <Timeline />
        </Box>
      </Box>
    </GlassLayout>
  );
}
