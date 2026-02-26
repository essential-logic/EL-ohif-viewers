import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

interface PanelProps {
  children: ReactNode;
  className?: string;
  sx?: SxProps<Theme>;
}

export function Panel({ children, className, sx }: PanelProps) {
  return (
    <Box
      className={className}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
