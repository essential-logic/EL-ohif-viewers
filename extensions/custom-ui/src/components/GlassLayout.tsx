import React from 'react';
import { motion } from 'framer-motion';
import { Box, useTheme, useMediaQuery } from '@mui/material';

export function GlassLayout({
  children,
  header,
  sidebar,
  rightPanel,
  sidebarWidth = 240,
  className = '',
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  rightPanel?: React.ReactNode;
  sidebarWidth?: number;
  className?: string;
}) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        bgcolor: 'background.default',
        color: 'text.primary',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
      className={className}
    >
      {/* Animated Deep Space Background */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '50%',
            height: '50%',
            bgcolor: 'primary.main',
            opacity: 0.1,
            borderRadius: '50%',
            filter: 'blur(120px)',
            animation: 'pulse_bg 8s infinite ease-in-out',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-20%',
            right: '-10%',
            width: '50%',
            height: '50%',
            bgcolor: 'secondary.main',
            opacity: 0.1,
            borderRadius: '50%',
            filter: 'blur(120px)',
            animation: 'pulse_bg 8s infinite ease-in-out',
            animationDelay: '4s',
          }}
        />
        <style>
          {`
            @keyframes pulse_bg {
              0%, 100% { opacity: 0.1; transform: scale(1); }
              50% { opacity: 0.15; transform: scale(1.1); }
            }
          `}
        </style>
      </Box>

      {/* Header Area */}
      {header && (
        <Box
          component="header"
          sx={{ position: 'relative', zIndex: 1000, width: '100%', flexShrink: 0 }}
        >
          {header}
        </Box>
      )}

      {/* Main Content Area */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          width: '100%',
          flex: 1,
          minHeight: 0,
          p: isMobile ? 1 : 2,
          gap: isMobile ? 1 : 2,
        }}
      >
        {/* Left Sidebar - Hidden on Mobile in Layout, will be in Drawer */}
        {sidebar && !isMobile && (
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{ width: sidebarWidth, flexShrink: 0, display: 'flex', flexDirection: 'column' }}
          >
            {sidebar}
          </motion.aside>
        )}

        {/* Center Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            position: 'relative',
          }}
        >
          {children}
        </Box>

        {/* Right Panel - Hidden on Mobile */}
        {rightPanel && !isMobile && (
          <motion.aside
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column' }}
          >
            {rightPanel}
          </motion.aside>
        )}
      </Box>
    </Box>
  );
}
