import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Switch, 
  FormControlLabel, 
  Button, 
  Box, 
  Typography,
  IconButton
} from '@mui/material';
import { Close as CloseIcon, Image as ImageIcon } from '@mui/icons-material';

interface ScreenshotModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (settings: { 
    filename: string; 
    width: number; 
    height: number; 
    includeAnnotations: boolean;
    includeWarning: boolean; 
  }) => void;
  defaultFilename?: string;
}

export function ScreenshotModal({ 
  open, 
  onClose, 
  onSave, 
  defaultFilename = 'image' 
}: ScreenshotModalProps) {
  const [filename, setFilename] = useState(defaultFilename);
  const [fileType, setFileType] = useState('JPG');
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [includeAnnotations, setIncludeAnnotations] = useState(true);
  const [includeWarning, setIncludeWarning] = useState(true);

  const handleSave = () => {
    onSave({
      filename,
      width,
      height,
      includeAnnotations,
      includeWarning
    });
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: '#0a1929', // Dark blue background match
          color: 'white',
          backgroundImage: 'none',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          minWidth: 700,
          maxWidth: '90vw'
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Download High Quality Image
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, display: 'flex', height: 450 }}>
        {/* Preview Area */}
        <Box sx={{ flex: 1, bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Box sx={{ width: '80%', height: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
                 <ImageIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                 <Typography variant="caption" color="text.disabled">Preview will appear here</Typography>
            </Box>
            
            {/* Mock Warning Overlay */}
            {includeWarning && (
                <Box sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center' }}>
                     <Typography variant="caption" sx={{ fontWeight: 600, color: 'white', textShadow: '0 1px 2px black' }}>
                         Not For Diagnostic Use
                     </Typography>
                </Box>
            )}
        </Box>

        {/* Settings Area */}
        <Box sx={{ width: 300, p: 3, display: 'flex', flexDirection: 'column', gap: 3, bgcolor: '#0f2238' }}>
            
            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>File name</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField 
                        size="small" 
                        fullWidth 
                        value={filename} 
                        onChange={(e) => setFilename(e.target.value)}
                        sx={{ 
                            '& .MuiOutlinedInput-root': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)', fieldset: { borderColor: 'rgba(255,255,255,0.2)' } } 
                        }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 1, bgcolor: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 13 }}>
                        JPG
                    </Box>
                </Box>
            </Box>

            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Image size in pixels</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Width</Typography>
                        <TextField 
                            size="small" 
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(Number(e.target.value))}
                            sx={{ '& .MuiOutlinedInput-root': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)', fieldset: { borderColor: 'rgba(255,255,255,0.2)' } } }}
                        />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>Width</Typography>
                     <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Height</Typography>
                        <TextField 
                            size="small" 
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(Number(e.target.value))}
                            sx={{ '& .MuiOutlinedInput-root': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)', fieldset: { borderColor: 'rgba(255,255,255,0.2)' } } }}
                        />
                    </Box>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel 
                    control={<Switch size="small" checked={includeAnnotations} onChange={(e) => setIncludeAnnotations(e.target.checked)} />} 
                    label={<Typography variant="body2" color="white">Include annotations</Typography>} 
                />
                <FormControlLabel 
                    control={<Switch size="small" checked={includeWarning} onChange={(e) => setIncludeWarning(e.target.checked)} />} 
                    label={<Typography variant="body2" color="white">Include warning message</Typography>} 
                />
            </Box>

            <Box sx={{ mt: 'auto', display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button onClick={onClose} variant="text" sx={{ color: 'text.secondary' }}>
                    Cancel
                </Button>
                <Button variant="contained" color="primary" onClick={() => {}}>
                    Print
                </Button>
                 <Button onClick={handleSave} variant="contained" color="primary">
                    Save
                </Button>
            </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
