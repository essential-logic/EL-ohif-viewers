import React from 'react';
import { motion } from 'framer-motion';
import {
  Person as UserIcon,
  CalendarToday as CalendarIcon,
  Description as FileTextIcon,
  MonitorHeart as ActivityIcon,
} from '@mui/icons-material';
import { GlassPanel } from './GlassPanel';
import { Box, Typography, Divider } from '@mui/material';

const patientData = {
  name: 'John Doe',
  id: 'PT-2026-001234',
  age: 45,
  gender: 'Male',
  studyDate: 'Feb 15, 2026',
  modality: 'CT',
  bodyPart: 'Chest',
  studyDescription: 'Chest CT with Contrast',
};

const imageMetadata = [
  { label: 'Series', value: '2/5' },
  { label: 'Instance', value: '45/128' },
  { label: 'Slice Thickness', value: '1.25 mm' },
  { label: 'Pixel Spacing', value: '0.68 mm' },
  { label: 'Image Size', value: '512 × 512' },
  { label: 'Window Center', value: '40 HU' },
  { label: 'Window Width', value: '400 HU' },
  { label: 'Rescale Slope', value: '1.0' },
];

export function ImageInfo() {
  return (
    <GlassPanel sx={{ height: '100%', overflowY: 'auto', p: 2 }}>
      {/* Patient Information */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <UserIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography
            variant="subtitle2"
            fontWeight={600}
            color="text.primary"
          >
            Patient Information
          </Typography>
        </Box>
        <Divider sx={{ mb: 2, borderColor: 'primary.main', opacity: 0.3 }} />

        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 0 10px rgba(59,130,246,0.1)',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                display: 'block',
              }}
            >
              Name
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ color: 'text.primary' }}
            >
              {patientData.name}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(auto-fit, minmax(80px, 1fr))',
                sm: 'repeat(3, 1fr)',
              },
              gap: 1.5,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block' }}
              >
                ID
              </Typography>
              <Typography
                variant="caption"
                fontWeight={500}
                color="primary"
                sx={{ wordBreak: 'break-all' }}
              >
                {patientData.id}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block' }}
              >
                Age
              </Typography>
              <Typography
                variant="caption"
                fontWeight={500}
              >
                {patientData.age}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block' }}
              >
                Gender
              </Typography>
              <Typography
                variant="caption"
                fontWeight={500}
              >
                {patientData.gender}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Study Information */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <FileTextIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography
            variant="subtitle2"
            fontWeight={600}
            color="text.primary"
          >
            Study Details
          </Typography>
        </Box>
        <Divider sx={{ mb: 2, borderColor: 'primary.main', opacity: 0.3 }} />

        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              borderRadius: 1.5,
              bgcolor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <CalendarIcon sx={{ fontSize: 14, color: 'success.main' }} />
            <Typography
              variant="caption"
              sx={{ color: 'text.primary' }}
            >
              {patientData.studyDate}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              borderRadius: 1.5,
              bgcolor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <ActivityIcon sx={{ fontSize: 14, color: 'warning.main' }} />
            <Typography
              variant="caption"
              sx={{ color: 'warning.main' }}
            >
              {patientData.modality}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              mt: 1,
              bgcolor: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'secondary.main',
                opacity: 0.7,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                display: 'block',
              }}
            >
              Description
            </Typography>
            <Typography
              variant="caption"
              sx={{ display: 'block', color: 'secondary.light', fontWeight: 500 }}
            >
              {patientData.studyDescription}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Image Metadata */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <FileTextIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography
            variant="subtitle2"
            fontWeight={600}
            color="text.primary"
          >
            Image Metadata
          </Typography>
        </Box>
        <Divider sx={{ mb: 2, borderColor: 'primary.main', opacity: 0.3 }} />

        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
        >
          {imageMetadata.map((item, index) => (
            <Box
              component={motion.div}
              key={item.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1,
                borderRadius: 1.5,
                bgcolor: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
              >
                {item.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'primary.main', fontFamily: 'monospace' }}
              >
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* AI Analysis Badge */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 3,
          background:
            'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(139, 92, 246, 0.1) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.primary"
          >
            AI Analysis Active
          </Typography>
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Neural network processing enabled.
        </Typography>
      </Box>
    </GlassPanel>
  );
}
