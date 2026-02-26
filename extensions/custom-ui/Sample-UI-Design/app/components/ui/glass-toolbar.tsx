import { Paper, type SxProps, type Theme } from '@mui/material';
import { motion } from 'motion/react';

interface GlassToolbarProps {
  children: React.ReactNode;
  className?: string; // Kept for compatibility but should use sx in future
  position?: 'top' | 'bottom' | 'floating';
  sx?: SxProps<Theme>;
}

const MotionPaper = motion(Paper);

export function GlassToolbar({ children, className = "", position = 'floating', sx }: GlassToolbarProps) {
  const positionStyles = {
    top: { top: 16, left: '50%', transform: 'translateX(-50%)' },
    bottom: { bottom: 16, left: '50%', transform: 'translateX(-50%)' },
    floating: {},
  };

  return (
    <MotionPaper
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      elevation={0}
      className={className}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 0.75,
        borderRadius: 3, // rounded-2xl
        position: position === 'floating' ? 'static' : 'absolute',
        ...positionStyles[position],
        bgcolor: 'background.paper', // Glass effect from theme
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        ...sx,
      }}
    >
      {children}
    </MotionPaper>
  );
}
