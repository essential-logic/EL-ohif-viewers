import React, { useState } from 'react';

import {
  Palette as PaletteIcon,
  Tune as TuneIcon,
  ExpandMore as ChevronDownIcon,
  Contrast as ContrastIcon,
  RestartAlt as ResetIcon,
  InvertColors as InvertIcon,
} from '@mui/icons-material';
import { Box, Typography, Collapse, Tooltip, ButtonBase, IconButton } from '@mui/material';
import { GlassPanel } from './GlassPanel';

import { CommandsManager } from '@ohif/core';

interface ImageAdjustmentPanelProps {
  commandsManager?: CommandsManager;
}

// LUT (colormap) options – a useful subset from colormaps.js
const LUTS = [
  { name: 'Grayscale', color: '#94a3b8' },
  { name: 'X Ray', color: '#e2e8f0' },
  { name: 'hot_iron', label: 'Hot Iron', color: '#ef4444' },
  { name: 'red_hot', label: 'Red Hot', color: '#f97316' },
  { name: 'hsv', label: 'Rainbow', color: '#a855f7' },
];

const WL_PRESETS = [
  { name: 'Soft Tissue', options: { presetName: 'ct-soft-tissue', presetIndex: 0 } },
  { name: 'Lung', options: { presetName: 'ct-lung', presetIndex: 1 } },
  { name: 'Bone', options: { presetName: 'ct-bone', presetIndex: 2 } },
  { name: 'Brain', options: { presetName: 'ct-brain', presetIndex: 3 } },
];

function SectionHeader({
  icon: Icon,
  title,
  expanded,
  onToggle,
}: {
  icon: React.ElementType;
  title: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <ButtonBase
      onClick={onToggle}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1,
        px: 0.5,
        borderRadius: 1,
        '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Icon sx={{ fontSize: 14, color: 'primary.light' }} />
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.68rem' }}
        >
          {title}
        </Typography>
      </Box>
      <ChevronDownIcon
        sx={{
          fontSize: 16,
          color: 'text.secondary',
          transition: 'transform 0.2s',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
      />
    </ButtonBase>
  );
}

export function ImageAdjustmentPanel({ commandsManager }: ImageAdjustmentPanelProps) {
  const [activeLUT, setActiveLUT] = useState<string>('Grayscale');
  const [lutExpanded, setLutExpanded] = useState(true);
  const [wlExpanded, setWlExpanded] = useState(true);

  const applyLUT = (lut: { name: string }) => {
    setActiveLUT(lut.name);
    try {
      commandsManager?.runCommand('setViewportColormap', {
        colormap: { name: lut.name, opacity: 1 },
      });
    } catch {
      // silent
    }
  };

  const applyWLPreset = (options: Record<string, unknown>) => {
    try {
      commandsManager?.runCommand('setWindowLevelPreset', options);
    } catch {
      // silent
    }
  };

  const invertImage = () => {
    try {
      commandsManager?.runCommand('invertViewport');
    } catch {
      // silent
    }
  };

  const resetImage = () => {
    setActiveLUT('Grayscale');
    try {
      commandsManager?.runCommand('resetViewport');
    } catch {
      // silent
    }
  };

  return (
    <GlassPanel
      sx={{
        height: '100%',
        overflowY: 'auto',
        p: 1.5,
        gap: 0,
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TuneIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{ letterSpacing: 0.5 }}
          >
            Image Adjustments
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Invert Colors">
            <IconButton
              size="small"
              onClick={invertImage}
              sx={{ color: 'text.secondary', p: 0.5 }}
            >
              <InvertIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset Viewport">
            <IconButton
              size="small"
              onClick={resetImage}
              sx={{ color: 'text.secondary', p: 0.5 }}
            >
              <ResetIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          height: '1px',
          bgcolor: 'rgba(255,255,255,0.05)',
          mb: 1.5,
          mx: -0.5,
        }}
      />

      {/* ── LUT / Colormap ── */}
      <SectionHeader
        icon={PaletteIcon}
        title="Lookup Table (LUT)"
        expanded={lutExpanded}
        onToggle={() => setLutExpanded(v => !v)}
      />
      <Collapse in={lutExpanded}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.75,
            px: 0.5,
            mb: 1.5,
          }}
        >
          {LUTS.map(lut => (
            <Tooltip
              key={lut.name}
              title={lut.label ?? lut.name}
              placement="top"
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: 'rgba(15,23,42,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '0.7rem',
                  },
                },
              }}
            >
              <ButtonBase
                onClick={() => applyLUT(lut)}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  border: '1px solid',
                  borderColor:
                    activeLUT === lut.name ? 'rgba(59,130,246,0.7)' : 'rgba(255,255,255,0.08)',
                  bgcolor:
                    activeLUT === lut.name ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                  transition: 'all 0.15s',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.25)',
                    bgcolor: 'rgba(255,255,255,0.06)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    bgcolor: lut.color,
                    boxShadow: `0 0 8px ${lut.color}80`,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ fontSize: '0.52rem', color: 'text.secondary', lineHeight: 1 }}
                >
                  {(lut.label ?? lut.name).substring(0, 5)}
                </Typography>
              </ButtonBase>
            </Tooltip>
          ))}
        </Box>
      </Collapse>

      <Box sx={{ height: '1px', bgcolor: 'rgba(255,255,255,0.05)', mb: 1, mx: -0.5 }} />

      {/* ── Window / Level Presets ── */}
      <SectionHeader
        icon={ContrastIcon}
        title="W/L Presets"
        expanded={wlExpanded}
        onToggle={() => setWlExpanded(v => !v)}
      />
      <Collapse in={wlExpanded}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
            px: 0.5,
            mb: 1.5,
          }}
        >
          {WL_PRESETS.map(preset => (
            <ButtonBase
              key={preset.name}
              onClick={() => applyWLPreset(preset.options)}
              sx={{
                py: 1,
                borderRadius: 1,
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'text.secondary',
                fontSize: '0.7rem',
                fontWeight: 600,
                transition: 'all 0.15s',
                '&:hover': {
                  bgcolor: 'rgba(59,130,246,0.1)',
                  borderColor: 'rgba(59,130,246,0.3)',
                  color: 'primary.main',
                },
              }}
            >
              {preset.name}
            </ButtonBase>
          ))}
        </Box>
      </Collapse>

    </GlassPanel>
  );
}
