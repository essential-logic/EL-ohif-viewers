import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Straighten as RulerIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Download as DownloadIcon,
  ZoomIn as ZoomInIcon
} from '@mui/icons-material';
import { Panel } from './ui/panel';
import { Box, Typography, IconButton, Divider, Button } from '@mui/material';

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
  { id: '1', type: 'length', label: 'Lesion 1', value: '12.4', unit: 'mm', series: 'Series 2', slice: 45, visible: true, color: '#64748b' },
  { id: '2', type: 'ellipse', label: 'ROI Liver', value: '245.8', unit: 'mm²', series: 'Series 2', slice: 48, visible: true, color: '#ef4444' },
  { id: '3', type: 'bidirectional', label: 'Tumor', value: '18.2 × 14.5', unit: 'mm', series: 'Series 2', slice: 52, visible: false, color: '#f59e0b' },
  { id: '4', type: 'angle', label: 'Cobb Angle', value: '24.5', unit: '°', series: 'Series 3', slice: 12, visible: true, color: '#8b5cf6' },
  { id: '5', type: 'probe', label: 'HU Value', value: '45', unit: 'HU', series: 'Series 2', slice: 45, visible: true, color: '#10b981' },
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
  onExport
}: MeasurementListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleExportCSV = () => {
    onExport?.();
    console.log('Exporting measurements as CSV...');
  };

  return (
    <Panel sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RulerIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="subtitle2" fontWeight={600} color="text.primary">
            Measurements
          </Typography>
          <Box sx={{ 
            px: 1, 
            py: 0.25, 
            borderRadius: 10, 
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {measurements.length}
            </Typography>
          </Box>
        </Box>
        
        <Button
          size="small"
          startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
          onClick={handleExportCSV}
          sx={{
            fontSize: '0.75rem',
            px: 1.5,
            py: 0.5,
            color: 'text.secondary',
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'text.primary',
              color: 'text.primary'
            }
          }}
          variant="outlined"
        >
          Export CSV
        </Button>
      </Box>

      <Divider sx={{ mb: 2, borderColor: 'divider' }} />

      {/* Measurement List */}
      <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
        <AnimatePresence>
          {measurements.map((measurement, index) => (
            <Box
              component={motion.div}
              key={measurement.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: index * 0.05 }}
              sx={{ mb: 1 }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: measurement.visible ? 'divider' : 'divider',
                  bgcolor: measurement.visible ? 'background.paper' : 'action.hover',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderColor: 'text.secondary',
                  },
                  opacity: measurement.visible ? 1 : 0.6
                }}
              >
                {/* Main Info */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                  <Box sx={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    bgcolor: measurement.color,
                    mt: 0.75,
                    flexShrink: 0
                  }} />
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="caption" 
                      fontWeight={600}
                      sx={{ color: 'text.primary', display: 'block', mb: 0.25 }}
                    >
                      {measurement.label}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        fontWeight={500}
                        sx={{ color: 'text.primary', fontFamily: 'monospace' }}
                      >
                        {measurement.value}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {measurement.unit}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 0, flexShrink: 0 }}>
                    <IconButton
                      size="small"
                      onClick={() => onToggleVisibility?.(measurement.id)}
                      sx={{ 
                        p: 0.5, 
                        color: measurement.visible ? 'primary.main' : 'text.disabled',
                      }}
                    >
                      {measurement.visible ? 
                        <VisibilityIcon sx={{ fontSize: 16 }} /> : 
                        <VisibilityOffIcon sx={{ fontSize: 16 }} />
                      }
                    </IconButton>
                    
                    <IconButton
                      size="small"
                      onClick={() => onJumpTo?.(measurement.id)}
                      sx={{ p: 0.5, color: 'text.secondary' }}
                    >
                      <ZoomInIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    
                    <IconButton
                      size="small"
                      onClick={() => onEdit?.(measurement.id)}
                      sx={{ p: 0.5, color: 'text.secondary' }}
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    
                    <IconButton
                      size="small"
                      onClick={() => onDelete?.(measurement.id)}
                      sx={{ p: 0.5, color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>

                {/* Metadata */}
                <Box sx={{ display: 'flex', gap: 2, mt: 0.5, pl: 2.25 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                    {measurement.series}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                    Slice {measurement.slice}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: 'text.secondary', 
                    fontSize: '0.7rem',
                    textTransform: 'capitalize'
                  }}>
                    {measurement.type}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </AnimatePresence>
      </Box>

      {/* Statistics Summary */}
      <Box sx={{ 
        mt: 2, 
        pt: 2, 
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        gap: 1
      }}>
        <Box sx={{ flex: 1, p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.65rem' }}>
            Total
          </Typography>
          <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary' }}>
            {measurements.length}
          </Typography>
        </Box>
        
        <Box sx={{ flex: 1, p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.65rem' }}>
            Visible
          </Typography>
          <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary' }}>
            {measurements.filter(m => m.visible).length}
          </Typography>
        </Box>
      </Box>
    </Panel>
  );
}
