import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Download as DownloadIcon, 
  Upload as UploadIcon, 
  Share as ShareIcon, 
  Print as PrintIcon, 
  GridView as GridIcon,
  Fullscreen as MaximizeIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { Box, Typography, IconButton, Paper, Divider } from '@mui/material';

export function ViewerHeader() {
  return (
    <Box
      component={motion.header}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ 
          p: 2, 
          borderRadius: 3, 
          bgcolor: 'rgba(255, 255, 255, 0.05)', 
          backdropFilter: 'blur(20px)', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          boxShadow: 4 
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo & Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
              p: 1, 
              borderRadius: 2, 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))', 
              border: '1px solid rgba(96, 165, 250, 0.5)', 
              boxShadow: '0 0 20px rgba(59,130,246,0.4)',
              display: 'flex'
          }}>
            <GridIcon sx={{ color: '#60a5fa' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ 
                background: 'linear-gradient(to right, #60a5fa, #93c5fd, #3b82f6)', 
                backgroundClip: 'text', 
                color: 'transparent',
                fontWeight: 700,
                lineHeight: 1.2
            }}>
              DICOM Viewer Pro
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Premium Medical Imaging Platform</Typography>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {[UploadIcon, DownloadIcon, ShareIcon, PrintIcon].map((Icon, index) => (
             <IconButton
               component={motion.button}
               key={index}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               sx={{ 
                   p: 1, 
                   borderRadius: 2, 
                   bgcolor: 'rgba(255, 255, 255, 0.1)', 
                   border: '1px solid rgba(255, 255, 255, 0.2)',
                   color: 'rgba(255, 255, 255, 0.6)',
                   '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(96, 165, 250, 0.5)', color: '#60a5fa' }
               }}
             >
               <Icon fontSize="small" />
             </IconButton>
          ))}

          <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

          <IconButton
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            sx={{ 
                p: 1, 
                borderRadius: 2, 
                bgcolor: 'rgba(255, 255, 255, 0.1)', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'rgba(255, 255, 255, 0.6)',
                '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(96, 165, 250, 0.5)', color: '#60a5fa' }
            }}
          >
            <MaximizeIcon fontSize="small" />
          </IconButton>

          <IconButton
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            sx={{ 
                p: 1, 
                borderRadius: 2, 
                bgcolor: 'rgba(255, 255, 255, 0.1)', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'rgba(255, 255, 255, 0.6)',
                '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(96, 165, 250, 0.5)', color: '#60a5fa' }
            }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>

          <IconButton
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            sx={{ 
                p: 1, 
                borderRadius: 2, 
                background: 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
                border: '1px solid rgba(96, 165, 250, 0.5)', 
                color: '#60a5fa',
                boxShadow: '0 0 15px rgba(59,130,246,0.3)',
                '&:hover': { background: 'linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))' }
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}