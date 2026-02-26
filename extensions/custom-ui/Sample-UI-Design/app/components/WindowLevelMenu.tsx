import { useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Switch, 
  Divider,
  IconButton
} from '@mui/material';
import { 
  ArrowBack as BackIcon,
  ChevronRight as ChevronRightIcon,
  Contrast as ContrastIcon,
  InvertColors as LutIcon
} from '@mui/icons-material';

interface WindowLevelMenuProps {
  onBack: () => void;
  onSelectPreset: (preset: string) => void;
  onSelectLut: (lut: string) => void;
  currentPreset?: string;
  currentLut?: string;
}

const presets = [
  { id: 'soft_tissue', label: 'Soft tissue', value: '400 / 40' },
  { id: 'lung', label: 'Lung', value: '1500 / -600' },
  { id: 'liver', label: 'Liver', value: '150 / 90' },
  { id: 'bone', label: 'Bone', value: '2500 / 480' },
  { id: 'brain', label: 'Brain', value: '80 / 40' },
];

const luts = [
  'Grayscale', 'X Ray', 'Isodose', 'HSV', 'Hot Iron', 'Red Hot', 'PET', 'Perfusion', 'Rainbow 2'
];

export function WindowLevelMenu({ 
  onBack, 
  onSelectPreset,
  onSelectLut,
  currentPreset,
  currentLut
}: WindowLevelMenuProps) {
  const [view, setView] = useState<'main' | 'presets' | 'luts'>('main');

  const renderHeader = (title: string, showBack = true) => (
    <Box sx={{ display: 'flex', alignItems: 'center', p: 1, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
       {showBack && (
         <IconButton size="small" onClick={() => setView('main')} sx={{ color: 'text.secondary', mr: 1 }}>
            <BackIcon fontSize="small" />
         </IconButton>
       )}
       <Typography variant="subtitle2" fontWeight={600}>{title}</Typography>
    </Box>
  );

  if (view === 'presets') {
    return (
      <Box sx={{ width: 280 }}>
        {renderHeader('Modality Window Presets')}
        <List dense>
            <ListItem sx={{ py: 0 }}>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', py: 1 }}>
                  <Typography variant="body2" color="text.secondary">Preview in viewport</Typography>
                  <Switch size="small" defaultChecked />
               </Box>
            </ListItem>
            <Divider sx={{ my: 0.5 }} />
            {presets.map((preset) => (
                <ListItemButton 
                    key={preset.id} 
                    onClick={() => onSelectPreset(preset.id)}
                    selected={currentPreset === preset.id}
                    sx={{ borderRadius: 1, my: 0.25 }}
                >
                    <ListItemText primary={preset.label} />
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                        {preset.value}
                    </Typography>
                </ListItemButton>
            ))}
        </List>
      </Box>
    );
  }

  if (view === 'luts') {
    return (
      <Box sx={{ width: 280 }}>
        {renderHeader('Color LUT')}
        <List dense>
            <ListItem sx={{ py: 0 }}>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', py: 1 }}>
                  <Typography variant="body2" color="text.secondary">Preview in viewport</Typography>
                  <Switch size="small" defaultChecked />
               </Box>
            </ListItem>
            <Divider sx={{ my: 0.5 }} />
            {luts.map((lut) => (
                <ListItemButton 
                    key={lut} 
                    onClick={() => onSelectLut(lut)}
                    selected={currentLut === lut}
                    sx={{ borderRadius: 1, my: 0.25 }}
                >
                    <ListItemText primary={lut} />
                </ListItemButton>
            ))}
        </List>
      </Box>
    );
  }

  return (
    <Box sx={{ width: 280 }}>
       <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
             <Typography variant="body2">Display Color bar</Typography>
             <Switch size="small" />
          </Box>
          
          <List disablePadding>
             <ListItemButton 
                onClick={() => setView('luts')}
                sx={{ 
                    bgcolor: 'rgba(255,255,255,0.05)', 
                    borderRadius: 1, 
                    mb: 1,
                    border: '1px solid rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
             >
                <LutIcon sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                <ListItemText primary="Color LUT" />
                <ChevronRightIcon sx={{ color: 'text.secondary' }} />
             </ListItemButton>

             <ListItemButton 
                onClick={() => setView('presets')}
                sx={{ 
                    bgcolor: 'rgba(255,255,255,0.05)', 
                    borderRadius: 1, 
                    border: '1px solid rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
             >
                <ContrastIcon sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                <ListItemText primary="Modality Window Presets" />
                <ChevronRightIcon sx={{ color: 'text.secondary' }} />
             </ListItemButton>
          </List>
       </Box>
    </Box>
  );
}
