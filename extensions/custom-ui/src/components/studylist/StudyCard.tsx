import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Description as FileTextIcon,
  CalendarToday as CalendarIcon,
  Visibility as EyeIcon,
  ChevronRight as ChevronRightIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Box, Typography, Card, CardActionArea, IconButton } from '@mui/material';

export interface Study {
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

interface StudyCardProps {
  study: Study;
  index: number;
  isMobile: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
  onDelete?: (study: Study) => void;
}

const formatDate = (dateStr?: string): string => {
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

export const StudyCard = memo(function StudyCard({
  study,
  index,
  isMobile,
  onClick,
  onMouseEnter,
  onDelete,
}: StudyCardProps) {
  // Optimization: Only animate entrance for the first 15 items to save CPU during scroll
  const shouldAnimate = index < 15;

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 12 } : false}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      style={{ willChange: shouldAnimate ? 'opacity, transform' : 'auto' }}
    >
      <Card
        sx={{
          bgcolor: 'rgba(23, 31, 48, 0.92)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 3,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
          display: 'flex',
          alignItems: 'stretch',
          '&:hover': {
            bgcolor: 'rgba(30, 41, 59, 0.98)',
            borderColor: 'rgba(59,130,246,0.4)',
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          },
        }}
      >
        {/* Main clickable area */}
        <CardActionArea
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          sx={{ p: 1.5, flex: 1, '&:hover': { bgcolor: 'transparent' } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
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
          </Box>
        </CardActionArea>

        {/* Action buttons — outside CardActionArea to avoid button-in-button nesting */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            flexShrink: 0,
            justifyContent: 'center',
            pr: 1.5,
          }}
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
          {onDelete && (
            <IconButton
              size="small"
              onClick={e => {
                e.stopPropagation();
                onDelete(study);
              }}
              sx={{
                color: 'rgba(239, 68, 68, 0.6)',
                '&:hover': {
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  color: 'rgb(239, 68, 68)',
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Card>
    </motion.div>
  );
});
