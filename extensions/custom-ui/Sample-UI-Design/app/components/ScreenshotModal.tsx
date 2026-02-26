import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Box,
  Typography,
  IconButton,
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
  defaultFilename = 'image',
}: ScreenshotModalProps) {
  const [filename, setFilename] = useState(defaultFilename);
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
      includeWarning,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{ zIndex: 9999 }}
      PaperProps={{
        sx: {
          bgcolor: '#0a1929', // Dark blue background match
          color: 'white',
          backgroundImage: 'none',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          width: 650,
          maxWidth: '90vw',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={600}
        >
          Download High Quality Image
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, display: 'flex', height: 400, overflow: 'hidden' }}>
        {/* Preview Area */}
        <Box
          sx={{
            flex: 1,
            bgcolor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box
            sx={{
              width: '80%',
              height: '80%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <ImageIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography
              variant="caption"
              color="text.disabled"
            >
              Preview will appear here
            </Typography>
          </Box>

          {/* Mock Warning Overlay */}
          {includeWarning && (
            <Box sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center' }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: 'white', textShadow: '0 1px 2px black' }}
              >
                Not For Diagnostic Use
              </Typography>
            </Box>
          )}
        </Box>

        {/* Settings Area */}
        <Box
          sx={{
            width: 300,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            bgcolor: '#0f2238',
            overflow: 'hidden',
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5, display: 'block' }}
            >
              File name
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                fullWidth
                value={filename}
                onChange={e => setFilename(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    fieldset: { borderColor: 'rgba(255,255,255,0.2)' },
                    height: 32,
                  },
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 1.5,
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: 13,
                  height: 32,
                }}
              >
                JPG
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5, display: 'block' }}
            >
              Image size in pixels
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.25, display: 'block' }}
                >
                  Width
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={width}
                  onChange={e => setWidth(Number(e.target.value))}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.05)',
                      fieldset: { borderColor: 'rgba(255,255,255,0.2)' },
                      height: 32,
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.25, display: 'block' }}
                >
                  Height
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={height}
                  onChange={e => setHeight(Number(e.target.value))}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.05)',
                      fieldset: { borderColor: 'rgba(255,255,255,0.2)' },
                      height: 32,
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={includeAnnotations}
                  onChange={e => setIncludeAnnotations(e.target.checked)}
                />
              }
              label={
                <Typography
                  variant="body2"
                  color="white"
                  sx={{ fontSize: '0.8rem' }}
                >
                  Include annotations
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={includeWarning}
                  onChange={e => setIncludeWarning(e.target.checked)}
                />
              }
              label={
                <Typography
                  variant="body2"
                  color="white"
                  sx={{ fontSize: '0.8rem' }}
                >
                  Include warning message
                </Typography>
              }
            />
          </Box>

          <Box sx={{ mt: 'auto', display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              onClick={onClose}
              variant="text"
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {}}
            >
              Print
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              color="primary"
              size="small"
            >
              Save
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
