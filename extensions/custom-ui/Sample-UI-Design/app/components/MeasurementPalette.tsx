import { motion } from 'motion/react';
import { 
  Straighten as RulerIcon, 
  Circle as CircleIcon, 
  CropSquare as SquareIcon, 
  NearMe as MousePointerIcon, 
  ArrowOutward as ArrowIcon, 
  Timeline as SplineIcon,
  Gesture as FreehandIcon,
  Polyline as LivewireIcon,
  CallMade as AnnotationIcon,
  Architecture as AngleIcon,
  LinearScale as CalibrationIcon
} from '@mui/icons-material';
import { GlassPanel } from './ui/glass-panel';
import { Box, Typography, ButtonBase, Grid } from '@mui/material';

const measurementTools = [
  { id: 'length', icon: RulerIcon, label: 'Length' },
  { id: 'bidirectional', icon: MousePointerIcon, label: 'Bidirectional' },
  { id: 'annotation', icon: AnnotationIcon, label: 'Annotation' },
  { id: 'ellipse', icon: CircleIcon, label: 'Ellipse' },
  { id: 'rectangle', icon: SquareIcon, label: 'Rectangle' },
  { id: 'circle', icon: CircleIcon, label: 'Circle' },
  { id: 'freehand', icon: FreehandIcon, label: 'Freehand ROI' },
  { id: 'spline', icon: SplineIcon, label: 'Spline ROI' },
  { id: 'livewire', icon: LivewireIcon, label: 'Livewire tool' },
  { id: 'angle', icon: AngleIcon, label: 'Angle' },
  { id: 'calibration', icon: CalibrationIcon, label: 'Calibration' },
];

export function MeasurementPalette() {
  return (
    <GlassPanel className="mt-4 p-3">
      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, display: 'block', mb: 1.5 }}>
        Measurements
      </Typography>
      <Grid container spacing={1}>
        {measurementTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Grid size={6} key={tool.id}>
              <ButtonBase
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1.5,
                  width: '100%',
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: 'rgba(59, 130, 246, 0.5)',
                  }
                }}
              >
                <Icon sx={{ fontSize: 20, color: 'text.secondary', mb: 0.5, '.group:hover &': { color: 'primary.main' } }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', '.group:hover &': { color: 'text.primary' } }}>
                  {tool.label}
                </Typography>
              </ButtonBase>
            </Grid>
          );
        })}
      </Grid>
    </GlassPanel>
  );
}
