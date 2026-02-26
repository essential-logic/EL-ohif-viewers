import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon,
  GridView as GridViewIcon,
  List as ListIcon,
} from '@mui/icons-material';
import { Panel } from './Panel';
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
  ButtonBase,
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
    instanceCount: 128,
  },
  {
    id: 'ST-2026-002',
    patientName: 'Jane Smith',
    patientId: 'PT-2026-005678',
    studyDate: '2026-02-14',
    modality: 'MRI',
    description: 'Brain MRI T1/T2',
    seriesCount: 8,
    instanceCount: 256,
  },
  {
    id: 'ST-2026-003',
    patientName: 'Robert Johnson',
    patientId: 'PT-2026-009012',
    studyDate: '2026-02-13',
    modality: 'PET/CT',
    description: 'Whole Body PET/CT',
    seriesCount: 12,
    instanceCount: 512,
  },
  {
    id: 'ST-2026-004',
    patientName: 'Emily Davis',
    patientId: 'PT-2026-003456',
    studyDate: '2026-02-12',
    modality: 'CT',
    description: 'Abdomen/Pelvis CT',
    seriesCount: 6,
    instanceCount: 180,
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
  viewMode: initialViewMode = 'grid',
}: StudyBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);

  const filteredStudies = studies.filter(study => {
    const matchesSearch =
      study.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesModality = modalityFilter === 'all' || study.modality === modalityFilter;

    return matchesSearch && matchesModality;
  });

  const modalities = ['all', ...Array.from(new Set(studies.map(s => s.modality)))];

  return (
    <Panel sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          color="primary"
          sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}
        >
          Study Browser
        </Typography>

        {/* Search Bar */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search patient..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl
            size="small"
            sx={{ flex: 1 }}
          >
            <Select
              value={modalityFilter}
              onChange={e => setModalityFilter(e.target.value as string)}
            >
              {modalities.map(mod => (
                <MenuItem
                  key={mod}
                  value={mod}
                >
                  {mod === 'all' ? 'All Modalities' : mod}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              bgcolor: 'rgba(255,255,255,0.05)',
              p: 0.5,
              borderRadius: 1,
            }}
          >
            <IconButton
              size="small"
              onClick={() => setViewMode('grid')}
              sx={{ color: viewMode === 'grid' ? 'primary.main' : 'text.secondary' }}
            >
              <GridViewIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode('list')}
              sx={{ color: viewMode === 'list' ? 'primary.main' : 'text.secondary' }}
            >
              <ListIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Study List */}
      <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
        <AnimatePresence mode="popLayout">
          {filteredStudies.map((study, index) => (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <ButtonBase
                onClick={() => onStudySelect?.(study.id)}
                sx={{
                  width: '100%',
                  p: 1.5,
                  mb: 1,
                  borderRadius: 1.5,
                  border: '1px solid rgba(255,255,255,0.05)',
                  bgcolor: 'rgba(255,255,255,0.02)',
                  textAlign: 'left',
                  display: 'block',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                    noWrap
                  >
                    {study.patientName}
                  </Typography>
                  <Chip
                    label={study.modality}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      bgcolor: 'primary.main',
                      color: 'white',
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                >
                  {study.description}
                </Typography>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: 'primary.main', fontWeight: 600 }}
                  >
                    {study.studyDate}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary' }}
                  >
                    {study.instanceCount} Imgs
                  </Typography>
                </Box>
              </ButtonBase>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>
    </Panel>
  );
}
