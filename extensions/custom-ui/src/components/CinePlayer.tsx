import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as NextFrameIcon,
  SkipPrevious as PrevFrameIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Box, IconButton, Slider, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';

interface CinePlayerProps {
  open: boolean;
  isPlaying: boolean;
  onPlayPause: () => void;
  onClose: () => void;
  frameRate: number;
  onFrameRateChange: (fps: number) => void;
  currentFrame: number;
  totalFrames: number;
  onFrameChange: (frame: number) => void;
}

export function CinePlayer({
  open,
  isPlaying,
  onPlayPause,
  onClose,
  frameRate,
  currentFrame,
  totalFrames,
  onFrameChange,
}: CinePlayerProps) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          style={{
            position: 'absolute',
            top: isMobile ? 60 : 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            width: isMobile ? 'calc(100% - 32px)' : 'auto',
            maxWidth: isMobile ? 400 : 'none',
          }}
        >
          <Paper
            sx={{
              bgcolor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: isMobile ? 2 : 3,
              p: isMobile ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: isMobile ? 0.5 : 1,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 1,
                borderRight: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <IconButton
                size="small"
                onClick={() => onFrameChange(Math.max(1, currentFrame - 1))}
              >
                <PrevFrameIcon fontSize="small" />
              </IconButton>

              <IconButton
                onClick={onPlayPause}
                color="primary"
                sx={{
                  mx: 0.5,
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                  '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.25)' },
                }}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>

              <IconButton
                size="small"
                onClick={() => onFrameChange(Math.min(totalFrames, currentFrame + 1))}
              >
                <NextFrameIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 1 : 2,
                px: isMobile ? 1 : 2,
                flex: 1,
              }}
            >
              <Box sx={{ flex: 1, minWidth: isMobile ? 60 : 120 }}>
                <Slider
                  size="small"
                  value={currentFrame}
                  min={1}
                  max={totalFrames}
                  onChange={(_, v) => onFrameChange(v as number)}
                  sx={{ color: 'primary.main' }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  minWidth: isMobile ? 45 : 60,
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: isMobile ? '0.65rem' : '0.75rem',
                }}
              >
                {currentFrame}/{totalFrames}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                pl: 1,
                borderLeft: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mr: 1,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  borderRadius: 1.5,
                  px: 1,
                  py: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ mr: 1, color: 'text.secondary' }}
                >
                  FPS
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="primary"
                >
                  {frameRate}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={onClose}
                sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
