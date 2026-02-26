import { useState } from 'react';
import { 
  GridView as GridViewIcon,
  ViewModule as ViewModuleIcon,
  GridOn as GridOnIcon,
  TableRows as RowsIcon
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
  trigger
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
  const currentLayoutOption = [...commonLayouts, ...advancedLayouts].find(l => l.id === selectedLayout);

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
              bgcolor: isActive ? 'primary.main' : 'action.disabledBackground',
              borderRadius: 0.5,
              border: isActive ? 'none' : '1px solid',
              borderColor: 'divider'
            }}
          />
        ))}
      </Box>
    );
  };

  return (
    <>
      <Box onClick={handleClick} sx={{ cursor: 'pointer', display: 'inline-flex' }}>
         {trigger ? trigger : (
            <ButtonBase
                sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                color: 'text.secondary',
                '&:hover': {
                    bgcolor: 'action.hover',
                    color: 'text.primary',
                    borderColor: 'text.secondary'
                },
                }}
            >
                <GridViewIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" fontWeight={600}>
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
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              boxShadow: 6,
              width: 320,
              overflow: 'hidden'
            }
          }
        }}
      >
        <Box>
           <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
                value={tab} 
                onChange={(_, v) => setTab(v)} 
                variant="fullWidth" 
                sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, fontSize: '0.75rem', textTransform: 'none' } }}
            >
                <Tab label="Common" />
                <Tab label="Advanced" />
                <Tab label="Custom" />
            </Tabs>
           </Box>

           <Box sx={{ p: 2 }}>
                {tab === 0 && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                        {commonLayouts.map((layout) => (
                             <ButtonBase
                                key={layout.id}
                                onClick={() => handleLayoutSelect(layout)}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 1,
                                    p: 1,
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: selectedLayout === layout.id ? 'primary.main' : 'divider',
                                    bgcolor: selectedLayout === layout.id ? 'action.selected' : 'transparent',
                                    '&:hover': { bgcolor: 'action.hover', borderColor: 'text.secondary' }
                                }}
                             >
                                <Box sx={{ width: 32, height: 32 }}>{renderGridPreview(layout.rows, layout.cols, selectedLayout === layout.id)}</Box>
                             </ButtonBase>
                        ))}
                    </Box>
                )}

                {tab === 1 && (
                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {advancedLayouts.map((layout) => (
                             <ButtonBase
                                key={layout.id}
                                onClick={() => handleLayoutSelect(layout)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    gap: 2,
                                    p: 1,
                                    borderRadius: 1,
                                    width: '100%',
                                    bgcolor: selectedLayout === layout.id ? 'action.selected' : 'transparent',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                             >
                                <Box sx={{ color: 'text.secondary' }}>{layout.icon}</Box>
                                <Typography variant="caption" fontWeight={500}>{layout.label}</Typography>
                             </ButtonBase>
                        ))}
                     </Box>
                )}
                
                {tab === 2 && (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                         <Typography variant="caption" color="text.secondary">
                            Hover to select rows and columns
                         </Typography>
                         <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5, maxWidth: 160, mx: 'auto' }}>
                             {Array.from({ length: 16 }).map((_, i) => (
                                 <Box 
                                    key={i} 
                                    sx={{ 
                                        width: 32, 
                                        height: 32, 
                                        bgcolor: 'rgba(255,255,255,0.1)', 
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        '&:hover': { bgcolor: 'primary.main', borderColor: 'primary.main' },
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleLayoutSelect({ id: 'custom', label: 'Custom', rows: Math.floor(i/4)+1, cols: (i%4)+1 })}
                                 />
                             ))}
                         </Box>
                    </Box>
                )}
           </Box>
        </Box>
      </Popover>
    </>
  );
}
