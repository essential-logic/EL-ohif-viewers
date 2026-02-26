import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Contrast as ContrastIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import { Panel } from './ui/panel';
import { Box, Typography, ButtonBase, TextField, Grid } from '@mui/material';

const presets = [
  { id: 'abdomen', label: 'Abdomen', window: 400, level: 50, color: '#f8fafc' },
  { id: 'bone', label: 'Bone', window: 2000, level: 300, color: '#f1f5f9' },
  { id: 'brain', label: 'Brain', window: 80, level: 40, color: '#e2e8f0' },
  { id: 'lung', label: 'Lung', window: 1500, level: -600, color: '#cbd5e1' },
  { id: 'mediastinum', label: 'Mediastinum', window: 350, level: 50, color: '#94a3b8' },
  { id: 'soft-tissue', label: 'Soft Tissue', window: 400, level: 40, color: '#64748b' },
];

interface WindowLevelPresetsProps {
  onPresetChange?: (window: number, level: number) => void;
  currentWindow?: number;
  currentLevel?: number;
}

export function WindowLevelPresets({ 
  onPresetChange, 
  currentWindow = 400, 
  currentLevel = 40 
}: WindowLevelPresetsProps) {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [manualWindow, setManualWindow] = useState(currentWindow);
  const [manualLevel, setManualLevel] = useState(currentLevel);

  const handlePresetClick = (preset: typeof presets[0]) => {
    setActivePreset(preset.id);
    setManualWindow(preset.window);
    setManualLevel(preset.level);
    onPresetChange?.(preset.window, preset.level);
  };

  const handleManualChange = () => {
    setActivePreset(null);
    onPresetChange?.(manualWindow, manualLevel);
  };

  return (
    <Panel sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ContrastIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="subtitle2" fontWeight={600} color="text.primary">
          Window/Level Presets
        </Typography>
      </Box>

      {/* Preset Buttons */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {presets.map((preset) => (
          <Grid size={6} key={preset.id}>
            <ButtonBase
              onClick={() => handlePresetClick(preset)}
              sx={{
                width: '100%',
                p: 1.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor: activePreset === preset.id ? 'primary.main' : 'divider',
                bgcolor: activePreset === preset.id ? 'action.selected' : 'background.paper',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderColor: 'text.secondary',
                },
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                <Typography 
                  variant="caption" 
                  fontWeight={600}
                  sx={{ 
                    color: activePreset === preset.id ? 'primary.main' : 'text.primary',
                    display: 'block',
                    mb: 0.5
                  }}
                >
                  {preset.label}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    fontFamily: 'monospace',
                    fontSize: '0.65rem'
                  }}
                >
                  W:{preset.window} L:{preset.level}
                </Typography>
              </Box>
            </ButtonBase>
          </Grid>
        ))}
      </Grid>

      {/* Manual Input */}
      <Box sx={{ 
        p: 1.5, 
        borderRadius: 1, 
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <TuneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Manual Adjustment
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
              Window
            </Typography>
            <TextField
              size="small"
              type="number"
              value={manualWindow}
              onChange={(e) => setManualWindow(Number(e.target.value))}
              onBlur={handleManualChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  '& input': { py: 0.75, textAlign: 'center' }
                }
              }}
            />
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
              Level
            </Typography>
            <TextField
              size="small"
              type="number"
              value={manualLevel}
              onChange={(e) => setManualLevel(Number(e.target.value))}
              onBlur={handleManualChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  '& input': { py: 0.75, textAlign: 'center' }
                }
              }}
            />
          </Box>
        </Box>
      </Box>
    </Panel>
  );
}
