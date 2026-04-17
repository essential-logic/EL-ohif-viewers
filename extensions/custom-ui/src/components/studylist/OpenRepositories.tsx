import React, { memo } from 'react';
import { Box, Typography, Card, CardActionArea, Chip, Stack } from '@mui/material';
import { Cloud as CloudIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';

interface Repository {
  name: string;
  description: string;
  url: string;
  tag: string;
  tagColor: string;
  studies?: string;
}

const OPEN_REPOSITORIES: Repository[] = [
  {
    name: 'TCIA — The Cancer Imaging Archive',
    description:
      'Largest public repository of de-identified cancer imaging data. Thousands of real CT, MRI, and PET studies.',
    url: 'https://www.cancerimagingarchive.net/collections/',
    tag: 'Cancer / Research',
    tagColor: '#ef4444',
    studies: '70+ Collections',
  },
  {
    name: 'OHIF Public Demo Server',
    description:
      'Official OHIF Viewer sample studies. Includes MRI, CT, and DICOM-SEG datasets for testing the viewer.',
    url: 'https://viewer.ohif.org',
    tag: 'Demo',
    tagColor: '#3b82f6',
    studies: 'Multiple Types',
  },
  {
    name: 'Radiopaedia Case Library',
    description:
      'Clinical radiology cases contributed by radiologists worldwide. Excellent for educational use.',
    url: 'https://radiopaedia.org/cases',
    tag: 'Education',
    tagColor: '#10b981',
    studies: '35,000+ Cases',
  },
  {
    name: 'OpenNeuro — Neuroimaging',
    description:
      'Free and open database of MRI, fMRI, EEG, MEG, and iEEG datasets from brain research studies.',
    url: 'https://openneuro.org',
    tag: 'Neurology',
    tagColor: '#a855f7',
    studies: '900+ Datasets',
  },
  {
    name: 'NCI LIDC-IDRI (Lung CT)',
    description:
      'Lung Image Database Consortium — annotated thoracic CT scans for lung nodule detection research.',
    url: 'https://wiki.cancerimagingarchive.net/display/Public/LIDC-IDRI',
    tag: 'Lung / CT',
    tagColor: '#f59e0b',
    studies: '1,018 Cases',
  },
  {
    name: 'Imaging Data Commons (IDC)',
    description:
      'Cloud-native platform for hosting and searching de-identified clinical and research DICOM data on Google Cloud.',
    url: 'https://imaging.datacommons.cancer.gov/',
    tag: 'Cloud / Multi-modal',
    tagColor: '#0ea5e9',
    studies: '40+ TB Data',
  },
  {
    name: 'NIH Dataset Catalog',
    description:
      'The National Institutes of Health collection of de-identified medical imaging for research and AI training.',
    url: 'https://www.nih.gov/news-events/news-releases/nih-harnesses-ai-medical-imaging-detection-covid-19',
    tag: 'NIH / Research',
    tagColor: '#6366f1',
    studies: 'Vast Collection',
  },
  {
    name: 'MIDRC — COVID-19 Archive',
    description:
      'Medical Imaging and Data Resource Center — a rapid-response archive for COVID-19 related imaging data.',
    url: 'https://www.midrc.org/open-discovery-data',
    tag: 'COVID-19 / Stats',
    tagColor: '#ec4899',
    studies: '100,000+ Images',
  },
  {
    name: 'Grand Challenge Datasets',
    description:
      'Platform for end-to-end development of machine learning solutions in biomedical imaging. Large-scale challenges.',
    url: 'https://grand-challenge.org/data/',
    tag: 'AI / Challenges',
    tagColor: '#14b8a6',
    studies: 'Various Organ Sets',
  },
  {
    name: 'Synapse DICOM Repository',
    description:
      'Open biomedical data repository managed by Sage Bionetworks. Houses genomics and imaging datasets.',
    url: 'https://www.synapse.org/#!Synapse:syn300013',
    tag: 'Multi-modal',
    tagColor: '#22d3ee',
    studies: 'Varies',
  },
  {
    name: 'OASIS — Brain MRI',
    description:
      'Open Access Series of Imaging Studies. Large-scale longitudinal brain MRI datasets for aging and Alzheimer research.',
    url: 'https://www.oasis-brains.org/',
    tag: 'Brain / Aging',
    tagColor: '#8b5cf6',
    studies: '1,000+ Subjects',
  },
  {
    name: 'TCIA — COVID-19 Collections',
    description:
      'Specific collections of chest CT and X-ray images for patient diagnosis and research on COVID-19 impacts.',
    url: 'https://wiki.cancerimagingarchive.net/display/Public/CT+Images+in+COVID-19',
    tag: 'COVID-19 / Lung',
    tagColor: '#ef4444',
    studies: 'Various Sources',
  },
  {
    name: 'FastMRI — Knee & Brain',
    description:
      'Open-source dataset of raw k-space data and DICOM images for accelerating MRI reconstruction using AI.',
    url: 'https://fastmri.org/',
    tag: 'MRI / Raw Data',
    tagColor: '#3b82f6',
    studies: '7,000+ Studies',
  },
];

export const OpenRepositories = memo(function OpenRepositories() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, height: '100%', overflowY: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <CloudIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
          <Typography
            variant="h5"
            fontWeight={800}
            color="text.primary"
          >
            Open DICOM Repositories
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Browse publicly available DICOM imaging datasets from trusted medical institutions and
          research archives. Click any repository to open it in a new tab.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 2.5,
        }}
      >
        {OPEN_REPOSITORIES.map(repo => (
          <Card
            key={repo.name}
            sx={{
              bgcolor: 'rgba(30, 41, 59, 0.45)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 3,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(30, 41, 59, 0.65)',
                border: `1px solid ${repo.tagColor}44`,
                transform: 'translateY(-3px)',
                boxShadow: `0 12px 32px rgba(0,0,0,0.5), 0 0 20px ${repo.tagColor}22`,
              },
            }}
          >
            <CardActionArea
              onClick={() => window.open(repo.url, '_blank', 'noopener,noreferrer')}
              sx={{
                p: 2.5,
                '&:hover': { bgcolor: 'transparent' },
                height: '100%',
                alignItems: 'flex-start',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack
                spacing={1.5}
                sx={{ width: '100%' }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="text.primary"
                    sx={{ lineHeight: 1.3 }}
                  >
                    {repo.name}
                  </Typography>
                  <OpenInNewIcon
                    sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0, mt: 0.3 }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}
                >
                  {repo.description}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mt: 'auto',
                  }}
                >
                  <Chip
                    label={repo.tag}
                    size="small"
                    sx={{
                      bgcolor: `${repo.tagColor}18`,
                      color: repo.tagColor,
                      border: `1px solid ${repo.tagColor}44`,
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  />
                  {repo.studies && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.disabled', fontWeight: 600 }}
                    >
                      {repo.studies}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
});
