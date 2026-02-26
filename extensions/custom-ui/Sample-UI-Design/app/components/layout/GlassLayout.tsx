import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Box, useTheme } from "@mui/material";

interface GlassLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
  rightPanel?: ReactNode;
  sidebarWidth?: number;
  className?: string;
}

export function GlassLayout({
  children,
  header,
  sidebar,
  rightPanel,
  sidebarWidth = 240, // Default to standard width
  className = "",
}: GlassLayoutProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: '100vh', // Fixed height for full viewport
        width: '100%',
        bgcolor: 'background.default',
        color: 'text.primary',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column', // Stack header and content
        position: 'relative',
      }}
      className={className}
    >
      {/* Animated Deep Space Background */}
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <Box 
          sx={{ 
            position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '50%',
            bgcolor: 'primary.main', opacity: 0.2, borderRadius: '50%', filter: 'blur(120px)',
            animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }} 
        />
        <Box 
          sx={{ 
            position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%',
            bgcolor: 'secondary.main', opacity: 0.2, borderRadius: '50%', filter: 'blur(120px)',
            animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '2s'
          }} 
        />
        <Box 
          sx={{ 
            position: 'absolute', top: '30%', left: '40%', width: '30%', height: '30%',
            bgcolor: 'info.main', opacity: 0.1, borderRadius: '50%', filter: 'blur(100px)',
            animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '4s'
          }} 
        />
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 0.2; transform: scale(1); }
              50% { opacity: 0.15; transform: scale(1.05); }
            }
          `}
        </style>
      </Box>

      {/* Header Area */}
      {header && (
        <Box component="header" sx={{ position: 'relative', zIndex: 20, width: '100%', flexShrink: 0 }}>
          {header}
        </Box>
      )}

      {/* Main Content Area */}
      <Box sx={{ position: 'relative', zIndex: 10, display: 'flex', width: '100%', flex: 1, minHeight: 0, p: 2, gap: 2 }}>
        {/* Left Sidebar */}
        {sidebar && (
          <motion.aside
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{ width: sidebarWidth, flexShrink: 0, display: 'flex', flexDirection: 'column' }}
          >
            {sidebar}
          </motion.aside>
        )}

        {/* Center Content */}
        <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
          {children}
        </Box>

        {/* Right Panel */}
        {rightPanel && (
          <motion.aside
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column' }}
          >
            {rightPanel}
          </motion.aside>
        )}
      </Box>
    </Box>
  );
}
