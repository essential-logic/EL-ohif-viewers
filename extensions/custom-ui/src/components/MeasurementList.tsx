import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Straighten as RulerIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Download as DownloadIcon,
  ZoomIn as ZoomInIcon,
} from '@mui/icons-material';
import { Panel } from './Panel';
import { Box, Typography, IconButton, Divider } from '@mui/material';

interface Measurement {
  id: string;
  type: 'length' | 'bidirectional' | 'ellipse' | 'rectangle' | 'angle' | 'probe';
  label: string;
  value: string;
  unit: string;
  series: string;
  slice: number;
  visible: boolean;
  color: string;
}

const mockMeasurements: Measurement[] = [
  {
    id: '1',
    type: 'length',
    label: 'Lesion 1',
    value: '12.4',
    unit: 'mm',
    series: 'Series 2',
    slice: 45,
    visible: true,
    color: '#64748b',
  },
  {
    id: '2',
    type: 'ellipse',
    label: 'ROI Liver',
    value: '245.8',
    unit: 'mm²',
    series: 'Series 2',
    slice: 48,
    visible: true,
    color: '#ef4444',
  },
  {
    id: '3',
    type: 'bidirectional',
    label: 'Tumor',
    value: '18.2 × 14.5',
    unit: 'mm',
    series: 'Series 2',
    slice: 52,
    visible: false,
    color: '#f59e0b',
  },
  {
    id: '4',
    type: 'angle',
    label: 'Cobb Angle',
    value: '24.5',
    unit: '°',
    series: 'Series 3',
    slice: 12,
    visible: true,
    color: '#8b5cf6',
  },
  {
    id: '5',
    type: 'probe',
    label: 'HU Value',
    value: '45',
    unit: 'HU',
    series: 'Series 2',
    slice: 45,
    visible: true,
    color: '#10b981',
  },
];

interface MeasurementListProps {
  measurements?: Measurement[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  onJumpTo?: (id: string) => void;
  onExport?: () => void;
}

export function MeasurementList({
  measurements = mockMeasurements,
  onEdit,
  onDelete,
  onToggleVisibility,
  onJumpTo,
  onExport,
}: MeasurementListProps) {
  return (
    <Panel sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RulerIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography
            variant="subtitle2"
            fontWeight={700}
            color="text.primary"
          >
            MEASUREMENTS
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={onExport}
          sx={{ color: 'text.secondary' }}
        >
          <DownloadIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.05)' }} />

      {/* Measurement List */}
      <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
        <AnimatePresence mode="popLayout">
          {measurements.map((measurement, index) => (
            <motion.div
              key={measurement.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: index * 0.05 }}
            >
              <Box
                sx={{
                  p: 1.5,
                  mb: 1,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: measurement.visible
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(255,255,255,0.02)',
                  bgcolor: 'rgba(255,255,255,0.02)',
                  opacity: measurement.visible ? 1 : 0.6,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: measurement.color,
                      flexShrink: 0,
                    }}
                  />

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{ color: 'text.primary', display: 'block' }}
                    >
                      {measurement.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ color: 'primary.main', fontFamily: 'monospace' }}
                    >
                      {measurement.value}{' '}
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {measurement.unit}
                      </span>
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => onToggleVisibility?.(measurement.id)}
                      sx={{ p: 0.5 }}
                    >
                      {measurement.visible ? (
                        <VisibilityIcon fontSize="small" />
                      ) : (
                        <VisibilityOffIcon fontSize="small" />
                      )}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onJumpTo?.(measurement.id)}
                      sx={{ p: 0.5 }}
                    >
                      <ZoomInIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 0.5, pl: 2.25 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontSize: '0.65rem' }}
                  >
                    {measurement.series} • Sl {measurement.slice}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>

      {/* Summary */}
      <Box
        sx={{
          mt: 2,
          pt: 2,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Total Items: <strong>{measurements.length}</strong>
        </Typography>
      </Box>
    </Panel>
  );
}
