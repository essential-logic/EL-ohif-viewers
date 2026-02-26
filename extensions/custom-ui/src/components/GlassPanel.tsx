import React from 'react';
import { Paper } from '@mui/material';
import { motion } from 'framer-motion';

// Create a Motion component from MUI Paper
const MotionPaper = motion(Paper);

export function GlassPanel({ children, className = '', sx, ...props }: any) {
  return (
    <MotionPaper
      className={className}
      elevation={0}
      {...props}
      sx={{
        borderRadius: 4,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: '100%',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        ...sx,
      }}
    >
      {children}
    </MotionPaper>
  );
}
