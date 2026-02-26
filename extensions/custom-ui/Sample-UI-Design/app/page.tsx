'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import LogoImage from './essential-logic-logo.png';
import { 
  Search as SearchIcon, 
  FilterList as FilterIcon, 
  GridView as GridIcon, 
  CalendarToday as CalendarIcon, 
  Person as UserIcon, 
  MonitorHeart as ActivityIcon, 
  Add as PlusIcon, 
  Upload as UploadIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { StudyList } from './components/StudyList';
import { GlassLayout } from './components/layout/GlassLayout';
import { useState } from 'react';
import { UserPreferencesModal } from './components/UserPreferencesModal';
import { GlassPanel } from './components/ui/glass-panel';
import { Box, Typography, ButtonBase, TextField, InputAdornment, LinearProgress } from '@mui/material';

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <GlassLayout
      sidebarWidth={240}
      sidebar={
        <GlassPanel sx={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, height: '100%' }}>
          <Box sx={{ mb: 4, px: 2, display: 'flex', flexDirection: 'column', width: 'fit-content' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 0.5, borderRadius: 2, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex' }}>
                <Image 
                  src={LogoImage} 
                  alt="Essential Logic Logo" 
                  width={32} 
                  height={32} 
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ 
                    background: 'linear-gradient(to right, #3b82f6, #93c5fd, #22d3ee)', 
                    backgroundClip: 'text', 
                    color: 'transparent',
                    fontWeight: 800,
                    lineHeight: 1.3,
                    fontSize: '1.3rem',
                    letterSpacing: 0.1
                }}>
                  DICOM Pro
                </Typography>
                <Typography variant="caption" sx={{ color: 'white', fontSize: '0.78rem', fontWeight: 600, display: 'block', lineHeight: 1 }}>
                  by Essential Logic
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 0.5, px: 0.2 }}>
               <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.55rem', textTransform: 'uppercase', width: '100%', textAlign: 'center', letterSpacing: 2 }}>
                Powered by OHIF Viewer
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <ButtonBase sx={{ justifyContent: 'flex-start', px: 1.5, py: 1, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', color: 'primary.main', border: '1px solid rgba(59, 130, 246, 0.2)', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' }, width: '100%' }}>
              <ActivityIcon sx={{ fontSize: 20, mr: 1.5 }} />
              <Typography variant="body2" fontWeight={500}>Dashboard</Typography>
            </ButtonBase>
            <ButtonBase sx={{ justifyContent: 'flex-start', px: 1.5, py: 1, borderRadius: 2, color: 'text.secondary', border: '1px solid transparent', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'text.primary' }, width: '100%' }}>
              <CalendarIcon sx={{ fontSize: 20, mr: 1.5 }} />
              <Typography variant="body2" fontWeight={500}>Schedule</Typography>
            </ButtonBase>
            <ButtonBase sx={{ justifyContent: 'flex-start', px: 1.5, py: 1, borderRadius: 2, color: 'text.secondary', border: '1px solid transparent', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'text.primary' }, width: '100%' }}>
              <UserIcon sx={{ fontSize: 20, mr: 1.5 }} />
              <Typography variant="body2" fontWeight={500}>Patients</Typography>
            </ButtonBase>
          </Box>

          <Box sx={{ mt: 'auto', width: '100%' }}>
             <ButtonBase
               onClick={() => setSettingsOpen(true)}
               sx={{ justifyContent: 'flex-start', px: 1.5, py: 1, mb: 2, borderRadius: 2, color: 'text.secondary', border: '1px solid transparent', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'text.primary' }, width: '100%' }}
             >
              <SettingsIcon sx={{ fontSize: 20, mr: 1.5 }} />
              <Typography variant="body2" fontWeight={500}>Settings</Typography>
            </ButtonBase>

             <Box sx={{ p: 1.5, borderRadius: 3, background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
               <Typography variant="caption" sx={{ color: 'secondary.light', mb: 0.5, display: 'block' }}>Storage Used</Typography>
               <LinearProgress variant="determinate" value={75} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(139, 92, 246, 0.1)', '& .MuiLinearProgress-bar': { bgcolor: 'secondary.main', borderRadius: 3, boxShadow: '0 0 10px rgba(139,92,246,0.5)' } }} />
               <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                 <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>750 GB</Typography>
                 <Typography variant="caption" color="secondary.main" sx={{ fontSize: '0.65rem' }}>1 TB</Typography>
               </Box>
             </Box>
          </Box>
        </GlassPanel>
      }
    >
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', p: 2, overflow: 'hidden' }}>
        {/* Header Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={600} color="text.primary">Study List</Typography>
            <Typography variant="body2" color="text.secondary">Manage and view patient imaging studies</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <ButtonBase
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'text.primary', fontSize: '0.875rem', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)', boxShadow: 2 } }}
            >
              <UploadIcon sx={{ fontSize: 18, mr: 1 }} />
              Import
            </ButtonBase>
            <ButtonBase
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{ px: 2, py: 1, borderRadius: 2, background: 'linear-gradient(to right, rgba(59, 130, 246, 0.8), #3b82f6)', color: 'white', border: '1px solid rgba(59, 130, 246, 0.5)', fontSize: '0.875rem', boxShadow: '0 0 15px rgba(59,130,246,0.3)', '&:hover': { boxShadow: '0 0 25px rgba(59,130,246,0.5)' } }}
            >
              <PlusIcon sx={{ fontSize: 18, mr: 1 }} />
              New Study
            </ButtonBase>
          </Box>
        </Box>

        {/* Search Bar & Filters */}
        <GlassPanel sx={{ p: 2, mb: 3, flexDirection: 'row', alignItems: 'center', gap: 2, height: 'auto', borderRadius: 3 }}>
           <Box sx={{ flex: 1, position: 'relative' }}>
              <TextField 
                placeholder="Search by Patient Name, ID, or Accession #..." 
                variant="standard"
                fullWidth
                InputProps={{
                    disableUnderline: true,
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        </InputAdornment>
                    ),
                    sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.5,
                        fontSize: '0.875rem',
                        '&.Mui-focused': { border: '1px solid rgba(59, 130, 246, 0.5)' }
                    }
                }}
              />
           </Box>
           <Box sx={{ height: 32, width: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
           <ButtonBase 
             component={motion.button}
             whileHover={{ scale: 1.05 }}
             sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, borderRadius: 2, color: 'text.secondary', fontSize: '0.875rem', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'text.primary' } }}
           >
             <FilterIcon sx={{ fontSize: 18 }} />
             Filters
           </ButtonBase>
        </GlassPanel>

        {/* Scrollable List */}
        <Box sx={{ flex: 1, overflowY: 'auto', pr: 1, '::-webkit-scrollbar': { width: 6 } }}>
          <StudyList />
        </Box>
      </Box>
      <UserPreferencesModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </GlassLayout>
  );
}
