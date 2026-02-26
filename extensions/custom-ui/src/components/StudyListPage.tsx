import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  Person as UserIcon,
  Description as FileTextIcon,
  Visibility as EyeIcon,
  Download as DownloadIcon,
  ChevronRight as ChevronRightIcon,
  MonitorHeart as ActivityIcon,
  Add as PlusIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  EventNote as ScheduleIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { loadDICOMFiles } from '../utils/dicomLoader';
import {
  Box,
  Typography,
  ButtonBase,
  LinearProgress,
  Card,
  CardActionArea,
  Chip,
  IconButton,
  ThemeProvider,
  CssBaseline,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import { theme } from '../Theme';

// ── Mobile Bottom Nav ──────────────────────────────────────────────────────

function BottomNav({
  activeNav,
  onNavChange,
}: {
  activeNav: string;
  onNavChange: (id: string) => void;
}) {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: <ActivityIcon sx={{ fontSize: 20 }} /> },
    { id: 'search', label: 'Search', icon: <SearchIcon sx={{ fontSize: 20 }} /> },
    { id: 'calendar', label: 'Schedule', icon: <ScheduleIcon sx={{ fontSize: 20 }} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon sx={{ fontSize: 20 }} /> },
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        bgcolor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        px: 2,
        zIndex: 1100,
      }}
    >
      {navItems.map(item => {
        const isActive = activeNav === item.id;
        return (
          <ButtonBase
            key={item.id}
            onClick={() => onNavChange(item.id)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
              color: isActive ? '#3b82f6' : 'text.secondary',
              transition: 'all 0.2s ease',
            }}
          >
            {item.icon}
            <Typography
              variant="caption"
              sx={{ fontSize: '0.65rem', fontWeight: isActive ? 600 : 400 }}
            >
              {item.label}
            </Typography>
            {isActive && (
              <motion.div
                layoutId="activeTabMobile"
                style={{
                  position: 'absolute',
                  top: -12,
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: '#3b82f6',
                  boxShadow: '0 0 8px #3b82f6',
                }}
              />
            )}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────

function Sidebar({ onSettingsOpen }: { onSettingsOpen?: () => void }) {
  const [activeNav, setActiveNav] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <ActivityIcon sx={{ fontSize: 20 }} /> },
    { id: 'schedule', label: 'Schedule', icon: <ScheduleIcon sx={{ fontSize: 20 }} /> },
    { id: 'patients', label: 'Patients', icon: <UserIcon sx={{ fontSize: 20 }} /> },
  ];

  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 3,
        p: 2,
      }}
    >
      {/* Branding */}
      <Box sx={{ mb: 4, width: 'fit-content' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Box
            sx={{
              p: 0.75,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
            }}
          >
            <img
              src="/essential-logic-logo.png"
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={e => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                background: 'linear-gradient(to right, #3b82f6, #93c5fd, #22d3ee)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                lineHeight: 1.1,
                fontSize: '1.250rem',
                letterSpacing: 0.2,
              }}
            >
              DICOM Pro
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: 800,
                display: 'block',
                lineHeight: 1.2,
              }}
            >
              by Essential Logic
            </Typography>
          </Box>
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.5rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            display: 'block',
            mt: 0.6,
            textAlign: 'justify',
            textAlignLast: 'justify',
            width: '100%',
            lineHeight: 1,
            letterSpacing: 4,
          }}
        >
          POWERED BY OHIF VIEWER
        </Typography>
      </Box>

      {/* Navigation */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {navItems.map(item => {
          const isActive = activeNav === item.id;
          return (
            <ButtonBase
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              sx={{
                justifyContent: 'flex-start',
                px: 1.5,
                py: 1,
                borderRadius: 2,
                width: '100%',
                bgcolor: isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                color: isActive ? 'primary.main' : 'text.secondary',
                border: `1px solid ${isActive ? 'rgba(59, 130, 246, 0.25)' : 'transparent'}`,
                '&:hover': {
                  bgcolor: isActive ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255,255,255,0.05)',
                  color: isActive ? 'primary.main' : 'text.primary',
                },
                transition: 'all 0.15s',
              }}
            >
              {item.icon}
              <Typography
                variant="body2"
                fontWeight={500}
                sx={{ ml: 1.5 }}
              >
                {item.label}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>

      {/* Bottom: Settings + Storage */}
      <Box sx={{ mt: 'auto', width: '100%' }}>
        <ButtonBase
          onClick={onSettingsOpen}
          sx={{
            justifyContent: 'flex-start',
            px: 1.5,
            py: 1,
            mb: 2,
            borderRadius: 2,
            color: 'text.secondary',
            border: '1px solid transparent',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: 'text.primary' },
            width: '100%',
          }}
        >
          <SettingsIcon sx={{ fontSize: 20 }} />
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{ ml: 1.5 }}
          >
            Settings
          </Typography>
        </ButtonBase>

        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.06))',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: 'rgba(167,139,250,0.9)', mb: 0.5, display: 'block' }}
          >
            Storage Used
          </Typography>
          <LinearProgress
            variant="determinate"
            value={75}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'rgba(139,92,246,0.1)',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'secondary.main',
                borderRadius: 3,
                boxShadow: '0 0 10px rgba(139,92,246,0.5)',
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.65rem' }}
            >
              750 GB
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'secondary.main', fontSize: '0.65rem' }}
            >
              1 TB
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ── Study Card ─────────────────────────────────────────────────────────────

interface Study {
  studyDescription?: string;
  modalities?: string;
  patientName?: string;
  mrn?: string;
  date?: string;
  bodyPart?: string;
  seriesInStudyCount?: number;
  numInstances?: number;
  studyInstanceUid?: string;
  [key: string]: string | number | boolean | undefined;
}

interface FilterValues {
  patientName?: string;
  pageNumber?: number;
  [key: string]: string | number | boolean | undefined;
}

interface StudyCardProps {
  study: Study;
  index: number;
  onClick: () => void;
}

function StudyCard({ study, index, onClick, isMobile }: StudyCardProps & { isMobile: boolean }) {
  const status = 'Completed';
  const isCompleted = status === 'Completed';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) {
      return '—';
    }
    try {
      const d = dateStr.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
      return new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        sx={{
          bgcolor: 'rgba(30, 41, 59, 0.45)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 3,
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: 'rgba(30, 41, 59, 0.65)',
            border: '1px solid rgba(59,130,246,0.3)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          },
        }}
      >
        <CardActionArea
          onClick={onClick}
          sx={{ p: 1.5, '&:hover': { bgcolor: 'transparent' } }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 2,
            }}
          >
            {/* Left: Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Title row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: 2,
                    bgcolor: 'rgba(59,130,246,0.15)',
                    color: 'primary.main',
                    border: '1px solid rgba(59,130,246,0.4)',
                    display: 'flex',
                    flexShrink: 0,
                    boxShadow: '0 0 10px rgba(59,130,246,0.15)',
                  }}
                >
                  <FileTextIcon fontSize="small" />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant={isMobile ? 'body2' : 'subtitle1'}
                    fontWeight={600}
                    color="text.primary"
                    sx={{
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {study.patientName || 'Anonymous Patient'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: 'primary.main', fontWeight: 600 }}
                    >
                      {study.modalities || '—'}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      •
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {study.bodyPart || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Chip
                  label={status}
                  size="small"
                  sx={{
                    borderRadius: 999,
                    height: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    ml: 'auto',
                    bgcolor: isCompleted ? 'rgba(16,185,129,0.1)' : 'rgba(234,179,8,0.1)',
                    color: isCompleted ? '#10b981' : '#eab308',
                    border: `1px solid ${isCompleted ? 'rgba(16,185,129,0.3)' : 'rgba(234,179,8,0.3)'}`,
                    flexShrink: 0,
                  }}
                />
              </Box>

              {/* Info columns */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                  gap: isMobile ? 1.5 : 1,
                }}
              >
                {[
                  {
                    icon: <FileTextIcon sx={{ fontSize: 15, color: 'text.secondary' }} />,
                    label: 'Study',
                    value: study.studyDescription || 'Untitled Study',
                    mono: false,
                  },
                  {
                    icon: <FileTextIcon sx={{ fontSize: 15, color: 'text.secondary' }} />,
                    label: 'Patient ID',
                    value: study.mrn || '—',
                    mono: true,
                  },
                  {
                    icon: <CalendarIcon sx={{ fontSize: 15, color: 'text.secondary' }} />,
                    label: 'Date',
                    value: formatDate(study.date),
                    mono: false,
                  },
                  {
                    icon: <EyeIcon sx={{ fontSize: 15, color: 'text.secondary' }} />,
                    label: 'Images',
                    value: `${study.seriesInStudyCount ?? '?'}S / ${study.numInstances ?? '?'}I`,
                    mono: false,
                  },
                ].map(col => (
                  <Box
                    key={col.label}
                    sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}
                  >
                    <Box sx={{ mt: 0.25, flexShrink: 0 }}>{col.icon}</Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          color: 'text.secondary',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          fontSize: '0.62rem',
                        }}
                      >
                        {col.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: col.mono ? 'primary.main' : 'text.secondary',
                          fontFamily: col.mono ? 'monospace' : 'inherit',
                          fontSize: '0.75rem',
                        }}
                      >
                        {col.value}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Right: Action buttons */}
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <IconButton
                size="small"
                onClick={e => {
                  e.stopPropagation();
                  onClick();
                }}
                sx={{
                  bgcolor: 'rgba(59,130,246,0.12)',
                  color: 'primary.main',
                  border: '1px solid rgba(59,130,246,0.3)',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    boxShadow: '0 0 15px rgba(59,130,246,0.5)',
                  },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: 'text.primary' },
                }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </CardActionArea>
      </Card>
    </motion.div>
  );
}

// ── New Study Modal ─────────────────────────────────────────────────────────

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

function NewStudyModal({ open, onClose, onSubmit, isUploading }: NewStudyModalProps) {
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

  return (
    <Dialog
      open={open}
      onClose={isUploading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 4,
          backgroundImage: 'none',
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ color: 'text.primary', fontWeight: 800, pb: 1 }}>
          Create New Study
        </DialogTitle>
        <DialogContent>
          <Stack
            spacing={3}
            sx={{ mt: 1 }}
          >
            <TextField
              label="Patient Name"
              fullWidth
              required
              value={formData.patientName}
              onChange={e => setFormData({ ...formData, patientName: e.target.value })}
              variant="outlined"
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Study Description"
              fullWidth
              required
              value={formData.studyDescription}
              onChange={e => setFormData({ ...formData, studyDescription: e.target.value })}
              variant="outlined"
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Study Date"
              type="date"
              fullWidth
              required
              value={formData.studyDate}
              onChange={e => setFormData({ ...formData, studyDate: e.target.value })}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Box
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: '2px dashed rgba(255,255,255,0.1)',
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(59, 130, 246, 0.05)',
                },
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
              >
                {files.length > 0
                  ? `${files.length} files selected`
                  : 'Drag and drop DICOM files here or click to browse'}
              </Typography>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={onClose}
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
            {isUploading ? 'Processing...' : 'Start Study'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────

interface StudyListPageProps {
  studies: Study[];
  isLoadingData: boolean;
  filterValues: FilterValues;
  setFilterValues: (v: FilterValues) => void;
  onStudyClick: (study: Study) => void;
}

export function StudyListPage({
  studies,
  isLoadingData,
  filterValues,
  setFilterValues,
  onStudyClick,
}: StudyListPageProps) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const [localSearch, setLocalSearch] = useState(filterValues.patientName || '');
  const lastSentValue = useRef(filterValues.patientName || '');
  const [activeNav, setActiveNav] = useState('dashboard');

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isNewStudyModalOpen, setIsNewStudyModalOpen] = useState(false);

  const handleImportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      return;
    }

    setIsUploading(true);
    try {
      await loadDICOMFiles(files);
      const query = new URLSearchParams(window.location.search);
      query.set('datasources', 'dicomlocal');
      navigate(`?${query.toString()}`);
    } catch (err) {
      console.error('Failed to import studies:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleNewStudySubmit = async (data: {
    patientName: string;
    studyDescription: string;
    studyDate: string;
    files: File[];
  }) => {
    setIsUploading(true);
    try {
      await loadDICOMFiles(data.files, {
        patientName: data.patientName,
        studyDescription: data.studyDescription,
        studyDate: data.studyDate,
      });
      const query = new URLSearchParams(window.location.search);
      query.set('datasources', 'dicomlocal');
      navigate(`?${query.toString()}`);
      setIsNewStudyModalOpen(false);
    } catch (err) {
      console.error('Failed to start new study:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Sync logic restored
  useEffect(() => {
    if (filterValues.patientName !== lastSentValue.current) {
      setLocalSearch(filterValues.patientName || '');
      lastSentValue.current = filterValues.patientName || '';
    }
  }, [filterValues.patientName]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    lastSentValue.current = val;
    setFilterValues({ ...filterValues, patientName: val, pageNumber: 1 });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          height: '100vh',
          width: '100%',
          bgcolor: 'background.default',
          color: 'text.primary',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          position: 'relative',
          p: isMobile ? 1.5 : 2,
          pb: isMobile ? 10 : 2, // Space for bottom nav
          gap: isMobile ? 1.5 : 2,
        }}
      >
        {/* Animated background orbs */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '-20%',
              left: '-10%',
              width: '50%',
              height: '50%',
              bgcolor: 'primary.main',
              opacity: 0.12,
              borderRadius: '50%',
              filter: 'blur(120px)',
              animation: 'orb 8s ease-in-out infinite',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '-20%',
              right: '-10%',
              width: '50%',
              height: '50%',
              bgcolor: 'secondary.main',
              opacity: 0.1,
              borderRadius: '50%',
              filter: 'blur(120px)',
              animation: 'orb 8s ease-in-out infinite',
              animationDelay: '4s',
            }}
          />
          <style>{`
            @keyframes orb {
              0%, 100% { opacity: 0.12; transform: scale(1); }
              50% { opacity: 0.08; transform: scale(1.08); }
            }
          `}</style>
        </Box>

        {/* Sidebar - Hidden on mobile */}
        {!isMobile && (
          <Box sx={{ position: 'relative', zIndex: 1000 }}>
            <motion.div
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{ height: '100%' }}
            >
              <Sidebar />
            </motion.div>
          </Box>
        )}

        {/* Main content */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1000,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {/* Header row */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'flex-start',
              mb: 2.5,
              gap: isMobile ? 2 : 0,
              flexShrink: 0,
            }}
          >
            <Box>
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                fontWeight={700}
                color="text.primary"
              >
                Study List
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
              >
                Manage and view patient imaging studies
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                alignItems: 'center',
                justifyContent: isMobile ? 'space-between' : 'flex-end',
              }}
            >
              {/* Hidden Inputs */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                multiple
                onChange={handleImportUpload}
              />
              <NewStudyModal
                open={isNewStudyModalOpen}
                onClose={() => setIsNewStudyModalOpen(false)}
                onSubmit={handleNewStudySubmit}
                isUploading={isUploading}
              />

              {/* Import button */}
              <ButtonBase
                component={motion.button as any}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                sx={{
                  flex: isMobile ? 1 : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.75,
                  px: isMobile ? 1.5 : 2,
                  py: 0.875,
                  borderRadius: 2,
                  bgcolor: isUploading ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: isUploading ? 'text.disabled' : 'text.primary',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                }}
              >
                <UploadIcon sx={{ fontSize: 18 }} />
                {isUploading && !isNewStudyModalOpen ? 'Processing...' : 'Import'}
              </ButtonBase>

              {/* New Study button */}
              <ButtonBase
                component={motion.button as any}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsNewStudyModalOpen(true)}
                disabled={isUploading}
                sx={{
                  flex: isMobile ? 1 : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.75,
                  px: isMobile ? 1.5 : 2,
                  py: 0.875,
                  borderRadius: 2,
                  background: isUploading
                    ? 'rgba(59,130,246,0.3)'
                    : 'linear-gradient(to right, rgba(59,130,246,0.85), #3b82f6)',
                  color: 'white',
                  border: '1px solid rgba(59,130,246,0.5)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  boxShadow: isUploading ? 'none' : '0 0 16px rgba(59,130,246,0.3)',
                  '&:hover': { boxShadow: '0 0 24px rgba(59,130,246,0.5)' },
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                }}
              >
                <PlusIcon sx={{ fontSize: 18 }} />
                New Study
              </ButtonBase>
            </Box>
          </Box>

          {/* Search + Filter bar */}
          <Box
            onClick={() => document.getElementById('os-search-input')?.focus()}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 2,
              flexShrink: 0,
              bgcolor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3,
              px: 2,
              py: 0.5,
              cursor: 'text',
              zIndex: 100, // Elevated layer
              position: 'relative',
              pointerEvents: 'auto',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(30, 41, 59, 0.7)',
                borderColor: 'rgba(59,130,246,0.2)',
              },
            }}
          >
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <SearchIcon sx={{ color: 'white', mr: 1, fontSize: 20 }} />
              <input
                id="os-search-input"
                placeholder="Search by Patient Name, ID, or Accession #..."
                value={localSearch}
                onChange={handleSearchChange}
                autoComplete="off"
                style={{
                  width: '100%',
                  height: '44px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'white',
                  fontSize: '0.875rem',
                  cursor: 'text',
                  fontFamily: 'inherit',
                }}
              />
            </Box>

            <Box sx={{ width: 1, height: 28, bgcolor: 'rgba(255,255,255,0.1)' }} />

            <ButtonBase
              component={motion.button as any}
              whileHover={{ scale: 1.04 }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: 2,
                color: 'text.secondary',
                fontSize: '0.875rem',
                flexShrink: 0,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: 'text.primary' },
              }}
            >
              <FilterIcon sx={{ fontSize: 18 }} />
              {!isMobile && 'Filters'}
            </ButtonBase>
          </Box>

          {/* Mobile Bottom Nav */}
          {isMobile && (
            <BottomNav
              activeNav={activeNav}
              onNavChange={setActiveNav}
            />
          )}

          {/* Study cards list */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              pr: 0.5,
              '&::-webkit-scrollbar': { width: 5 },
              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
            }}
          >
            {isLoadingData ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        height: 110,
                        borderRadius: 3,
                        bgcolor: 'rgba(30,41,59,0.3)',
                        animation: 'shimmer 1.5s infinite',
                      }}
                    />
                  ))}
                <style>{`
                  @keyframes shimmer {
                    0% { opacity: 0.4; } 50% { opacity: 0.7; } 100% { opacity: 0.4; }
                  }
                `}</style>
              </Box>
            ) : !studies || studies.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: 2,
                  opacity: 0.5,
                }}
              >
                <FileTextIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                <Typography
                  variant="body1"
                  color="text.secondary"
                >
                  No studies found
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {studies.map((study, index) => (
                  <StudyCard
                    key={study.studyInstanceUid || index}
                    study={study}
                    index={index}
                    isMobile={isMobile}
                    onClick={() => onStudyClick(study)}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
