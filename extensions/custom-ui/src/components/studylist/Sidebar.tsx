import React, { memo } from 'react';
import { Box, Typography, ButtonBase, LinearProgress } from '@mui/material';
import {
  Settings as SettingsIcon,
  MonitorHeart as ActivityIcon,
  CloudQueue as RepoIcon,
} from '@mui/icons-material';

const NAV_ITEMS = [
  { id: 'patients', label: 'Studies', icon: <ActivityIcon sx={{ fontSize: 20 }} /> },
  { id: 'aws-public', label: 'AWS Public', icon: <RepoIcon sx={{ fontSize: 20 }} /> },
  { id: 'repositories', label: 'Repositories', icon: <RepoIcon sx={{ fontSize: 20 }} /> },
];

interface SidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  onSettingsOpen?: () => void;
  isLoading?: boolean;
  storageUsedBytes?: number | null;
}

export const Sidebar = memo(function Sidebar({
  activeNav,
  onNavChange,
  onSettingsOpen,
  isLoading = false,
  storageUsedBytes = null,
}: SidebarProps) {
  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 3,
        p: 2,
      }}
    >
      {/* Branding */}
      <Box sx={{ mb: 4, width: 'fit-content' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Box
            sx={{
              p: 0.75,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
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
          <Box>
            <Typography
              variant="h6"
              sx={{
                background: 'linear-gradient(to right, #3b82f6, #93c5fd, #22d3ee)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                lineHeight: 1.1,
                fontSize: '1.25rem',
                letterSpacing: 0.2,
              }}
            >
              DICOM Pro
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: 800,
                display: 'block',
                lineHeight: 1.2,
              }}
            >
              by Essential Logic
            </Typography>
          </Box>
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.5rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            display: 'block',
            mt: 0.6,
            letterSpacing: 4,
            lineHeight: 1,
          }}
        >
          POWERED BY OHIF VIEWER
        </Typography>
      </Box>

      {/* Navigation */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {NAV_ITEMS.map(item => {
          const isActive = activeNav === item.id;
          return (
            <ButtonBase
              key={item.id}
              onClick={() => onNavChange(item.id)}
              sx={{
                justifyContent: 'flex-start',
                px: 1.5,
                py: 1,
                borderRadius: 2,
                width: '100%',
                bgcolor: isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                color: isActive ? 'primary.main' : 'text.secondary',
                border: `1px solid ${isActive ? 'rgba(59, 130, 246, 0.25)' : 'transparent'}`,
                '&:hover': {
                  bgcolor: isActive ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255,255,255,0.05)',
                  color: isActive ? 'primary.main' : 'text.primary',
                },
                transition: 'all 0.15s',
              }}
            >
              {item.icon}
              <Typography
                variant="body2"
                fontWeight={500}
                sx={{ ml: 1.5 }}
              >
                {item.label}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>

      {/* Bottom: Settings */}
      <Box sx={{ mt: 'auto', width: '100%' }}>
        <ButtonBase
          onClick={onSettingsOpen}
          sx={{
            justifyContent: 'flex-start',
            px: 1.5,
            py: 1,
            mb: 2,
            borderRadius: 2,
            bgcolor: activeNav === 'settings' ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
            color: activeNav === 'settings' ? 'primary.main' : 'text.secondary',
            border: `1px solid ${activeNav === 'settings' ? 'rgba(59, 130, 246, 0.25)' : 'transparent'}`,
            '&:hover': {
              bgcolor:
                activeNav === 'settings' ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255,255,255,0.05)',
              color: activeNav === 'settings' ? 'primary.main' : 'text.primary',
            },
            width: '100%',
          }}
        >
          <SettingsIcon sx={{ fontSize: 20 }} />
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{ ml: 1.5 }}
          >
            Settings
          </Typography>
        </ButtonBase>

        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            background:
              activeNav === 'aws-public'
                ? 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.06))'
                : 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.06))',
            border:
              activeNav === 'aws-public'
                ? '1px solid rgba(59,130,246,0.2)'
                : '1px solid rgba(139,92,246,0.2)',
          }}
        >
          <Typography
            variant="caption"
            sx={{ 
              color: activeNav === 'aws-public' ? 'rgba(96,165,250,0.9)' : 'rgba(167,139,250,0.9)', 
              mb: 0.5, 
              display: 'block',
              fontWeight: 600
            }}
          >
            {activeNav === 'aws-public' ? 'AWS Public Storage' : 'My Private Storage (Orthanc)'}
          </Typography>
          <LinearProgress
            variant={isLoading || (activeNav !== 'aws-public' && storageUsedBytes === null) ? 'indeterminate' : 'determinate'}
            value={activeNav === 'aws-public' ? 100 : (storageUsedBytes !== null ? Math.min((storageUsedBytes / (512 * 1024 * 1024)) * 100, 100) : 0)}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: activeNav === 'aws-public' ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)',
              '& .MuiLinearProgress-bar': {
                bgcolor: activeNav === 'aws-public' ? 'primary.main' : 'secondary.main',
                borderRadius: 3,
              },
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: '0.65rem', display: 'flex', mt: 0.5 }}
          >
            {activeNav === 'aws-public' ? (
              <span>Connected to public cloud list</span>
            ) : storageUsedBytes !== null ? (
              <span style={{ fontWeight: 600, width: '100%', textAlign: 'right' }}>
                {storageUsedBytes === 0 ? '0 MB' : (storageUsedBytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '') + ' MB'} / 512 MB
              </span>
            ) : null}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});
