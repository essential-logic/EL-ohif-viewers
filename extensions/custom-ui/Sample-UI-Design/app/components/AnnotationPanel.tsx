
import { motion } from 'motion/react';
import { 
  TextFields as TextIcon,
  NorthEast as ArrowIcon,
  CropSquare as RectangleIcon,
  RadioButtonUnchecked as EllipseIcon,
  Delete as TrashIcon,
  Visibility as EyeIcon,
  VisibilityOff as EyeOffIcon,
  Edit as EditIcon,
  Add as PlusIcon
} from '@mui/icons-material';
import { GlassPanel } from './ui/glass-panel';
import { Box, Typography, IconButton, ButtonBase, Divider } from '@mui/material';

const mockAnnotations = [
  { id: 1, type: 'Text', text: 'Patient ID verified', visible: true, author: 'Dr. Smith' },
  { id: 2, type: 'Arrow', text: 'Possible fracture', visible: true, author: 'Dr. Smith' },
  { id: 3, type: 'Rectangle', visible: false, author: 'AI Assistant' },
];

export function AnnotationPanel() {
  return (
    <GlassPanel className="h-full" sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={500} color="text.primary">Annotations</Typography>
        <IconButton
          component={motion.button}
          whileHover={{ scale: 1.1 }}
          size="small"
          sx={{ bgcolor: 'rgba(59, 130, 246, 0.2)', color: 'primary.main', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.3)' } }}
        >
          <PlusIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Tools */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mb: 3 }}>
        {[
          { icon: TextIcon, label: 'Text' },
          { icon: ArrowIcon, label: 'Arrow' },
          { icon: RectangleIcon, label: 'Rect' },
          { icon: EllipseIcon, label: 'Ellipse' },
        ].map((tool, index) => (
          <ButtonBase
            component={motion.button}
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1,
                borderRadius: 2,
                aspectRatio: '1/1',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s',
                '&:hover': {
                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: 'rgba(59, 130, 246, 0.5)',
                }
            }}
          >
            <tool.icon sx={{ fontSize: 20, color: 'text.secondary', mb: 0.5 }} />
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>{tool.label}</Typography>
          </ButtonBase>
        ))}
      </Box>

      {/* Annotation List */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, display: 'block', mb: 1 }}>
            List
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {mockAnnotations.map((ann, index) => (
            <Box
              component={motion.div}
              key={ann.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {ann.type === 'Text' && <TextIcon sx={{ fontSize: 14, color: 'text.secondary' }} />}
                    {ann.type === 'Arrow' && <ArrowIcon sx={{ fontSize: 14, color: 'text.secondary' }} />}
                    {ann.type === 'Rectangle' && <RectangleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />}
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>{ann.type} {ann.id}</Typography>
                 </Box>
                 <Box sx={{ display: 'flex', gap: 0.5 }}>
                   <IconButton size="small" sx={{ p: 0.5, color: 'text.secondary' }}>
                      {ann.visible ? <EyeIcon fontSize="inherit" sx={{ fontSize: 14 }} /> : <EyeOffIcon fontSize="inherit" sx={{ fontSize: 14 }} />}
                   </IconButton>
                   <IconButton size="small" sx={{ p: 0.5, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                      <EditIcon fontSize="inherit" sx={{ fontSize: 14 }} />
                   </IconButton>
                 </Box>
              </Box>
              
              {ann.text && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic', pl: 3, mb: 0.5 }}>
                   "{ann.text}"
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', pt: 0.5, mt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6rem' }}>
                    {ann.author}
                  </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </GlassPanel>
  );
}
