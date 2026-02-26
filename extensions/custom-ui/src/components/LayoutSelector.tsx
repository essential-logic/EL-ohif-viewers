import React, { useState } from 'react';
import {
  GridView as GridViewIcon,
  ViewModule as ViewModuleIcon,
  TableRows as RowsIcon,
} from '@mui/icons-material';
import { Box, Typography, ButtonBase, Popover, Tabs, Tab } from '@mui/material';

interface LayoutOption {
  id: string;
  label: string;
  rows: number;
  cols: number;
  icon?: React.ReactNode;
}

const commonLayouts: LayoutOption[] = [
  { id: '1x1', label: '1×1', rows: 1, cols: 1 },
  { id: '1x2', label: '1×2', rows: 1, cols: 2 },
  { id: '2x1', label: '2×1', rows: 2, cols: 1 },
  { id: '2x2', label: '2×2', rows: 2, cols: 2 },
];

const advancedLayouts: LayoutOption[] = [
  { id: 'mpr', label: 'MPR', rows: 1, cols: 3, icon: <ViewModuleIcon /> },
  { id: '3d_four_up', label: '3D four up', rows: 2, cols: 2, icon: <GridViewIcon /> },
  { id: '3d_main', label: '3D main', rows: 1, cols: 2, icon: <ViewModuleIcon /> },
  { id: 'axial_primary', label: 'Axial Primary', rows: 1, cols: 2, icon: <RowsIcon /> },
];

interface LayoutSelectorProps {
  currentLayout?: string;
  onLayoutChange?: (layoutId: string, rows: number, cols: number) => void;
  trigger?: React.ReactNode;
}

export function LayoutSelector({
  currentLayout = '1x1',
  onLayoutChange,
  trigger,
}: LayoutSelectorProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedLayout, setSelectedLayout] = useState(currentLayout);
  const [tab, setTab] = useState(0);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLayoutSelect = (layout: LayoutOption) => {
    setSelectedLayout(layout.id);
    onLayoutChange?.(layout.id, layout.rows, layout.cols);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const currentLayoutOption = [...commonLayouts, ...advancedLayouts].find(
    l => l.id === selectedLayout
  );

  const renderGridPreview = (rows: number, cols: number, isActive: boolean = false) => {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 0.5,
          width: '100%',
          aspectRatio: '1',
        }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => (
          <Box
            key={i}
            sx={{
              bgcolor: isActive ? 'primary.main' : 'rgba(255,255,255,0.05)',
              borderRadius: 0.5,
              border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </Box>
    );
  };

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{ cursor: 'pointer', display: 'inline-flex' }}
      >
        {trigger ? (
          trigger
        ) : (
          <ButtonBase
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: 1.5,
              border: '1px solid rgba(255,255,255,0.1)',
              bgcolor: 'rgba(255,255,255,0.02)',
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.05)',
                color: 'text.primary',
                borderColor: 'primary.main',
              },
            }}
          >
            <GridViewIcon sx={{ fontSize: 18 }} />
            <Typography
              variant="caption"
              fontWeight={700}
            >
              {currentLayoutOption?.label || currentLayout}
            </Typography>
          </ButtonBase>
        )}
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{
          '& .MuiPopover-paper': {
            mt: 1,
            bgcolor: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
            width: 320,
            overflow: 'hidden',
          },
        }}
      >
        <Box>
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              sx={{
                minHeight: 40,
                '& .MuiTab-root': {
                  minHeight: 40,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                },
              }}
            >
              <Tab label="Common" />
              <Tab label="Advanced" />
            </Tabs>
          </Box>

          <Box sx={{ p: 2 }}>
            {tab === 0 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                {commonLayouts.map(layout => (
                  <ButtonBase
                    key={layout.id}
                    onClick={() => handleLayoutSelect(layout)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor:
                        selectedLayout === layout.id ? 'primary.main' : 'rgba(255,255,255,0.05)',
                      bgcolor:
                        selectedLayout === layout.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Box sx={{ width: 40, height: 40 }}>
                      {renderGridPreview(layout.rows, layout.cols, selectedLayout === layout.id)}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: '0.65rem' }}
                    >
                      {layout.label}
                    </Typography>
                  </ButtonBase>
                ))}
              </Box>
            )}

            {tab === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {advancedLayouts.map(layout => (
                  <ButtonBase
                    key={layout.id}
                    onClick={() => handleLayoutSelect(layout)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: 2,
                      p: 1.5,
                      borderRadius: 1.5,
                      width: '100%',
                      bgcolor:
                        selectedLayout === layout.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      border: '1px solid',
                      borderColor: selectedLayout === layout.id ? 'primary.main' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                    }}
                  >
                    <Box
                      sx={{
                        color: selectedLayout === layout.id ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {layout.icon}
                    </Box>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                    >
                      {layout.label}
                    </Typography>
                  </ButtonBase>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Popover>
    </>
  );
}
