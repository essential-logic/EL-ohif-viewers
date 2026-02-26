import { Paper, type PaperProps } from '@mui/material';
import { motion, type HTMLMotionProps } from 'motion/react';
import { styled } from '@mui/material/styles';

// Create a Motion component from MUI Paper
const MotionPaper = motion(Paper);

interface GlassPanelProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  className?: string; // Explicitly allow string
  sx?: any;
}

export function GlassPanel({ children, className = "", sx, ...props }: GlassPanelProps) {
  return (
    <MotionPaper
      className={className}
      elevation={0} // Elevation handled by custom glass style in theme
      {...props}
      sx={{
        borderRadius: 4, // 16px (rounded-2xl)
        p: 2, // 16px (p-4)
        display: 'flex',
        flexDirection: 'column',
        gap: 2, // 16px (gap-4)
        height: '100%',
        overflow: 'hidden',
        bgcolor: 'background.paper', // Uses the glass color defined in theme
        ...sx
      }}
    >
      {children}
    </MotionPaper>
  );
}
