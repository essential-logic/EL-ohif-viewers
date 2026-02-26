
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  Tabs, 
  Tab, 
  Box, 
  Typography, 
  Button, 
  Select, 
  MenuItem, 
  TextField, 
  IconButton, 
  Grid
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { GlassPanel } from './ui/glass-panel';

interface UserPreferencesModalProps {
  open: boolean;
  onClose: () => void;
}

const HOTKEYS = [
  { label: 'Zoom', key: 'Z', category: 'col1' },
  { label: 'Zoom In', key: '+', category: 'col2' },
  { label: 'Zoom Out', key: '-', category: 'col3' },
  { label: 'Zoom to Fit', key: '=', category: 'col1' },
  { label: 'Rotate Right', key: 'R', category: 'col2' },
  { label: 'Rotate Left', key: 'L', category: 'col3' },
  { label: 'Flip Horizontally', key: 'H', category: 'col1' },
  { label: 'Flip Vertically', key: 'V', category: 'col2' },
  { label: 'Cine', key: 'C', category: 'col3' },
  { label: 'Invert', key: 'I', category: 'col1' },
  { label: 'Next Image Viewport', key: 'Right Arrow', category: 'col2' },
  { label: 'Previous Image Viewport', key: 'Left Arrow', category: 'col3' },
  { label: 'Previous Series', key: 'Page Up', category: 'col1' },
  { label: 'Next Series', key: 'Page Down', category: 'col2' },
  { label: 'Next Stage', key: '.', category: 'col3' },
  { label: 'Previous Stage', key: ',', category: 'col1' },
  { label: 'Next Image', key: 'Down Arrow', category: 'col2' },
  { label: 'Previous Image', key: 'Up Arrow', category: 'col3' },
  { label: 'First Image', key: 'Home', category: 'col1' },
  { label: 'Last Image', key: 'End', category: 'col2' },
  { label: 'Reset', key: 'Space', category: 'col3' },
  { label: 'Cancel Measurement', key: 'Esc', category: 'col1' },
  { label: 'W/L Preset 1', key: '1', category: 'col2' },
  { label: 'W/L Preset 2', key: '2', category: 'col3' },
  { label: 'W/L Preset 3', key: '3', category: 'col1' },
  { label: 'W/L Preset 4', key: '4', category: 'col2' },
  { label: 'Delete Annotation', key: 'Backspace', category: 'col3' },
  { label: 'Accept Preview', key: 'Enter', category: 'col1' },
  { label: 'Reject Preview', key: 'Esc', category: 'col2' },
  { label: 'Undo', key: 'Ctrl+Z', category: 'col3' },
  { label: 'Redo', key: 'Ctrl+Y', category: 'col1' },
  { label: 'Interpolate Scroll', key: 'N', category: 'col2' },
  { label: 'Increase Brush Size', key: ']', category: 'col3' },
  { label: 'Decrease Brush Size', key: '[', category: 'col1' },
  { label: 'Eraser', key: 'E', category: 'col2' },
  { label: 'Brush', key: 'B', category: 'col3' },
];

export function UserPreferencesModal({ open, onClose }: UserPreferencesModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [language, setLanguage] = useState('en-US');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          backgroundImage: 'none',
        }
      }}
    >
      <GlassPanel sx={{ p: 0, overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="h6" fontWeight={600}>User Preferences</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'white' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ borderBottom: '1px solid rgba(59, 130, 246, 0.5)' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            textColor="primary"
            indicatorColor="primary"
            sx={{ px: 2, minHeight: 48 }}
          >
            <Tab label="General" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.9rem', minHeight: 48 }} />
            <Tab label="Hotkeys" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.9rem', minHeight: 48 }} />
          </Tabs>
        </Box>

        <DialogContent sx={{ p: 3, minHeight: 400, bgcolor: 'rgba(0,0,0,0.2)' }}>
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ width: 120, color: 'text.secondary' }}>Language</Typography>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  size="small"
                  sx={{ 
                    flex: 1, 
                    color: 'white',
                    '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                  }}
                >
                  <MenuItem value="en-US">English (US)</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </Select>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ width: 120, color: 'text.secondary' }}>Data Source</Typography>
                <Select
                  value="aws"
                  disabled
                  size="small"
                  sx={{ 
                    flex: 1, 
                    color: 'white',
                    '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&.Mui-disabled': { color: 'rgba(255, 255, 255, 0.7)', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.1)' } }
                  }}
                >
                  <MenuItem value="aws">AWS S3 Static wado server</MenuItem>
                </Select>
              </Box>
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ overflowY: 'auto', maxHeight: '50vh', pr: 1 }}>
               <Grid container spacing={3}>
                  <Grid size={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                       {HOTKEYS.filter(h => h.category === 'col1').map((hotkey, i) => (
                          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <Typography variant="caption" sx={{ color: 'text.secondary' }}>{hotkey.label}</Typography>
                             <Box sx={{ 
                               border: '1px solid rgba(255,255,255,0.1)', 
                               bgcolor: 'rgba(0,0,0,0.3)', 
                               borderRadius: 1, 
                               px: 1.5, 
                               py: 0.5, 
                               minWidth: 60, 
                               textAlign: 'center',
                               fontSize: '0.8rem',
                               fontFamily: 'monospace'
                             }}>
                                {hotkey.key}
                             </Box>
                          </Box>
                       ))}
                    </Box>
                  </Grid>
                  <Grid size={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                       {HOTKEYS.filter(h => h.category === 'col2').map((hotkey, i) => (
                          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <Typography variant="caption" sx={{ color: 'text.secondary' }}>{hotkey.label}</Typography>
                             <Box sx={{ 
                               border: '1px solid rgba(255,255,255,0.1)', 
                               bgcolor: 'rgba(0,0,0,0.3)', 
                               borderRadius: 1, 
                               px: 1.5, 
                               py: 0.5, 
                               minWidth: 60, 
                               textAlign: 'center',
                               fontSize: '0.8rem',
                               fontFamily: 'monospace'
                             }}>
                                {hotkey.key}
                             </Box>
                          </Box>
                       ))}
                    </Box>
                  </Grid>
                  <Grid size={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                       {HOTKEYS.filter(h => h.category === 'col3').map((hotkey, i) => (
                          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <Typography variant="caption" sx={{ color: 'text.secondary' }}>{hotkey.label}</Typography>
                             <Box sx={{ 
                               border: '1px solid rgba(255,255,255,0.1)', 
                               bgcolor: 'rgba(0,0,0,0.3)', 
                               borderRadius: 1, 
                               px: 1.5, 
                               py: 0.5, 
                               minWidth: 60, 
                               textAlign: 'center',
                               fontSize: '0.8rem',
                               fontFamily: 'monospace'
                             }}>
                                {hotkey.key}
                             </Box>
                          </Box>
                       ))}
                    </Box>
                  </Grid>
               </Grid>
            </Box>
          )}
        </DialogContent>
        
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
           <Button sx={{ color: 'primary.main', textTransform: 'none' }}>
              Reset to Defaults
           </Button>
           <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={onClose} sx={{ color: 'text.secondary', textTransform: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                 Cancel
              </Button>
              <Button onClick={onClose} variant="contained" sx={{ bgcolor: 'primary.main', textTransform: 'none', '&:hover': { bgcolor: 'primary.dark' } }}>
                 Save
              </Button>
           </Box>
        </Box>
      </GlassPanel>
    </Dialog>
  );
}
