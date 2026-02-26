import { motion } from 'motion/react';
import { Box, Typography } from '@mui/material';

export function ViewportOverlays() {
  return (
    <Box sx={{ position: 'absolute', inset: 12, pointerEvents: 'none', zIndex: 10, userSelect: 'none' }}>
      {/* Top Left: Patient Info */}
      <Box component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Typography variant="body2" fontWeight={600} sx={{ color: 'common.white', mb: 0.5 }}>DOE, JOHN</Typography>
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.7rem' }}>PT-2026-001234</Typography>
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.7rem' }}>M / 45Y</Typography>
      </Box>

      {/* Top Right: Study Info */}
      <Box component={motion.div} 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{ position: 'absolute', top: 0, right: 0, textAlign: 'right' }}
      >
        <Typography variant="caption" sx={{ color: 'common.white', fontSize: '0.75rem' }}>Chest CT with Contrast</Typography>
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5, fontSize: '0.7rem' }}>Feb 15, 2026</Typography>
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.7rem' }}>10:45:23 AM</Typography>
      </Box>

      {/* Bottom Left: Tech Specs */}
      <Box component={motion.div} 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{ position: 'absolute', bottom: 40, left: 0, fontFamily: 'monospace' }}
      >
        <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem', color: 'common.white' }}>
          <Box component="span" sx={{ color: 'text.secondary' }}>Zoom:</Box> 1.0x
        </Typography>
        <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem', color: 'common.white' }}>
          <Box component="span" sx={{ color: 'text.secondary' }}>WL/WW:</Box> 40 / 400
        </Typography>
        <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem', color: 'common.white' }}>
          <Box component="span" sx={{ color: 'text.secondary' }}>Thick:</Box> 1.25mm
        </Typography>
      </Box>

      {/* Bottom Right: Image Specs */}
      <Box component={motion.div} 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{ position: 'absolute', bottom: 40, right: 0, textAlign: 'right', fontFamily: 'monospace' }}
      >
        <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem', color: 'common.white' }}>512 x 512 px</Typography>
        <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem', color: 'common.white' }}>
          <Box component="span" sx={{ color: 'text.secondary' }}>Loc:</Box> -124.50 mm
        </Typography>
      </Box>

      {/* Orientation Markers */}
      <Typography sx={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)', color: 'text.secondary', opacity: 0.4, fontWeight: 600, fontSize: '1rem' }}>R</Typography>
      <Typography sx={{ position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)', color: 'text.secondary', opacity: 0.4, fontWeight: 600, fontSize: '1rem' }}>L</Typography>
      <Typography sx={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', color: 'text.secondary', opacity: 0.4, fontWeight: 600, fontSize: '1rem' }}>A</Typography>
      <Typography sx={{ position: 'absolute', bottom: 56, left: '50%', transform: 'translateX(-50%)', color: 'text.secondary', opacity: 0.4, fontWeight: 600, fontSize: '1rem' }}>P</Typography>
    </Box>
  );
}

