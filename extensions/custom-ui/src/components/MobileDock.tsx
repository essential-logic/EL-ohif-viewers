import React from 'react';
import { Box, IconButton, Tooltip, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  NearMe as MousePointerIcon,
  PanTool as HandIcon,
  ZoomIn as ZoomIcon,
  MoreHoriz as MoreIcon,
} from '@mui/icons-material';

interface MobileDockProps {
  activeTool: string;
  onSelect: (toolId: string) => void;
  onMoreClick: () => void;
}

export function MobileDock({ activeTool, onSelect, onMoreClick }: MobileDockProps) {
  const tools = [
    { id: 'WindowLevel', icon: MousePointerIcon, label: 'Select' },
    { id: 'Pan', icon: HandIcon, label: 'Pan' },
    { id: 'Zoom', icon: ZoomIcon, label: 'Zoom' },
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1100,
        pointerEvents: 'none',
      }}
    >
      <Paper
        component={motion.div}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        elevation={0}
        sx={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.75,
          borderRadius: 100, // Pill shape like iPhone dock
          bgcolor: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
      >
        {tools.map(tool => {
          const isActive = activeTool === tool.id;
          return (
            <Tooltip
              key={tool.id}
              title={tool.label}
              placement="top"
            >
              <IconButton
                component={motion.button}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSelect(tool.id)}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  color: isActive ? 'primary.main' : 'rgba(255, 255, 255, 0.7)',
                  bgcolor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    color: isActive ? 'primary.light' : '#fff',
                  },
                }}
              >
                <tool.icon sx={{ fontSize: 24 }} />
              </IconButton>
            </Tooltip>
          );
        })}

        <Box
          sx={{
            width: 1,
            height: 24,
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            mx: 0.5,
          }}
        />

        <Tooltip
          title="More Tools"
          placement="top"
        >
          <IconButton
            component={motion.button}
            whileTap={{ scale: 0.9 }}
            onClick={onMoreClick}
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              color: 'rgba(255, 255, 255, 0.7)',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
              },
            }}
          >
            <MoreIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </Tooltip>
      </Paper>
    </Box>
  );
}
