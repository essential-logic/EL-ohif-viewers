import { motion } from 'motion/react';
import { 
  Brush as BrushIcon, 
  AutoFixHigh as EraserIcon, 
  ContentCut as ScissorsIcon, 
  Psychology as AiIcon, 
  Add as PlusIcon, 
  Visibility as EyeIcon, 
  VisibilityOff as EyeOffIcon, 
  Lock as LockIcon, 
  LockOpen as UnlockIcon, 
  Delete as TrashIcon,
  Layers as LayersIcon
} from '@mui/icons-material';
import { GlassPanel } from './ui/glass-panel';
import { Box, Typography, IconButton, Slider, ButtonBase } from '@mui/material';

const labelmaps = [
  { id: 1, name: 'Liver', color: '#ef4444', visible: true, locked: false }, // bg-red-500
  { id: 2, name: 'Tumor', color: '#eab308', visible: true, locked: true }, // bg-yellow-500
  { id: 3, name: 'Vessels', color: '#3b82f6', visible: false, locked: false }, // bg-blue-500
];

export function SegmentationPanel() {
  return (
    <GlassPanel className="h-full" sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={500} color="text.primary">Segmentation</Typography>
        <IconButton
          component={motion.button}
          whileHover={{ scale: 1.1 }}
          size="small"
          sx={{ bgcolor: 'rgba(59, 130, 246, 0.2)', color: 'primary.main', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.3)' } }}
        >
          <PlusIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Tools */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mb: 3 }}>
        {[
          { icon: BrushIcon, label: 'Paint' },
          { icon: EraserIcon, label: 'Erase' },
          { icon: ScissorsIcon, label: 'Cut' },
          { icon: AiIcon, label: 'AI' },
        ].map((tool, index) => (
          <ButtonBase
            component={motion.button}
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1,
                borderRadius: 3,
                aspectRatio: '1/1',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s',
                '&:hover': {
                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: 'rgba(59, 130, 246, 0.5)',
                }
            }}
          >
            <tool.icon sx={{ fontSize: 20, color: 'text.secondary', mb: 0.5, '.grooup:hover &': { color: 'primary.main' } }} />
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>{tool.label}</Typography>
          </ButtonBase>
        ))}
      </Box>

      {/* Layers List */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, display: 'block', mb: 1 }}>
            Segments
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {labelmaps.map((label, index) => (
            <Box
              component={motion.div}
              key={label.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.1)' },
                transition: 'all 0.2s'
              }}
            >
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: label.color, boxShadow: `0 0 5px ${label.color}80` }} />
              <Typography variant="caption" sx={{ flex: 1, fontWeight: 500, color: 'text.primary' }}>{label.name}</Typography>
              
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton size="small" sx={{ p: 0.5, color: label.visible ? 'text.primary' : 'text.disabled' }}>
                  {label.visible ? <EyeIcon fontSize="inherit" sx={{ fontSize: 14 }} /> : <EyeOffIcon fontSize="inherit" sx={{ fontSize: 14 }} />}
                </IconButton>
                <IconButton size="small" sx={{ p: 0.5, color: label.locked ? 'warning.main' : 'text.disabled' }}>
                  {label.locked ? <LockIcon fontSize="inherit" sx={{ fontSize: 14 }} /> : <UnlockIcon fontSize="inherit" sx={{ fontSize: 14 }} />}
                </IconButton>
                <IconButton size="small" sx={{ p: 0.5, color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                  <TrashIcon fontSize="inherit" sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Opacity Slider */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
           <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Opacity</Typography>
           <Typography variant="caption" color="text.secondary">50%</Typography>
        </Box>
        <Slider 
            size="small"
            defaultValue={50}
            min={0}
            max={100}
            sx={{ color: 'primary.main', height: 4, '& .MuiSlider-thumb': { width: 12, height: 12 } }}
        />
      </Box>
    </GlassPanel>
  );
}
