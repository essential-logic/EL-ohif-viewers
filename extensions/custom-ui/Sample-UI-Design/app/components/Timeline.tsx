import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon, 
  PlayArrow as PlayIcon, 
  Pause as PauseIcon 
} from '@mui/icons-material';
import { GlassPanel } from './ui/glass-panel';
import { Box, Typography, IconButton, Slider, ButtonBase, useTheme } from '@mui/material';

const series = Array.from({ length: 128 }, (_, i) => ({
  id: i + 1,
  label: `Slice ${i + 1}`,
}));

export function Timeline() {
  const [currentSlice, setCurrentSlice] = useState(45);
  const [isPlaying, setIsPlaying] = useState(false);
  const theme = useTheme();

  const handleSliceChange = (e: Event, value: number | number[]) => {
    setCurrentSlice(value as number);
  };

  return (
    <GlassPanel className="mt-4" sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Playback Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            component={motion.button}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentSlice(Math.max(1, currentSlice - 1))}
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)', color: 'primary.main' } }}
            size="small"
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>

          <IconButton
            component={motion.button}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPlaying(!isPlaying)}
            sx={{ 
                bgcolor: isPlaying ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)', 
                border: '1px solid rgba(59, 130, 246, 0.5)', 
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.4)' },
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)'
            }}
          >
            {isPlaying ? (
              <PauseIcon />
            ) : (
              <PlayIcon />
            )}
          </IconButton>

          <IconButton
            component={motion.button}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentSlice(Math.min(128, currentSlice + 1))}
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)', color: 'primary.main' } }}
            size="small"
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Slice Counter */}
        <Box sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(59, 130, 246, 0.3)', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'primary.main', fontWeight: 600 }}>{currentSlice} <Box component="span" sx={{ color: 'text.secondary' }}>/</Box> 128</Typography>
        </Box>

        {/* Timeline Slider */}
        <Box sx={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Slider
            size="small"
            min={1}
            max={128}
            value={currentSlice}
            onChange={handleSliceChange}
            sx={{ 
                color: 'primary.main', 
                height: 4, 
                '& .MuiSlider-thumb': { 
                    width: 12, 
                    height: 12, 
                    boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: '0 0 15px rgba(59, 130, 246, 0.8)' }
                },
                '& .MuiSlider-track': {
                    border: 'none',
                    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
                },
                '& .MuiSlider-rail': {
                    opacity: 0.2,
                    backgroundColor: 'text.secondary'
                }
            }}
          />
        </Box>

        {/* Speed Control */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">Speed</Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {['0.5x', '1x', '2x'].map((speed) => (
              <ButtonBase
                component={motion.button}
                key={speed}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                sx={{ 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: 1, 
                    bgcolor: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.65rem',
                    color: 'text.secondary',
                    '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)', color: 'primary.main', borderColor: 'rgba(59, 130, 246, 0.3)' } 
                }}
              >
                {speed}
              </ButtonBase>
            ))}
          </Box>
        </Box>

        {/* Frame rate indicator */}
        <Box sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
          <Typography variant="caption" sx={{ color: 'secondary.main', fontFamily: 'monospace', fontWeight: 600 }}>30 FPS</Typography>
        </Box>
      </Box>


    </GlassPanel>
  );
}