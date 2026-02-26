import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Person as UserIcon,
  CalendarToday as CalendarIcon,
  Description as FileTextIcon,
  MonitorHeart as ActivityIcon,
} from '@mui/icons-material';
import { GlassPanel } from './GlassPanel';
import { Box, Typography, Divider } from '@mui/material';

interface ImageInfoProps {
  servicesManager?: any;
}

export function ImageInfo({ servicesManager }: ImageInfoProps) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!servicesManager) {
      return;
    }

    const { viewportGridService, displaySetService } = servicesManager.services;

    const updateData = () => {
      const { activeViewportId, viewports } = viewportGridService.getState();

      // Fallback to first viewport if no active one is set yet (common on initial load)
      let viewportIdToUse = activeViewportId;
      if (!viewportIdToUse && viewports.size > 0) {
        viewportIdToUse = viewports.keys().next().value;
      }

      const activeViewport = viewports.get(viewportIdToUse);

      if (
        !activeViewport ||
        !activeViewport.displaySetInstanceUIDs ||
        activeViewport.displaySetInstanceUIDs.length === 0
      ) {
        return;
      }

      const displaySetInstanceUID = activeViewport.displaySetInstanceUIDs[0];
      const displaySet = displaySetService.getDisplaySetByUID(displaySetInstanceUID);

      if (!displaySet) {
        return;
      }

      // ... rest of formatting ...
      const formatPN = (name: any) => {
        if (!name) {
          return 'N/A';
        }
        if (typeof name === 'string') {
          return name.replace(/\^/g, ' ');
        }
        if (name.Alphabetic) {
          return name.Alphabetic.replace(/\^/g, ' ');
        }
        return 'N/A';
      };

      const formatDate = (date: string) => {
        if (!date) {
          return 'N/A';
        }
        const y = date.substring(0, 4);
        const m = date.substring(4, 6);
        const d = date.substring(6, 8);
        const monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        const monthIndex = parseInt(m) - 1;
        if (monthIndex < 0 || monthIndex > 11) {
          return date;
        }
        return `${monthNames[monthIndex]} ${parseInt(d)}, ${y}`;
      };

      const instance = displaySet.instance || (displaySet.instances && displaySet.instances[0]);

      if (!instance) {
        return;
      }

      const allDisplaySets = displaySetService.getDisplaySetsForSeries(instance.StudyInstanceUID);
      const totalSeries = allDisplaySets ? allDisplaySets.length : 'N/A';
      const seriesIndex = allDisplaySets
        ? allDisplaySets.findIndex(ds => ds.displaySetInstanceUID === displaySetInstanceUID) + 1
        : 'N/A';
      const totalInstances =
        displaySet.numImageFrames || (displaySet.instances ? displaySet.instances.length : 1);
      const instanceIndex = instance.InstanceNumber || '1';

      setData({
        patient: {
          name: formatPN(instance.PatientName),
          id: instance.PatientID || 'N/A',
          age: instance.PatientAge || 'N/A',
          gender: instance.PatientSex || 'N/A',
        },
        study: {
          date: formatDate(instance.StudyDate),
          modality: instance.Modality || 'N/A',
          description: instance.StudyDescription || 'No Description',
        },
        image: {
          series: seriesIndex,
          totalSeries: totalSeries,
          instanceNum: instanceIndex,
          totalInstances: totalInstances,
          thickness: instance.SliceThickness ? `${instance.SliceThickness} mm` : 'N/A',
          pixelSpacing:
            instance.PixelSpacing && Array.isArray(instance.PixelSpacing)
              ? `${instance.PixelSpacing[0].toFixed(2)} / ${instance.PixelSpacing[1].toFixed(2)} mm`
              : 'N/A',
        },
      });
    };

    // Initial load
    updateData();

    // Subscribe to viewport changes and grid state
    const subs = [
      viewportGridService.subscribe(
        viewportGridService.EVENTS.ACTIVE_VIEWPORT_ID_CHANGED,
        updateData
      ),
      viewportGridService.subscribe(viewportGridService.EVENTS.GRID_STATE_CHANGED, updateData),
    ];

    // Listen to cornerstone image changes
    let currentElement: any = null;
    const { cornerstoneViewportService } = servicesManager.services;

    const onNewImage = () => updateData();

    const setupElementListener = () => {
      const { activeViewportId, viewports } = viewportGridService.getState();
      let idToUse = activeViewportId;
      if (!idToUse && viewports.size > 0) {
        idToUse = viewports.keys().next().value;
      }

      const viewportInfo = cornerstoneViewportService.getViewportInfo(idToUse);
      const element = viewportInfo?.getElement();

      if (currentElement && currentElement !== element) {
        currentElement.removeEventListener('cornerstone_stack_new_image', onNewImage);
        currentElement.removeEventListener('cornerstone_volume_new_image', onNewImage);
        currentElement.removeEventListener('cornerstone_image_rendered', onNewImage);
      }

      if (element && currentElement !== element) {
        currentElement = element;
        element.addEventListener('cornerstone_stack_new_image', onNewImage);
        element.addEventListener('cornerstone_volume_new_image', onNewImage);
        element.addEventListener('cornerstone_image_rendered', onNewImage);
      }
    };

    const unsubGrid = viewportGridService.subscribe(
      viewportGridService.EVENTS.ACTIVE_VIEWPORT_ID_CHANGED,
      setupElementListener
    );
    const unsubGrid2 = viewportGridService.subscribe(
      viewportGridService.EVENTS.GRID_STATE_CHANGED,
      setupElementListener
    );

    setupElementListener();

    // Fallback timer if initial state is delayed
    const timer = setTimeout(updateData, 500);

    return () => {
      subs.forEach(s => s.unsubscribe());
      unsubGrid.unsubscribe();
      unsubGrid2.unsubscribe();
      clearTimeout(timer);
      if (currentElement) {
        currentElement.removeEventListener('cornerstone_stack_new_image', onNewImage);
        currentElement.removeEventListener('cornerstone_volume_new_image', onNewImage);
        currentElement.removeEventListener('cornerstone_image_rendered', onNewImage);
      }
    };
  }, [servicesManager]);

  if (!data) {
    return (
      <GlassPanel
        sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', opacity: 0.5 }}
        >
          Select a viewport to see info
        </Typography>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel
      sx={{
        height: '100%',
        overflowY: 'auto',
        p: 1.5,
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={data.patient.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Patient Information */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <UserIcon sx={{ fontSize: 14, color: 'primary.main' }} />
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.primary"
                sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Patient Info
              </Typography>
            </Box>
            <Divider sx={{ mb: 1.5, borderColor: 'rgba(255,255,255,0.05)' }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748b',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    display: 'block',
                    mb: 0.25,
                  }}
                >
                  NAME
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  sx={{ color: '#f8fafc', fontSize: '0.95rem' }}
                >
                  {data.patient.name}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 1,
                }}
              >
                {[
                  { label: 'ID', value: data.patient.id, color: 'primary.main' },
                  { label: 'AGE', value: data.patient.age, color: 'text.primary' },
                  { label: 'GEN', value: data.patient.gender, color: 'text.primary' },
                ].map(item => (
                  <Box key={item.label}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#64748b',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        display: 'block',
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{
                        color: item.color,
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Study Information */}
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <FileTextIcon sx={{ fontSize: 14, color: 'primary.main' }} />
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.primary"
                sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Study Details
              </Typography>
            </Box>
            <Divider sx={{ mb: 1.5, borderColor: 'rgba(255,255,255,0.05)' }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <CalendarIcon sx={{ fontSize: 14, color: '#10b981' }} />
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{ fontSize: '0.8rem', color: '#e2e8f0' }}
                >
                  {data.study.date}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <ActivityIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                <Typography
                  variant="caption"
                  fontWeight={800}
                  sx={{ color: '#f59e0b', fontSize: '0.8rem' }}
                >
                  {data.study.modality}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(139, 92, 246, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.1)',
                  mt: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: '#a78bfa',
                    fontSize: '0.8rem',
                    fontStyle: 'italic',
                    fontWeight: 500,
                  }}
                >
                  &quot;{data.study.description}&quot;
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Image Info */}
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ActivityIcon sx={{ fontSize: 14, color: 'primary.main' }} />
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.primary"
                sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Image Info
              </Typography>
            </Box>
            <Divider sx={{ mb: 1.5, borderColor: 'rgba(255,255,255,0.05)' }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
              {[
                { label: 'Series', value: `${data.image.series}/${data.image.totalSeries}` },
                {
                  label: 'Instance',
                  value: `${data.image.instanceNum}/${data.image.totalInstances}`,
                },
                { label: 'Slice Thickness', value: data.image.thickness },
                { label: 'Pixel Spacing', value: data.image.pixelSpacing },
              ].map(item => (
                <Box
                  key={item.label}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.03)',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 700, mb: 0.25 }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 700 }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* AI Analysis Status */}
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Box
              component={motion.div}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }}
            />
            <Typography
              variant="caption"
              fontWeight={800}
              sx={{ fontSize: '0.65rem', color: '#10b981', letterSpacing: 1 }}
            >
              AI ANALYSIS ACTIVE
            </Typography>
          </Box>
        </motion.div>
      </AnimatePresence>
    </GlassPanel>
  );
}
