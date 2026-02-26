import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Divider, IconButton, Button } from '@mui/material';
import {
  ArrowBack as ArrowLeftIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Psychology as BrainCircuitIcon,
  GridView as LayoutGridIcon,
  Edit as AnnotationIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

import { ServicesManager } from '@ohif/core';

interface GlassToolbarProps {
  servicesManager?: ServicesManager;
  studyInstanceUIDs?: string | string[];
  onToggleCine?: () => void;
  isCineOpen?: boolean;
  onLayoutChange?: (id: string, rows: number, cols: number) => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
  onMenuClick?: () => void;
  isMobile?: boolean;
}

export function GlassToolbar({
  servicesManager,
  studyInstanceUIDs,
  onToggleCine,
  isCineOpen,
  onLayoutChange,
  viewMode,
  setViewMode,
  onMenuClick,
  isMobile,
}: GlassToolbarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        bgcolor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        px: isMobile ? 1 : 1.5,
        py: 0.75,
        gap: isMobile ? 1 : 1.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 1.5, minWidth: 0 }}>
        {/* Branding Block */}
        <Box sx={{ display: 'flex', flexDirection: 'column', width: 'fit-content' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 1.5 }}>
            <Box
              sx={{
                p: 0.75,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isMobile ? 32 : 40,
                height: isMobile ? 32 : 40,
              }}
            >
              <img
                src="/essential-logic-logo.png"
                alt="Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </Box>
            {!isMobile && (
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    background: 'linear-gradient(to right, #3b82f6, #93c5fd, #22d3ee)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 900,
                    lineHeight: 1,
                    letterSpacing: 1.5,
                    fontSize: '1.2rem',
                  }}
                >
                  DICOM Pro
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'block',
                    mt: 0.2,
                  }}
                >
                  by Essential Logic
                </Typography>
              </Box>
            )}
          </Box>
          {!isMobile && (
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.2)',
                fontSize: '0.45rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                display: 'block',
                mt: 0.4,
                width: '100%',
                lineHeight: 1,
                letterSpacing: 2.2,
                textAlign: 'center',
              }}
            >
              POWERED BY OHIF VIEWER
            </Typography>
          )}
        </Box>

        {!isMobile && (
          <Divider
            orientation="vertical"
            flexItem
            sx={{ bgcolor: 'rgba(255,255,255,0.08)', height: 24, my: 'auto', mx: 0.5 }}
          />
        )}

        {/* Navigation & Study Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isMobile && (
            <IconButton
              onClick={onMenuClick}
              size="small"
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.05)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <MenuIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
          <Button
            onClick={() => (window.location.href = '/')}
            size="small"
            sx={{
              color: 'text.secondary',
              textTransform: 'none',
              minWidth: 'auto',
              px: 1,
              py: 0.5,
              borderRadius: 1.5,
              gap: 0.5,
              '&:hover': { color: 'text.primary', bgcolor: 'rgba(255,255,255,0.05)' },
            }}
          >
            <ArrowLeftIcon sx={{ fontSize: 18 }} />
            {!isMobile && (
              <Typography
                variant="caption"
                fontWeight={700}
              >
                Back
              </Typography>
            )}
          </Button>

          {!isMobile && (
            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 0.5 }}>
              <Typography
                variant="caption"
                fontWeight={800}
                sx={{
                  color: '#94a3b8',
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Diagnostic View
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'primary.light',
                  opacity: 0.6,
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  lineHeight: 1,
                  mt: 0.2,
                }}
              >
                {studyInstanceUIDs
                  ? typeof studyInstanceUIDs === 'string'
                    ? studyInstanceUIDs.substring(0, 15) + '...'
                    : studyInstanceUIDs[0].substring(0, 15) + '...'
                  : 'Loading...'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Mode Switcher - Cleaned up to remove double icons */}
      <Box
        sx={{
          display: 'flex',
          bgcolor: 'rgba(0,0,0,0.3)',
          p: 0.4,
          borderRadius: 2,
          border: '1px solid rgba(255,255,255,0.03)',
          mx: 'auto', // Center the switcher
          gap: 0.5,
        }}
      >
        {[
          { id: 'viewer', label: 'Viewer', icon: LayoutGridIcon, color: '#3b82f6' },
          { id: 'segmentation', label: 'Segmentation', icon: BrainCircuitIcon, color: '#a855f7' },
          { id: 'annotation', label: 'Annotation', icon: AnnotationIcon, color: '#22c55e' },
        ].map(mode => (
          <Button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            size="small"
            sx={{
              borderRadius: 1.5,
              fontWeight: 700,
              bgcolor: viewMode === mode.id ? 'rgba(255,255,255,0.03)' : 'transparent',
              color: viewMode === mode.id ? mode.color : 'text.secondary',
              textTransform: 'none',
              fontSize: '0.8rem',
              minWidth: 'auto',
              px: isMobile ? 1 : 2,
              py: 0.5,
              transition: 'all 0.2s',
              border: '1px solid',
              borderColor: viewMode === mode.id ? 'rgba(255,255,255,0.05)' : 'transparent',
              '&:hover': {
                color: 'text.primary',
                bgcolor: 'rgba(255,255,255,0.05)',
              },
            }}
          >
            <motion.div
              animate={{
                scale: viewMode === mode.id ? 1.05 : 1,
                opacity: viewMode === mode.id ? 1 : 0.7,
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <mode.icon sx={{ fontSize: 18 }} />
              {!isMobile && mode.label}
            </motion.div>
          </Button>
        ))}
      </Box>

      {/* Quick Actions / Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ml: 'auto' }}>
        <IconButton
          size="small"
          sx={{
            color: 'rgba(255,255,255,0.4)',
            '&:hover': { color: 'text.primary', bgcolor: 'rgba(255,255,255,0.05)' },
          }}
        >
          <SettingsIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton
          size="small"
          sx={{
            color: 'rgba(255,255,255,0.4)',
            '&:hover': { color: 'text.primary', bgcolor: 'rgba(255,255,255,0.05)' },
          }}
        >
          <HelpIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            ml: 0.5,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)',
            cursor: 'pointer',
            '&:hover': { transform: 'scale(1.05)', transition: 'transform 0.2s' },
          }}
        />
      </Box>
    </Box>
  );
}
