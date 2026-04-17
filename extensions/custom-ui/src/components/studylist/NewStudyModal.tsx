import React, { useState, memo, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Box,
  Typography,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';

interface NewStudyModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    patientName: string;
    studyDescription: string;
    studyDate: string;
    files: File[];
  }) => void;
  isUploading: boolean;
}

const PlusIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
  </svg>
);

export const NewStudyModal = memo(function NewStudyModal({
  open,
  onClose,
  onSubmit,
  isUploading,
}: NewStudyModalProps) {
  const [formData, setFormData] = useState({
    patientName: '',
    studyDescription: '',
    studyDate: new Date().toISOString().split('T')[0],
  });
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      return;
    }
    onSubmit({ ...formData, files });
  };

  const handleClose = () => {
    if (isUploading) {
      return;
    }
    setFormData({
      patientName: '',
      studyDescription: '',
      studyDate: new Date().toISOString().split('T')[0],
    });
    setFiles([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={isUploading ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
      disableRestoreFocus
      PaperProps={{
        sx: {
          bgcolor: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 4,
          backgroundImage: 'none',
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ color: 'text.primary', fontWeight: 800, pb: 1 }}>
          Upload Your DICOM Study
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Upload your own DICOM files to view and annotate them locally. Your files stay in your
            browser session.
          </Typography>
          <Stack
            spacing={3}
            sx={{ mt: 1 }}
          >
            <TextField
              label="Patient Name (optional)"
              fullWidth
              value={formData.patientName}
              onChange={e => setFormData({ ...formData, patientName: e.target.value })}
              variant="outlined"
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Study Description (optional)"
              fullWidth
              value={formData.studyDescription}
              onChange={e => setFormData({ ...formData, studyDescription: e.target.value })}
              variant="outlined"
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            {/* Drop Zone */}
            <Box
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: '2px dashed rgba(59,130,246,0.3)',
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(59, 130, 246, 0.05)' },
              }}
            >
              <CloudUploadIcon
                sx={{
                  fontSize: 40,
                  mb: 1,
                  color: files.length > 0 ? 'primary.main' : 'text.disabled',
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                {files.length > 0
                  ? `${files.length} file${files.length > 1 ? 's' : ''} selected`
                  : 'Drag & drop DICOM files here, or click to browse'}
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
              >
                Supports .dcm and DICOM format files
              </Typography>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".dcm,application/dicom"
              />
            </Box>

            {/* File List Preview */}
            {files.length > 0 && (
              <Box sx={{ maxHeight: 120, overflowY: 'auto' }}>
                <Stack spacing={0.5}>
                  {files.map((file, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 0.75,
                        borderRadius: 1,
                        bgcolor: 'rgba(59,130,246,0.06)',
                        border: '1px solid rgba(59,130,246,0.12)',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#93c5fd',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                          mr: 1,
                        }}
                      >
                        {file.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ flexShrink: 0, mr: 0.5 }}
                      >
                        {(file.size / 1024).toFixed(0)} KB
                      </Typography>
                      <CloseIcon
                        sx={{
                          fontSize: 14,
                          color: 'text.disabled',
                          cursor: 'pointer',
                          flexShrink: 0,
                          '&:hover': { color: 'error.main' },
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          handleRemoveFile(i);
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleClose}
            disabled={isUploading}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isUploading || files.length === 0}
            startIcon={isUploading ? null : <PlusIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(to right, #3b82f6, #2563eb)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}
          >
            {isUploading ? 'Processing...' : 'Open in Viewer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});
