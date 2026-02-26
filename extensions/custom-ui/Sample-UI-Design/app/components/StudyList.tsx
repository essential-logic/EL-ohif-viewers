import { motion } from 'motion/react';
import { 
  CalendarToday as CalendarIcon, 
  Person as UserIcon, 
  Description as FileTextIcon, 
  Visibility as EyeIcon, 
  Download as DownloadIcon, 
  ChevronRight as ChevronRightIcon 
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Card, 
  CardActionArea, 
  CardContent, 
  Chip, 
  Grid,
  IconButton,
  useTheme
} from '@mui/material';

// Mock data remains the same
const mockStudies = [
  {
    id: 1,
    patientName: 'John Doe',
    patientId: 'PT-2026-001234',
    studyDate: 'Feb 15, 2026',
    modality: 'CT',
    bodyPart: 'Chest',
    description: 'Chest CT with Contrast',
    series: 5,
    instances: 128,
    status: 'Completed',
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    patientId: 'PT-2026-001235',
    studyDate: 'Feb 14, 2026',
    modality: 'MRI',
    bodyPart: 'Brain',
    description: 'Brain MRI T1/T2',
    series: 8,
    instances: 256,
    status: 'Completed',
  },
  {
    id: 3,
    patientName: 'Robert Johnson',
    patientId: 'PT-2026-001236',
    studyDate: 'Feb 14, 2026',
    modality: 'X-Ray',
    bodyPart: 'Spine',
    description: 'Lumbar Spine AP/LAT',
    series: 2,
    instances: 4,
    status: 'Completed',
  },
  {
    id: 4,
    patientName: 'Emily Davis',
    patientId: 'PT-2026-001237',
    studyDate: 'Feb 13, 2026',
    modality: 'CT',
    bodyPart: 'Abdomen',
    description: 'Abdominal CT Angio',
    series: 6,
    instances: 180,
    status: 'Completed',
  },
  {
    id: 5,
    patientName: 'Michael Brown',
    patientId: 'PT-2026-001238',
    studyDate: 'Feb 13, 2026',
    modality: 'MRI',
    bodyPart: 'Knee',
    description: 'Right Knee MRI',
    series: 4,
    instances: 96,
    status: 'In Progress',
  },
  {
    id: 6,
    patientName: 'Sarah Wilson',
    patientId: 'PT-2026-001239',
    studyDate: 'Feb 12, 2026',
    modality: 'CT',
    bodyPart: 'Head',
    description: 'Head CT Non-Contrast',
    series: 3,
    instances: 64,
    status: 'Completed',
  },
];

export function StudyList() {
  const router = useRouter();
  const theme = useTheme();

  const handleOpenStudy = (studyId: number) => {
    router.push(`/viewer/${studyId}`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {mockStudies.map((study, index) => (
        <motion.div
          key={study.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card 
            sx={{ 
              bgcolor: 'rgba(30, 41, 59, 0.4)', // Slightly transparent
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 3,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'rgba(30, 41, 59, 0.6)',
                border: `1px solid ${theme.palette.primary.main}40`, // 40 hex opacity
                transform: 'translateY(-2px)',
                boxShadow: 4
              }
            }}
          >
            <CardActionArea 
              onClick={() => handleOpenStudy(study.id)}
              sx={{ p: 1.5 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  {/* Header: Icon, Description, Modality, Status */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box 
                      sx={{ 
                        p: 0.75, 
                        borderRadius: 2, 
                        bgcolor: 'rgba(59, 130, 246, 0.2)', 
                        color: 'primary.main',
                        border: '1px solid rgba(59, 130, 246, 0.5)',
                        display: 'flex',
                        boxShadow: '0 0 10px rgba(59,130,246,0.2)'
                      }}
                    >
                      <FileTextIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                        {study.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0 }}>
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                          {study.modality}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">•</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {study.bodyPart}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Status Chip moved here with auto margin to push right */}
                    <Chip 
                      label={study.status} 
                      size="small"
                      sx={{ 
                        ml: 'auto',
                        borderRadius: 999,
                        height: 20,
                        fontSize: 10,
                        fontWeight: 600,
                        bgcolor: study.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                        color: study.status === 'Completed' ? '#10b981' : '#eab308',
                        border: `1px solid ${study.status === 'Completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
                      }}
                    />
                  </Box>

                  {/* Info Grid */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <UserIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>Patient</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{study.patientName}</Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FileTextIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>Patient ID</Typography>
                          <Typography variant="caption" sx={{ color: 'primary.main', fontFamily: 'monospace', fontSize: '0.75rem' }}>{study.patientId}</Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>Date</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{study.studyDate}</Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EyeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>Images</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{study.series}S / {study.instances}I</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }} onClick={(e) => e.stopPropagation()}>
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenStudy(study.id);
                      }}
                      sx={{ 
                        bgcolor: 'rgba(59, 130, 246, 0.1)', 
                        color: 'primary.main',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          boxShadow: '0 0 15px rgba(59,130,246,0.6)'
                        }
                      }}
                    >
                      <ChevronRightIcon />
                    </IconButton>

                    <IconButton 
                      size="small"
                      sx={{ 
                        color: 'text.secondary',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          color: 'text.primary'
                        }
                      }}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                </Box>
              </Box>
            </CardActionArea>
          </Card>
        </motion.div>
      ))}
    </Box>
  );
}
