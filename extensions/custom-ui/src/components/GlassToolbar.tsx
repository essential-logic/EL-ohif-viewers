import React from 'react';
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

interface GlassToolbarProps {
  servicesManager?: Record<string, unknown>;
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
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        px: isMobile ? 1.5 : 3,
        py: 1,
        gap: isMobile ? 1 : 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 3 }}>
        {/* Mobile Menu Toggle - Highly visible for mobile users */}
        {isMobile && (
          <Button
            onClick={onMenuClick}
            variant="contained"
            size="small"
            startIcon={<MenuIcon />}
            sx={{
              bgcolor: 'rgba(59, 130, 246, 0.8)',
              color: 'white',
              fontWeight: 'bold',
              minWidth: 90,
              fontSize: '0.75rem',
              '&:hover': { bgcolor: '#3b82f6' },
              mr: 1,
            }}
          >
            Tools
          </Button>
        )}

        {/* Branding Block */}
        <Box sx={{ display: 'flex', flexDirection: 'column', width: 'fit-content' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                p: 0.5,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: 'primary.main',
                  fontWeight: 800,
                  fontSize: isMobile ? '1rem' : '1.25rem',
                }}
              >
                🩺
              </Typography>
            </Box>
            {!isMobile && (
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    background: 'linear-gradient(to right, #3b82f6, #93c5fd, #22d3ee)',
                    backgroundClip: 'text',
                    color: 'transparent',
                    fontWeight: 800,
                    lineHeight: 1.3,
                    fontSize: '1.2rem',
                    letterSpacing: 0.1,
                  }}
                >
                  DICOM Pro
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    display: 'block',
                    lineHeight: 1,
                  }}
                >
                  by Essential Logic
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {!isMobile && (
          <Divider
            orientation="vertical"
            flexItem
            sx={{ bgcolor: 'rgba(255,255,255,0.1)', height: 32, my: 'auto' }}
          />
        )}

        {/* Navigation & Study Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2 }}>
          <Button
            startIcon={<ArrowLeftIcon />}
            onClick={() => (window.location.href = '/')}
            size="small"
            sx={{
              color: 'text.secondary',
              textTransform: 'none',
              minWidth: isMobile ? 'auto' : 64,
              '& .MuiButton-startIcon': { mr: isMobile ? 0 : 0.5 },
              '&:hover': { color: 'text.primary', bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            {!isMobile && 'Back'}
          </Button>
          {!isMobile && (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="body2"
                fontWeight={600}
                color="text.primary"
              >
                Diagnostic View
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'primary.main', fontFamily: 'monospace' }}
              >
                {studyInstanceUIDs
                  ? typeof studyInstanceUIDs === 'string'
                    ? studyInstanceUIDs
                    : studyInstanceUIDs[0]
                  : 'Loading...'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Mode Switcher */}
      <Box
        sx={{
          display: 'flex',
          bgcolor: 'rgba(0,0,0,0.2)',
          p: 0.5,
          borderRadius: 2,
          border: '1px solid rgba(255,255,255,0.05)',
          mx: isMobile ? 0 : 2,
        }}
      >
        <Button
          onClick={() => setViewMode('viewer')}
          startIcon={<LayoutGridIcon />}
          size="small"
          sx={{
            borderRadius: 1.5,
            fontWeight: 500,
            bgcolor: viewMode === 'viewer' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            color: viewMode === 'viewer' ? 'primary.main' : 'text.secondary',
            textTransform: 'none',
            fontSize: isMobile ? '0.7rem' : '0.875rem',
            minWidth: isMobile ? 'auto' : 80,
            '& .MuiButton-startIcon': { mr: isMobile ? 0 : 0.5 },
            '&:hover': { color: 'text.primary' },
          }}
        >
          {!isMobile && 'Viewer'}
        </Button>
        <Button
          onClick={() => setViewMode('segmentation')}
          startIcon={<BrainCircuitIcon />}
          size="small"
          sx={{
            borderRadius: 1.5,
            fontWeight: 500,
            bgcolor: viewMode === 'segmentation' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
            color: viewMode === 'segmentation' ? 'secondary.main' : 'text.secondary',
            textTransform: 'none',
            fontSize: isMobile ? '0.7rem' : '0.875rem',
            minWidth: isMobile ? 'auto' : 110,
            '& .MuiButton-startIcon': { mr: isMobile ? 0 : 0.5 },
            '&:hover': { color: 'text.primary' },
          }}
        >
          {!isMobile && 'Segmentation'}
        </Button>
        <Button
          onClick={() => setViewMode('annotation')}
          startIcon={<AnnotationIcon />}
          size="small"
          sx={{
            borderRadius: 1.5,
            fontWeight: 500,
            bgcolor: viewMode === 'annotation' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            color: viewMode === 'annotation' ? 'success.main' : 'text.secondary',
            textTransform: 'none',
            fontSize: isMobile ? '0.7rem' : '0.875rem',
            minWidth: isMobile ? 'auto' : 100,
            '& .MuiButton-startIcon': { mr: isMobile ? 0 : 0.5 },
            '&:hover': { color: 'text.primary' },
          }}
        >
          {!isMobile && 'Annotation'}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <SettingsIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'text.primary', bgcolor: 'rgba(255,255,255,0.1)' },
          }}
        >
          <HelpIcon fontSize="small" />
        </IconButton>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(to top right, #3b82f6, #8b5cf6)',
            ml: 1,
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        />
      </Box>
    </Box>
  );
}
