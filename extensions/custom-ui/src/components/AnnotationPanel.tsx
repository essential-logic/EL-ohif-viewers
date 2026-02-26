import React from 'react';
import { motion } from 'framer-motion';
import {
  TextFields as TextIcon,
  NorthEast as ArrowIcon,
  CropSquare as RectangleIcon,
  RadioButtonUnchecked as EllipseIcon,
  Delete as TrashIcon,
  Visibility as EyeIcon,
  VisibilityOff as EyeOffIcon,
  Add as PlusIcon,
} from '@mui/icons-material';
import { GlassPanel } from './GlassPanel';
import { Box, Typography, IconButton, ButtonBase } from '@mui/material';

const mockAnnotations = [
  { id: 1, type: 'Text', text: 'Patient ID verified', visible: true, author: 'Dr. Smith' },
  { id: 2, type: 'Arrow', text: 'Possible fracture', visible: true, author: 'Dr. Smith' },
  { id: 3, type: 'Rectangle', visible: false, author: 'AI Assistant' },
];

export function AnnotationPanel() {
  return (
    <GlassPanel sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography
          variant="subtitle2"
          fontWeight={600}
          color="text.primary"
        >
          ANNOTATIONS
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
          { icon: TextIcon, label: 'Text' },
          { icon: ArrowIcon, label: 'Arrow' },
          { icon: RectangleIcon, label: 'Rect' },
          { icon: EllipseIcon, label: 'Ellipse' },
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
              aspectRatio: '1/1',
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

      {/* List */}
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
          Recent
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {mockAnnotations.map((ann, index) => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Box
                sx={{
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 0.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: 'primary.main' }}
                    >
                      {ann.type}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      sx={{ p: 0.5, color: 'text.secondary' }}
                    >
                      {ann.visible ? (
                        <EyeIcon sx={{ fontSize: 14 }} />
                      ) : (
                        <EyeOffIcon sx={{ fontSize: 14 }} />
                      )}
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{ p: 0.5, color: 'text.secondary' }}
                    >
                      <TrashIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                </Box>

                {ann.text && (
                  <Typography
                    variant="caption"
                    color="text.primary"
                    sx={{ display: 'block', fontStyle: 'italic', mb: 0.5 }}
                  >
                    &quot;{ann.text}&quot;
                  </Typography>
                )}

                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.disabled',
                    fontSize: '0.6rem',
                    display: 'block',
                    textAlign: 'right',
                  }}
                >
                  by {ann.author}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Box>
    </GlassPanel>
  );
}
