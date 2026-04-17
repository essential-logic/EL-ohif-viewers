import React, { useState, useEffect } from 'react';
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

import { ServicesManager, CommandsManager } from '@ohif/core';

interface Study {
  id: string; // StudyInstanceUID
  patientName: string;
  patientId: string;
  studyDate: string;
  modality: string;
  description: string;
  seriesCount: number;
  instanceCount: number;
  thumbnail?: string;
}

interface StudyBrowserProps {
  servicesManager?: ServicesManager;
  commandsManager?: CommandsManager;
  onStudySelect?: (studyId: string) => void;
  viewMode?: 'grid' | 'list';
}

const formatPN = (name: unknown): string => {
  if (!name) {
    return 'N/A';
  }
  if (typeof name === 'string') {
    return name.replace(/\^/g, ' ');
  }
  if (typeof name === 'object' && name !== null && 'Alphabetic' in name) {
    return (name as { Alphabetic: string }).Alphabetic.replace(/\^/g, ' ');
  }
  return 'N/A';
};

const formatDate = (date: string): string => {
  if (!date || date.length < 8) {
    return date || 'N/A';
  }
  return `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
};

export function StudyBrowser({
  servicesManager,
  commandsManager,
  onStudySelect,
  viewMode: initialViewMode = 'grid',
}: StudyBrowserProps) {
  const [studies, setStudies] = useState<Study[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);

  useEffect(() => {
    if (!servicesManager) {
      return;
    }
    const { displaySetService } = servicesManager.services;

    const updateDisplaySets = () => {
      const displaySets = displaySetService.activeDisplaySets || [];
      const studyMap = new Map<string, Study>();

      displaySets.forEach((ds: Record<string, unknown>) => {
        const instance = (ds.instance || (ds.instances as Record<string, unknown>[])?.[0] || {}) as Record<string, unknown>;
        const studyInstanceUID = ds.StudyInstanceUID as string;
        if (!studyInstanceUID) {
          return;
        }

        if (!studyMap.has(studyInstanceUID)) {
          studyMap.set(studyInstanceUID, {
            id: studyInstanceUID,
            patientName: formatPN(instance.PatientName),
            patientId: (instance.PatientID as string) || 'N/A',
            studyDate: formatDate(instance.StudyDate as string),
            modality: (ds.Modality || instance.Modality || 'N/A') as string,
            description: (instance.StudyDescription as string) || 'No description',
            seriesCount: 0,
            instanceCount: 0,
          });
        }

        const study = studyMap.get(studyInstanceUID)!;
        study.seriesCount += 1;
        study.instanceCount += (ds.numImageFrames as number) || (ds.instances as [])?.length || 1;

        // Collect distinct modalities
        const mod = (ds.Modality || instance.Modality) as string;
        if (mod && typeof mod === 'string' && !study.modality.includes(mod)) {
          study.modality += ` / ${mod}`;
        }
      });
      setStudies(Array.from(studyMap.values()));
    };

    updateDisplaySets();

    const subs = [
      displaySetService.subscribe(displaySetService.EVENTS.DISPLAY_SETS_ADDED, updateDisplaySets),
      displaySetService.subscribe(displaySetService.EVENTS.DISPLAY_SETS_CHANGED, updateDisplaySets),
      displaySetService.subscribe(
        displaySetService.EVENTS.DISPLAY_SET_SERIES_METADATA_INVALIDATED,
        updateDisplaySets
      ),
    ];

    return () => {
      subs.forEach(sub => sub.unsubscribe());
    };
  }, [servicesManager]);

  const filteredStudies = studies.filter(study => {
    const matchesSearch =
      study.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesModality = modalityFilter === 'all' || study.modality.includes(modalityFilter);

    return matchesSearch && matchesModality;
  });

  const modalities = ['all', ...Array.from(new Set(studies.flatMap(s => s.modality.split(' / '))))];

  const handleStudyClick = (studyId: string) => {
    if (onStudySelect) {
      onStudySelect(studyId);
    }
    // Alternatively, emit commands if needed
  };

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
        {filteredStudies.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center', opacity: 0.5 }}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              No studies available.
            </Typography>
          </Box>
        ) : (
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
                  onClick={() => handleStudyClick(study.id)}
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
                      {study.seriesCount} Series, {study.instanceCount} Imgs
                    </Typography>
                  </Box>
                </ButtonBase>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </Box>
    </Panel>
  );
}
