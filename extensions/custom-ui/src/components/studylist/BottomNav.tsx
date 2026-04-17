import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, ButtonBase } from '@mui/material';
import {
  MonitorHeart as ActivityIcon,
  Settings as SettingsIcon,
  CloudQueue as RepoIcon,
} from '@mui/icons-material';

interface BottomNavProps {
  activeNav: string;
  onNavChange: (id: string) => void;
}

const NAV_ITEMS = [
  { id: 'patients', label: 'Studies', icon: <ActivityIcon sx={{ fontSize: 20 }} /> },
  { id: 'repositories', label: 'Repos', icon: <RepoIcon sx={{ fontSize: 20 }} /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon sx={{ fontSize: 20 }} /> },
];

export const BottomNav = memo(function BottomNav({ activeNav, onNavChange }: BottomNavProps) {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        bgcolor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        px: 2,
        zIndex: 1100,
      }}
    >
      {NAV_ITEMS.map(item => {
        const isActive = activeNav === item.id;
        return (
          <ButtonBase
            key={item.id}
            onClick={() => onNavChange(item.id)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
              color: isActive ? '#3b82f6' : 'text.secondary',
              transition: 'all 0.2s ease',
            }}
          >
            {item.icon}
            <Typography
              variant="caption"
              sx={{ fontSize: '0.65rem', fontWeight: isActive ? 600 : 400 }}
            >
              {item.label}
            </Typography>
            {isActive && (
              <motion.div
                layoutId="activeTabMobile"
                style={{
                  position: 'absolute',
                  top: -12,
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: '#3b82f6',
                  boxShadow: '0 0 8px #3b82f6',
                }}
              />
            )}
          </ButtonBase>
        );
      })}
    </Box>
  );
});
