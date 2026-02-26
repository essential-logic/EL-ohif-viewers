import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Sort as SortIcon,
  GridView as GridViewIcon,
  List as ListIcon
} from '@mui/icons-material';
import { Panel } from './ui/panel';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Chip,
  ButtonBase
} from '@mui/material';

interface Study {
  id: string;
  patientName: string;
  patientId: string;
  studyDate: string;
  modality: string;
  description: string;
  seriesCount: number;
  instanceCount: number;
  thumbnail?: string;
}

const mockStudies: Study[] = [
  {
    id: 'ST-2026-001',
    patientName: 'John Doe',
    patientId: 'PT-2026-001234',
    studyDate: '2026-02-15',
    modality: 'CT',
    description: 'Chest CT with Contrast',
    seriesCount: 5,
    instanceCount: 128
  },
  {
    id: 'ST-2026-002',
    patientName: 'Jane Smith',
    patientId: 'PT-2026-005678',
    studyDate: '2026-02-14',
    modality: 'MRI',
    description: 'Brain MRI T1/T2',
    seriesCount: 8,
    instanceCount: 256
  },
  {
    id: 'ST-2026-003',
    patientName: 'Robert Johnson',
    patientId: 'PT-2026-009012',
    studyDate: '2026-02-13',
    modality: 'PET/CT',
    description: 'Whole Body PET/CT',
    seriesCount: 12,
    instanceCount: 512
  },
  {
    id: 'ST-2026-004',
    patientName: 'Emily Davis',
    patientId: 'PT-2026-003456',
    studyDate: '2026-02-12',
    modality: 'CT',
    description: 'Abdomen/Pelvis CT',
    seriesCount: 6,
    instanceCount: 180
  },
];

interface StudyBrowserProps {
  studies?: Study[];
  onStudySelect?: (studyId: string) => void;
  viewMode?: 'grid' | 'list';
}

export function StudyBrowser({ 
  studies = mockStudies, 
  onStudySelect,
  viewMode: initialViewMode = 'grid'
}: StudyBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);

  const filteredStudies = studies.filter(study => {
    const matchesSearch = 
      study.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesModality = modalityFilter === 'all' || study.modality === modalityFilter;
    
    return matchesSearch && matchesModality;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime();
      case 'date-asc':
        return new Date(a.studyDate).getTime() - new Date(b.studyDate).getTime();
      case 'name-asc':
        return a.patientName.localeCompare(b.patientName);
      case 'name-desc':
        return b.patientName.localeCompare(a.patientName);
      default:
        return 0;
    }
  });

  const modalities = ['all', ...Array.from(new Set(studies.map(s => s.modality)))];

  const getModalityColor = (modality: string) => {
    const colors: Record<string, string> = {
      'CT': '#3b82f6',
      'MRI': '#8b5cf6',
      'PET/CT': '#ef4444',
      'US': '#10b981',
      'XR': '#f59e0b',
    };
    return colors[modality] || '#6b7280';
  };

  return (
    <Panel sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
          Study Browser
        </Typography>

        {/* Search Bar */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search by patient name, ID, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
              '& fieldset': { borderColor: 'divider' },
              '&:hover fieldset': { borderColor: 'text.secondary' },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' },
            },
          }}
        />

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              sx={{
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
              }}
            >
              {modalities.map(mod => (
                <MenuItem key={mod} value={mod}>
                  {mod === 'all' ? 'All Modalities' : mod}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              startAdornment={<SortIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />}
              sx={{
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
              }}
            >
              <MenuItem value="date-desc">Newest First</MenuItem>
              <MenuItem value="date-asc">Oldest First</MenuItem>
              <MenuItem value="name-asc">Name A-Z</MenuItem>
              <MenuItem value="name-desc">Name Z-A</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ flex: 1 }} />

          {/* View Mode Toggle */}
          <Box sx={{ display: 'flex', gap: 0.5, bgcolor: 'action.hover', p: 0.5, borderRadius: 1 }}>
            <IconButton
              size="small"
              onClick={() => setViewMode('grid')}
              sx={{
                color: viewMode === 'grid' ? 'primary.main' : 'text.secondary',
                bgcolor: viewMode === 'grid' ? 'background.paper' : 'transparent',
                boxShadow: viewMode === 'grid' ? 1 : 0,
              }}
            >
              <GridViewIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode('list')}
              sx={{
                color: viewMode === 'list' ? 'primary.main' : 'text.secondary',
                bgcolor: viewMode === 'list' ? 'background.paper' : 'transparent',
                boxShadow: viewMode === 'list' ? 1 : 0,
              }}
            >
              <ListIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Results Count */}
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.5 }}>
          {filteredStudies.length} {filteredStudies.length === 1 ? 'study' : 'studies'} found
        </Typography>
      </Box>

      {/* Study List */}
      <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
        <AnimatePresence>
          {viewMode === 'grid' ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
              {filteredStudies.map((study, index) => (
                <ButtonBase
                  key={study.id}
                  component={motion.button}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onStudySelect?.(study.id)}
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderColor: 'text.secondary',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* Thumbnail Placeholder */}
                    <Box
                      sx={{
                        width: '100%',
                        aspectRatio: '16/9',
                        borderRadius: 1,
                        bgcolor: 'action.disabledBackground',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <HospitalIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                    </Box>

                    {/* Study Info */}
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
                        {study.patientName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', display: 'block', mb: 1 }}>
                        {study.patientId}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                        {study.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={study.modality}
                          size="small"
                          sx={{
                            bgcolor: 'action.hover',
                            color: 'text.primary',
                            border: '1px solid',
                            borderColor: 'divider',
                            fontSize: '0.65rem',
                            height: 20,
                          }}
                        />
                        <Chip
                          icon={<CalendarIcon sx={{ fontSize: 12 }} />}
                          label={new Date(study.studyDate).toLocaleDateString()}
                          size="small"
                          sx={{
                            bgcolor: 'action.hover',
                            color: 'text.secondary',
                            border: '1px solid',
                            borderColor: 'divider',
                            fontSize: '0.65rem',
                            height: 20,
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Stats */}
                    <Box sx={{ display: 'flex', gap: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                          Series
                        </Typography>
                        <Typography variant="caption" fontWeight={600} sx={{ color: 'text.primary', display: 'block' }}>
                          {study.seriesCount}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                          Images
                        </Typography>
                        <Typography variant="caption" fontWeight={600} sx={{ color: 'text.primary', display: 'block' }}>
                          {study.instanceCount}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </ButtonBase>
              ))}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {filteredStudies.map((study, index) => (
                <ButtonBase
                  key={study.id}
                  component={motion.button}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => onStudySelect?.(study.id)}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderColor: 'text.secondary',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 60,
                        borderRadius: 1,
                        bgcolor: 'action.disabledBackground',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        flexShrink: 0,
                      }}
                    >
                      <HospitalIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {study.patientName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                        {study.patientId}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                        {study.description}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                      <Chip
                        label={study.modality}
                        size="small"
                        sx={{
                          bgcolor: 'action.hover',
                          color: 'text.primary',
                          border: '1px solid',
                          borderColor: 'divider',
                          fontSize: '0.65rem',
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 80 }}>
                        {new Date(study.studyDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </ButtonBase>
              ))}
            </Box>
          )}
        </AnimatePresence>
      </Box>
    </Panel>
  );
}
