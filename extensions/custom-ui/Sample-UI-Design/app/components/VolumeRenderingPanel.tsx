import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ViewInAr as ViewInArIcon,
  Tune as TuneIcon,
  Opacity as OpacityIcon,
  Palette as PaletteIcon,
  ContentCut as ContentCutIcon,
  ThreeDRotation as ThreeDRotationIcon
} from '@mui/icons-material';
import { Panel } from './ui/panel';
import { 
  Box, 
  Typography, 
  Slider, 
  ButtonBase,
  Divider,
  Grid
} from '@mui/material';

const renderingPresets = [
  { id: 'mip', label: 'MIP', description: 'Max Intensity', color: '#3b82f6' },
  { id: 'minip', label: 'MinIP', description: 'Min Intensity', color: '#8b5cf6' },
  { id: 'average', label: 'Average', description: 'Average Intensity', color: '#10b981' },
  { id: 'vr', label: 'Volume', description: 'Volumetric', color: '#ef4444' },
];

const transferFunctionPresets = [
  { id: 'ct-bone', label: 'Bone', color: '#f59e0b' },
  { id: 'ct-soft-tissue', label: 'Soft Tissue', color: '#ec4899' },
  { id: 'ct-lung', label: 'Lung', color: '#3b82f6' },
  { id: 'ct-air', label: 'Air', color: '#6b7280' },
  { id: 'mri-default', label: 'MRI', color: '#8b5cf6' },
  { id: 'pet-default', label: 'PET', color: '#ef4444' },
];

interface VolumeRenderingPanelProps {
  onRenderingModeChange?: (mode: string) => void;
  onTransferFunctionChange?: (preset: string) => void;
  onOpacityChange?: (value: number) => void;
  onClippingChange?: (axis: string, value: number) => void;
}

export function VolumeRenderingPanel({
  onRenderingModeChange,
  onTransferFunctionChange,
  onOpacityChange,
  onClippingChange
}: VolumeRenderingPanelProps) {
  const [activePreset, setActivePreset] = useState('mip');
  const [activeTransferFunction, setActiveTransferFunction] = useState('ct-bone');
  const [opacity, setOpacity] = useState(100);
  const [clippingX, setClippingX] = useState(50);
  const [clippingY, setClippingY] = useState(50);
  const [clippingZ, setClippingZ] = useState(50);

  const handlePresetChange = (presetId: string) => {
    setActivePreset(presetId);
    onRenderingModeChange?.(presetId);
  };

  const handleTransferFunctionChange = (tfId: string) => {
    setActiveTransferFunction(tfId);
    onTransferFunctionChange?.(tfId);
  };

  const handleOpacityChange = (_: Event, value: number | number[]) => {
    const newValue = value as number;
    setOpacity(newValue);
    onOpacityChange?.(newValue);
  };

  return (
    <Panel sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ViewInArIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="subtitle2" fontWeight={600} color="text.primary">
          3D Volume Rendering
        </Typography>
      </Box>

      <Divider sx={{ mb: 2, borderColor: 'divider' }} />

      {/* Rendering Mode Presets */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <ThreeDRotationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Mode
          </Typography>
        </Box>

        <Grid container spacing={1}>
          {renderingPresets.map((preset) => (
            <Grid size={6} key={preset.id}>
              <ButtonBase
                onClick={() => handlePresetChange(preset.id)}
                sx={{
                  width: '100%',
                  p: 1.25,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: activePreset === preset.id ? 'primary.main' : 'divider',
                  bgcolor: activePreset === preset.id ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderColor: 'text.secondary',
                  },
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                  <Typography 
                    variant="caption" 
                    fontWeight={600}
                    sx={{ 
                      color: activePreset === preset.id ? 'primary.main' : 'text.primary',
                      display: 'block',
                      mb: 0.25
                    }}
                  >
                    {preset.label}
                  </Typography>
                </Box>
              </ButtonBase>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Transfer Function Presets */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <PaletteIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Transfer Function
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {transferFunctionPresets.map((tf) => (
            <ButtonBase
              key={tf.id}
              onClick={() => handleTransferFunctionChange(tf.id)}
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: 10,
                border: '1px solid',
                borderColor: activeTransferFunction === tf.id ? 'primary.main' : 'divider',
                bgcolor: activeTransferFunction === tf.id ? 'action.selected' : 'background.paper',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderColor: 'text.secondary',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: tf.color,
                }} />
                <Typography 
                  variant="caption" 
                  fontWeight={activeTransferFunction === tf.id ? 600 : 400}
                  sx={{ 
                    color: activeTransferFunction === tf.id ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {tf.label}
                </Typography>
              </Box>
            </ButtonBase>
          ))}
        </Box>
      </Box>

      {/* Opacity Control */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <OpacityIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
              Opacity
            </Typography>
          </Box>
          <Typography variant="caption" fontWeight={600} sx={{ color: 'text.primary', fontFamily: 'monospace' }}>
            {opacity}%
          </Typography>
        </Box>
        <Slider
          value={opacity}
          onChange={handleOpacityChange}
          min={0}
          max={100}
          size="small"
          sx={{
            color: 'primary.main',
            height: 3,
            '& .MuiSlider-thumb': { width: 12, height: 12 },
          }}
        />
      </Box>

      {/* Clipping Planes */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <ContentCutIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Clipping Planes
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* X Axis */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>X Axis</Typography>
              <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                {clippingX}%
              </Typography>
            </Box>
            <Slider
              value={clippingX}
              onChange={(_, value) => {
                setClippingX(value as number);
                onClippingChange?.('x', value as number);
              }}
              min={0}
              max={100}
              size="small"
              sx={{
                color: 'text.secondary',
                height: 3,
                '& .MuiSlider-thumb': { width: 10, height: 10 },
              }}
            />
          </Box>

          {/* Y Axis */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>Y Axis</Typography>
              <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                {clippingY}%
              </Typography>
            </Box>
            <Slider
              value={clippingY}
              onChange={(_, value) => {
                setClippingY(value as number);
                onClippingChange?.('y', value as number);
              }}
              min={0}
              max={100}
              size="small"
              sx={{
                color: 'text.secondary',
                height: 3,
                '& .MuiSlider-thumb': { width: 10, height: 10 },
              }}
            />
          </Box>

          {/* Z Axis */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>Z Axis</Typography>
              <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                {clippingZ}%
              </Typography>
            </Box>
            <Slider
              value={clippingZ}
              onChange={(_, value) => {
                setClippingZ(value as number);
                onClippingChange?.('z', value as number);
              }}
              min={0}
              max={100}
              size="small"
              sx={{
                color: 'text.secondary',
                height: 3,
                '& .MuiSlider-thumb': { width: 10, height: 10 },
              }}
            />
          </Box>
        </Box>
      </Box>
    </Panel>
  );
}
