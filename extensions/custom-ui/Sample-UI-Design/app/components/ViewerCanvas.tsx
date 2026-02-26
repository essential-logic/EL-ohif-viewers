import { motion, AnimatePresence } from 'motion/react';
import { ViewportOverlays } from './ui/ViewportOverlays';
import { Box, Typography, IconButton } from '@mui/material';
import { Add as ZoomInIcon, Remove as ZoomOutIcon } from '@mui/icons-material';

interface ViewerCanvasProps {
  imageUrl: string;
  zoom: number;
  setZoom: (zoom: number) => void;
  rotation: number;
  brightness: number;
  contrast: number;
  showOverlays: boolean;
  activeTool: string;
  flipHorizontal: boolean;
  flipVertical: boolean;
  invert: boolean;
}

export function ViewerCanvas({ 
  imageUrl,
  zoom,
  setZoom,
  rotation,
  brightness,
  contrast,
  showOverlays,
  activeTool,
  flipHorizontal,
  flipVertical,
  invert
}: ViewerCanvasProps) {

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'common.black', borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      
      {/* Overlays Layer */}
      <AnimatePresence>
        {showOverlays && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}
            >
                <ViewportOverlays />
                
                {/* Corner indicator */}
                <Box sx={{ position: 'absolute', top: 12, right: 12, px: 1, py: 0.5, borderRadius: 0.75, bgcolor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', zIndex: 10 }}>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, fontSize: '0.7rem' }}>ACTIVE</Typography>
                </Box>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Main Image Display */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, bgcolor: 'rgba(0,0,0,0.5)', overflow: 'hidden', position: 'relative', zIndex: 0 }}>
        <Box
            component={motion.div}
            animate={{ 
              scale: zoom / 100,
              rotate: rotation,
              scaleX: flipHorizontal ? -1 : 1,
              scaleY: flipVertical ? -1 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            sx={{ 
                position: 'relative', 
                maxWidth: '100%', 
                maxHeight: '100%', 
                cursor: activeTool === 'pan' ? 'grab' : activeTool === 'scroll' ? 'ns-resize' : activeTool === 'magnify' ? 'zoom-in' : 'default',
            }}
        >
            <img 
            src={imageUrl} 
            alt="DICOM Medical Image"
            style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 4,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                filter: `brightness(${brightness}%) contrast(${contrast}%) invert(${invert ? 1 : 0})`
            }}
            />
        </Box>
      </Box>
      
      {/* Zoom Controls (Bottom Right) */}
      <Box sx={{ 
          position: 'absolute', 
          bottom: 12, 
          right: 12, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 0.5,
          bgcolor: 'rgba(0,0,0,0.6)', 
          backdropFilter: 'blur(4px)',
          borderRadius: 2, 
          border: '1px solid rgba(255,255,255,0.1)',
          p: 0.5,
          zIndex: 20
      }}>
        <IconButton 
            size="small" 
            onClick={(e) => { e.stopPropagation(); setZoom(Math.max(25, zoom - 25)); }}
            sx={{ color: 'white', p: 0.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
            <ZoomOutIcon fontSize="small" sx={{ fontSize: 16 }} />
        </IconButton>
        
        <Typography variant="caption" sx={{ color: 'white', fontFamily: 'monospace', minWidth: 32, textAlign: 'center', fontWeight: 600 }}>
            {zoom}%
        </Typography>

        <IconButton 
            size="small" 
            onClick={(e) => { e.stopPropagation(); setZoom(Math.min(400, zoom + 25)); }}
            sx={{ color: 'white', p: 0.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
            <ZoomInIcon fontSize="small" sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
}