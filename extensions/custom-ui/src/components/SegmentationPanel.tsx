import React from 'react';
import { motion } from 'framer-motion';
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
} from '@mui/icons-material';
import { GlassPanel } from './GlassPanel';
import { Box, Typography, IconButton, Slider, ButtonBase } from '@mui/material';

const labelmaps = [
  { id: 1, name: 'Liver', color: '#ef4444', visible: true, locked: false },
  { id: 2, name: 'Tumor', color: '#eab308', visible: true, locked: true },
  { id: 3, name: 'Vessels', color: '#3b82f6', visible: false, locked: false },
];

export function SegmentationPanel() {
  return (
    <GlassPanel sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography
          variant="subtitle2"
          fontWeight={600}
          color="text.primary"
        >
          SEGMENTATION
        </Typography>
        <IconButton
          size="small"
          sx={{ color: 'primary.main' }}
        >
          <PlusIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Tools */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
          gap: 1,
          mb: 3,
        }}
      >
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
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              '&:hover': {
                bgcolor: 'rgba(59, 130, 246, 0.1)',
                borderColor: 'primary.main',
              },
            }}
          >
            <tool.icon sx={{ fontSize: 18, color: 'text.secondary', mb: 0.5 }} />
            <Typography
              variant="caption"
              sx={{ fontSize: '0.6rem', color: 'text.secondary' }}
            >
              {tool.label}
            </Typography>
          </ButtonBase>
        ))}
      </Box>

      {/* Layers List */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontWeight: 700,
            display: 'block',
            mb: 1,
          }}
        >
          Segments
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {labelmaps.map((label, index) => (
            <motion.div
              key={label.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', borderColor: 'primary.main' },
                  transition: 'all 0.2s',
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: label.color,
                    boxShadow: `0 0 8px ${label.color}80`,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ flex: 1, fontWeight: 600, color: 'text.primary' }}
                >
                  {label.name}
                </Typography>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    sx={{ p: 0.5, color: label.visible ? 'text.primary' : 'text.disabled' }}
                  >
                    {label.visible ? (
                      <EyeIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <EyeOffIcon sx={{ fontSize: 14 }} />
                    )}
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{ p: 0.5, color: label.locked ? 'warning.main' : 'text.disabled' }}
                  >
                    {label.locked ? (
                      <LockIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <UnlockIcon sx={{ fontSize: 14 }} />
                    )}
                  </IconButton>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Box>

      {/* Opacity Slider */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Global Opacity
          </Typography>
          <Typography
            variant="caption"
            color="primary.main"
            fontWeight={700}
          >
            50%
          </Typography>
        </Box>
        <Slider
          size="small"
          defaultValue={50}
          sx={{ color: 'primary.main' }}
        />
      </Box>
    </GlassPanel>
  );
}
