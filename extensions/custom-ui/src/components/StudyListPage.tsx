/**
 * StudyListPage — Slim orchestrator (Phase 3 refactor)
 *
 * All heavy sub-components have been extracted into:
 *   ./studylist/Sidebar.tsx
 *   ./studylist/BottomNav.tsx
 *   ./studylist/StudyCard.tsx
 *   ./studylist/NewStudyModal.tsx
 *   ./studylist/OpenRepositories.tsx
 *
 * This file now only handles top-level state, search, data-source switching,
 * and rendering the layout shell. Each child is React.memo'd to minimise
 * unnecessary re-renders when unrelated state changes (e.g. typing in the search
 * bar only re-renders the search input and the study list, NOT the Sidebar).
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  ButtonBase,
  ThemeProvider,
  CssBaseline,
  useTheme,
  useMediaQuery,
  IconButton,
  InputBase,
  Tooltip,
  LinearProgress,
  TextField,
  Divider,
} from '@mui/material';
import { theme } from '../Theme';

import { useAuth } from '../context/AuthContext';
import { Sidebar } from './studylist/Sidebar';
import { BottomNav } from './studylist/BottomNav';
import { StudyCard, Study } from './studylist/StudyCard';
import { OpenRepositories } from './studylist/OpenRepositories';
import { NewStudyModal } from './studylist/NewStudyModal';
import { uploadDICOMToOrthanc, deleteStudy, getUserStorageUsage } from '../lib/studyService';
import { supabase } from '../lib/supabase';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

// ─── Types ──────────────────────────────────────────────────────────────────

interface FilterValues {
  patientName?: string;
  pageNumber?: number;
  [key: string]: string | number | boolean | undefined;
}

interface StudyListPageProps {
  studies: Study[];
  isLoadingData: boolean;
  filterValues: FilterValues;
  setFilterValues: (v: FilterValues) => void;
  onStudyClick: (study: Study) => void;
  onStudyMouseEnter?: (study: Study) => void;
  isOpening?: boolean;
  dataSource?: any;
  onRefresh?: () => void;
}

// ─── Settings Panel ─────────────────────────────────────────────────────────

function SettingsPanel() {
  const { user, handleSignOut } = useAuth();
  
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [isSavingName, setIsSavingName] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Custom UI Dialog States
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; action: () => void } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveName = async () => {
    if (!fullName) return;
    setIsSavingName(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      if (error) throw error;
      showToast('Name updated successfully!');
    } catch (err: any) {
      showToast('Error updating name: ' + err.message, 'error');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email) return;
    setIsUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      showToast('Confirmation email sent! Please check both your current and new email addresses to verify the change.');
    } catch (err: any) {
      showToast('Error updating email: ' + err.message, 'error');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const executeDelete = async () => {
    setIsDeletingAccount(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch('https://xyuxiachrjpcrmiephqa.supabase.co/functions/v1/account-manager', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        const bodyText = await response.text();
        throw new Error(`Edge Function Failed: ${bodyText}`);
      }

      await handleSignOut();
      window.location.reload();
    } catch (err: any) {
      showToast('Error deleting account: ' + err.message, 'error');
      setIsDeletingAccount(false);
    }
  };

  const handleDeleteAccount = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Danger Zone',
      message: 'Are you ABSOLUTELY sure? This deletes ALL data permanently and cannot be recovered.',
      action: async () => {
        setConfirmDialog(null);
        await executeDelete();
      }
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, height: '100%', overflowY: 'auto' }}>
      <Typography
        variant="h5"
        fontWeight={800}
        gutterBottom
        color="text.primary"
      >
        Settings
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Manage your account and application preferences.
      </Typography>

      {/* Account Info */}
      <Box
        sx={{
          p: 3,
          mb: 3,
          bgcolor: 'rgba(30, 41, 59, 0.45)',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.06)',
          maxWidth: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <AccountCircleIcon sx={{ fontSize: 40, color: '#60a5fa' }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body1"
            fontWeight={700}
            color="text.primary"
            noWrap
          >
            {user?.user_metadata?.full_name || 'User'}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
          >
            {user?.email}
          </Typography>
        </Box>
        <Tooltip title="Sign Out">
          <IconButton
            onClick={handleSignOut}
            sx={{
              color: 'error.main',
              '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' },
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        sx={{
          p: 3,
          bgcolor: 'rgba(30, 41, 59, 0.45)',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.06)',
          maxWidth: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Typography variant="h6" color="text.primary" fontWeight={700}>
          Account Details
        </Typography>

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>Full Name</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField 
              size="small" 
              fullWidth 
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              sx={{ 
                input: { color: 'white' }, 
                '& .MuiOutlinedInput-root': { 
                  bgcolor: 'rgba(0,0,0,0.2)',
                  fieldset: { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' }
                } 
              }}
            />
            <ButtonBase 
              onClick={handleSaveName}
              disabled={isSavingName}
              sx={{ px: 3, borderRadius: 1.5, bgcolor: '#3b82f6', color: 'white', fontWeight: 600, '&:hover': { bgcolor: '#2563eb' }, opacity: isSavingName ? 0.7 : 1 }}>
              {isSavingName ? '...' : 'Save'}
            </ButtonBase>
          </Box>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>Email Address</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField 
              size="small" 
              type="email"
              fullWidth 
              value={email}
              onChange={e => setEmail(e.target.value)}
              sx={{ 
                input: { color: 'white' }, 
                '& .MuiOutlinedInput-root': { 
                  bgcolor: 'rgba(0,0,0,0.2)',
                  fieldset: { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' }
                } 
              }}
            />
            <ButtonBase 
              onClick={handleUpdateEmail}
              disabled={isUpdatingEmail}
              sx={{ px: 3, borderRadius: 1.5, bgcolor: '#3b82f6', color: 'white', fontWeight: 600, '&:hover': { bgcolor: '#2563eb' }, opacity: isUpdatingEmail ? 0.7 : 1 }}>
              {isUpdatingEmail ? '...' : 'Update'}
            </ButtonBase>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1 }} />

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem' }}>
            Permanently delete your account and all associated DICOM studies and annotations.
          </Typography>
          <ButtonBase 
            onClick={handleDeleteAccount}
            disabled={isDeletingAccount}
            sx={{ 
              px: 3, py: 1.25, borderRadius: 2, 
              bgcolor: 'rgba(239, 68, 68, 0.1)', 
              color: 'error.main', 
              fontWeight: 600, 
              fontSize: '0.875rem',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              '&:hover': { bgcolor: 'error.main', color: 'white', borderColor: 'error.main' },
              opacity: isDeletingAccount ? 0.6 : 1,
            }}
          >
            {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
          </ButtonBase>
        </Box>
      </Box>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{
              position: 'fixed',
              bottom: 32,
              left: '50%',
              transform: 'translateX(-50%)',
              background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: 8,
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              border: `1px solid ${toast.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
              backdropFilter: 'blur(10px)',
              zIndex: 99999,
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmDialog?.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: 16,
            }}
            onClick={() => setConfirmDialog(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 420,
                backgroundColor: 'rgb(15, 23, 42)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.1)',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
              }}
            >
              <Box sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={800} color="text.primary" gutterBottom>
                  {confirmDialog.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6, fontSize: '0.95rem' }}>
                  {confirmDialog.message}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <ButtonBase
                    onClick={() => setConfirmDialog(null)}
                    sx={{
                      px: 3,
                      py: 1.25,
                      borderRadius: 2,
                      color: 'text.primary',
                      fontWeight: 600,
                      bgcolor: 'rgba(255,255,255,0.05)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    Cancel
                  </ButtonBase>
                  <ButtonBase
                    onClick={confirmDialog.action}
                    sx={{
                      px: 3,
                      py: 1.25,
                      borderRadius: 2,
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: 'rgb(239, 68, 68)',
                      fontWeight: 700,
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      '&:hover': {
                        background: 'rgb(239, 68, 68)',
                        color: 'white',
                      },
                    }}
                  >
                    Yes, I'm sure
                  </ButtonBase>
                </Box>
              </Box>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

// ─── Inner page (requires auth) ─────────────────────────────────────────────

export function StudyListPage({
  studies,
  isLoadingData,
  filterValues,
  setFilterValues,
  onStudyClick,
  onStudyMouseEnter,
  onRefresh,
  dataSource,
  isOpening = false,
}: StudyListPageProps) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState(filterValues.patientName || '');
  const lastSentValue = useRef(filterValues.patientName || '');
  
  // Initialize activeNav based on current data source
  const [activeNav, setActiveNav] = useState(() => {
    if (filterValues.datasources === 'ohif') {
      return 'aws-public';
    }
    return 'patients';
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, status: '' });

  const [studyToDelete, setStudyToDelete] = useState<Study | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Storage usage tracking
  const [storageUsedBytes, setStorageUsedBytes] = useState<number | null>(null);

  useEffect(() => {
    // When viewing private studies (which re-loads on upload/delete), fetch quota details
    if (activeNav === 'patients') {
      getUserStorageUsage()
        .then(bytes => setStorageUsedBytes(bytes))
        .catch(err => console.error('[StudyListPage] Failed to fetch storage stats:', err));
    }
  }, [activeNav, studies]);

  // ─── Search ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (filterValues.patientName !== lastSentValue.current) {
      setLocalSearch(filterValues.patientName || '');
      lastSentValue.current = filterValues.patientName || '';
    }
  }, [filterValues.patientName]);

  // Debounce server-side filter call
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterValues({ ...filterValues, patientName: localSearch, pageNumber: 1 });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = e.target.value;
      setLocalSearch(val);
      lastSentValue.current = val;
    },
    []
  );

  // Client-side fast filter — searches AND (for My PACS only) restricts to user-owned studies.
  // Public Demo and other data sources show all studies unfiltered.
  const filteredStudies = useMemo(() => {
    let base = studies;

    // Server-side filtering via proxy ensures only allowed studies are returned.
    base = studies;

    if (!localSearch.trim()) {
      return base;
    }
    const q = localSearch.trim().toLowerCase();
    return base.filter(s => {
      const name = String(s.patientName || '').toLowerCase();
      const id = String(s.mrn || '').toLowerCase();
      const desc = String(s.studyDescription || '').toLowerCase();
      return name.includes(q) || id.includes(q) || desc.includes(q);
    });
  }, [studies, localSearch]);

  // ─── Extended Sidebar nav (includes repositories) ───────────────────────

  const handleNavChange = useCallback(
    (id: string) => {
      setActiveNav(id);
      if (id === 'aws-public') {
        navigate('/?datasources=ohif');
      } else if (id === 'patients') {
        navigate('/?datasources=orthanc');
      }
    },
    [navigate]
  );

  const handleUploadSubmit = async (data: {
    patientName: string;
    studyDescription: string;
    studyDate: string;
    files: File[];
  }) => {
    if (!dataSource || isUploading) {
      return;
    }

    setIsUploading(true);
    try {
      const config = dataSource.getConfig();
      const orthancRoot = config.wadoRoot || config.qidoRoot || '/dicom-web';

      const result = await uploadDICOMToOrthanc(
        data.files,
        orthancRoot,
        {
          patientName: data.patientName,
          studyDescription: data.studyDescription,
          studyDate: data.studyDate,
        },
        undefined,
        progress => setUploadProgress(progress)
      );

      if (result.errors.length > 0) {
        console.warn('[StudyListPage] Some files failed to upload:', result.errors);
      }

      // Success! Give Orthanc 1500ms to index the study
      await new Promise(r => setTimeout(r, 1500));
      setIsUploadModalOpen(false);

      // Explicitly update the quota counter for immediate frontend reactivity
      getUserStorageUsage().then(setStorageUsedBytes).catch(console.error);

      window.dispatchEvent(new CustomEvent('ohif-studies-updated'));
    } catch (err) {
      console.error('[StudyListPage] Upload failed:', err);
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0, status: '' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studyToDelete || !dataSource || isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      const config = dataSource.getConfig();
      const orthancRoot = config.wadoRoot || config.qidoRoot || '/dicom-web';

      await deleteStudy(studyToDelete.studyInstanceUid!, orthancRoot);

      // Success!
      setStudyToDelete(null);

      // Explicitly update the quota counter for immediate frontend reactivity
      getUserStorageUsage().then(setStorageUsedBytes).catch(console.error);

      if (typeof onRefresh === 'function') {
        onRefresh();
      }
    } catch (err) {
      console.error('[StudyListPage] Deletion failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          height: '100vh',
          width: '100%',
          bgcolor: 'background.default',
          color: 'text.primary',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          position: 'relative',
          p: isMobile ? 1.5 : 2,
          pb: isMobile ? 10 : 2,
          gap: isMobile ? 1.5 : 2,
        }}
      >
        {/* High-Performance Background Glows (Radial Gradients instead of Blur) */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            // Promote to its own compositor layer
            willChange: 'transform',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '-15%',
              left: '-10%',
              width: '50%',
              height: '50%',
              // PERFORMANCE: Radial gradient is 100x faster than CSS blur()
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'el-orb 12s ease-in-out infinite',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '-15%',
              right: '-10%',
              width: '50%',
              height: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'el-orb 12s ease-in-out infinite',
              animationDelay: '6s',
            }}
          />
          <style>{`
            @keyframes el-orb {
              0%, 100% { transform: translate(0, 0) scale(1); }
              50% { transform: translate(2%, 2%) scale(1.05); }
            }
          `}</style>
        </Box>

        {/* Sidebar (desktop) */}
        {!isMobile && (
          <Box sx={{ position: 'relative', zIndex: 1000 }}>
            <motion.div
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{ height: '100%' }}
            >
              <Sidebar
                activeNav={activeNav}
                onNavChange={handleNavChange}
                onSettingsOpen={() => setActiveNav('settings')}
                isLoading={isLoadingData}
                storageUsedBytes={storageUsedBytes}
              />
            </motion.div>
          </Box>
        )}

        {/* Main content */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1000,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {activeNav === 'patients' || activeNav === 'aws-public' ? (
            <>
              {/* Header row */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'stretch' : 'flex-start',
                  mb: 2.5,
                  gap: isMobile ? 2 : 0,
                  flexShrink: 0,
                }}
              >
                <Box>
                  <Typography
                    variant={isMobile ? 'h6' : 'h5'}
                    fontWeight={700}
                    color="text.primary"
                  >
                    Study List
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  >
                    Manage and view patient imaging studies
                  </Typography>
                </Box>

                {!isMobile && activeNav === 'patients' && (
                  <ButtonBase
                    component={motion.button as React.ElementType}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsUploadModalOpen(true)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 3.5,
                      py: 1.75,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 22 }} />
                    <Typography
                      variant="body1"
                      fontWeight={700}
                    >
                      Upload Study
                    </Typography>
                  </ButtonBase>
                )}
              </Box>

              {/* Search bar */}
              <Box
                component={motion.div}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 1.5 }}
              >
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    px: 2.5,
                    height: 52,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:focus-within': {
                      bgcolor: 'rgba(15, 23, 42, 0.75)',
                      borderColor: 'rgba(255, 255, 255, 0.18)',
                    },
                  }}
                >
                  <SearchIcon sx={{ color: 'primary.main', mr: 1.5, fontSize: 22, opacity: 0.8 }} />
                  <InputBase
                    id="study-list-search"
                    fullWidth
                    placeholder="Search patients, studies, or IDs..."
                    value={localSearch}
                    onChange={handleSearchChange}
                    sx={{
                      color: 'white',
                      fontSize: '0.95rem',
                      '& .MuiInputBase-input': {
                        p: 0,
                        '&::placeholder': { color: 'rgba(255, 255, 255, 0.4)', opacity: 1 },
                      },
                    }}
                  />
                  {localSearch && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setLocalSearch('');
                        lastSentValue.current = '';
                        setFilterValues({ ...filterValues, patientName: '', pageNumber: 1 });
                      }}
                      sx={{ color: 'rgba(255, 255, 255, 0.3)', '&:hover': { color: 'white' } }}
                    >
                      <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  )}
                </Box>
                <ButtonBase
                  component={motion.button as React.ElementType}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  sx={{
                    height: 52,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 3,
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'white',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  <FilterIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>Filters</Typography>
                </ButtonBase>
              </Box>

              {/* Study cards list */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  pr: 0.5,
                  '&::-webkit-scrollbar': { width: 5 },
                  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderRadius: 3,
                  },
                }}
              >
                {isLoadingData ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {Array(6)
                      .fill(0)
                      .map((_, i) => (
                        <Box
                          key={i}
                          sx={{
                            height: 110,
                            borderRadius: 3,
                            bgcolor: 'rgba(30,41,59,0.3)',
                            animation: 'shimmer 1.5s infinite',
                          }}
                        />
                      ))}
                    <style>{`@keyframes shimmer { 0% { opacity: 0.4; } 50% { opacity: 0.7; } 100% { opacity: 0.4; } }`}</style>
                  </Box>
                ) : (
                  <>
                    {!filteredStudies || filteredStudies.length === 0 ? (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '60vh',
                          textAlign: 'center',
                          px: 3,
                        }}
                      >
                        {localSearch ? (
                          // ─── Case: Search returned nothing ─────────────────
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 16,
                            }}
                          >
                            <Box
                              sx={{
                                p: 3,
                                borderRadius: '50%',
                                bgcolor: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                color: 'text.disabled',
                              }}
                            >
                              <SearchIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                            </Box>
                            <Box>
                              <Typography
                                variant="h6"
                                fontWeight={700}
                                color="text.primary"
                              >
                                No matches found
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1, maxWidth: 300 }}
                              >
                                We couldn&apos;t find any studies matching &quot;<strong>{localSearch}</strong>&quot;. Check the spelling or try a different term.
                              </Typography>
                            </Box>
                            <ButtonBase
                              onClick={() => {
                                setLocalSearch('');
                                setFilterValues({
                                  ...filterValues,
                                  patientName: '',
                                  pageNumber: 1,
                                });
                              }}
                              sx={{
                                mt: 1,
                                px: 3,
                                py: 1,
                                borderRadius: 2,
                                color: 'primary.main',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                '&:hover': { bgcolor: 'rgba(59,130,246,0.08)' },
                              }}
                            >
                              Clear Search
                            </ButtonBase>
                          </motion.div>
                        ) : (
                          // ─── Case: Actually empty (Read-Only Message) ──────────
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            style={{
                              maxWidth: 640,
                              width: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              textAlign: 'center',
                            }}
                          >
                            <Box
                              sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '24px',
                                bgcolor: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'text.disabled',
                                mb: 5,
                              }}
                            >
                              <SearchIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                            </Box>

                            <Typography
                              variant="h4"
                              fontWeight={800}
                              gutterBottom
                              sx={{
                                background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.02em',
                              }}
                            >
                              {activeNav === 'aws-public' ? 'No public studies found' : 'No studies available.'}
                            </Typography>
                            <Typography
                              variant="body1"
                              color="text.secondary"
                              sx={{ mb: 6, fontSize: '1.1rem', maxWidth: 480, lineHeight: 1.6 }}
                            >
                              {activeNav === 'aws-public'
                                ? "We couldn't retrieve any public studies from the cloud repository at this moment."
                                : "Your clinical study list is currently empty. Please contact your system administrator to have studies assigned to your account."}
                            </Typography>

                            <ButtonBase
                              onClick={() => typeof onRefresh === 'function' && onRefresh()}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                px: 4,
                                py: 1.75,
                                borderRadius: 3,
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                                '&:hover': {
                                  bgcolor: 'rgba(255,255,255,0.1)',
                                  borderColor: 'rgba(255,255,255,0.2)',
                                },
                                transition: 'all 0.2s',
                              }}
                            >
                              <RefreshIcon sx={{ mr: 1, fontSize: 20 }} />
                              Refresh List
                            </ButtonBase>
                          </motion.div>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {filteredStudies.map((study, index) => (
                          <StudyCard
                            key={study.studyInstanceUid || index}
                            study={study}
                            index={index}
                            isMobile={isMobile}
                            onClick={() => onStudyClick(study)}
                            onDelete={activeNav === 'patients' ? setStudyToDelete : undefined}
                            onMouseEnter={() => onStudyMouseEnter?.(study)}
                          />
                        ))}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </>
          ) : activeNav === 'repositories' ? (
            <OpenRepositories />
          ) : (
            <SettingsPanel />
          )}
        </Box>

        {/* Mobile Bottom Nav */}
        {isMobile && (
          <BottomNav
            activeNav={activeNav}
            onNavChange={handleNavChange}
          />
        )}

        {/* Instant Study Opening Overlay */}
        <AnimatePresence>
          {isOpening && (
            <motion.div
              key="opening-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(8, 13, 26, 0.8)',
                backdropFilter: 'blur(16px)',
                cursor: 'wait',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: 70,
                    height: 70,
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      border: '3px solid rgba(59, 130, 246, 0.1)',
                      borderTop: '3px solid #3b82f6',
                    }}
                  />
                  <motion.div
                    animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute',
                      inset: '10%',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
                    }}
                  />
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    sx={{
                      background: 'linear-gradient(to right, #3b82f6, #93c5fd)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 0.5,
                    }}
                  >
                    Preparing Viewer
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ letterSpacing: 1.5, opacity: 0.7, fontWeight: 600, fontSize: '0.75rem' }}
                  >
                    OPTIMIZING MEDICAL METADATA
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Progress Overlay */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              style={{
                position: 'fixed',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10000,
                width: 320,
              }}
            >
              <Box
                sx={{
                  bgcolor: 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: 4,
                  p: 2.5,
                  boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color="primary.main"
                  sx={{ display: 'block', mb: 1, letterSpacing: 1 }}
                >
                  UPLOADING STUDY...
                </Typography>
                <Typography
                  variant="body2"
                  color="text.primary"
                  fontWeight={600}
                  noWrap
                  sx={{ mb: 1.5 }}
                >
                  {uploadProgress.status || 'Uploading files...'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={
                      uploadProgress.total > 0
                        ? (uploadProgress.current / uploadProgress.total) * 100
                        : 0
                    }
                    sx={{
                      flex: 1,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.05)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(to right, #3b82f6, #93c5fd)',
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="text.secondary"
                  >
                    {uploadProgress.current}/{uploadProgress.total}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Upload Modal */}
        <NewStudyModal
          open={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSubmit={handleUploadSubmit}
          isUploading={isUploading}
        />

        {/* Delete Confirmation Dialog */}
        <AnimatePresence>
          {studyToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20000,
                padding: 16,
              }}
              onClick={() => !isDeleting && setStudyToDelete(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: 400,
                  backgroundColor: 'rgb(15, 23, 42)',
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.1)',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                }}
              >
                <Box sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color="text.primary"
                    gutterBottom
                  >
                    Confirm Deletion
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    Are you sure you want to remove study for{' '}
                    <strong>{studyToDelete.patientName || 'Anonymous'}</strong>? This action will
                    permanently delete the images from the PACS server and cannot be undone.
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <ButtonBase
                      onClick={() => setStudyToDelete(null)}
                      disabled={isDeleting}
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: '8px',
                        color: 'text.secondary',
                        fontWeight: 600,
                        '&:hover': { color: 'text.primary' },
                      }}
                    >
                      Cancel
                    </ButtonBase>
                    <ButtonBase
                      onClick={handleDeleteConfirm}
                      disabled={isDeleting}
                      sx={{
                        px: 2.5,
                        py: 1,
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'rgb(239, 68, 68)',
                        fontWeight: 700,
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        '&:hover': {
                          background: 'rgb(239, 68, 68)',
                          color: 'white',
                          boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
                        },
                        '&:disabled': { opacity: 0.5 },
                      }}
                    >
                      {isDeleting ? 'Deleting...' : 'Remove Study'}
                    </ButtonBase>
                  </Box>
                </Box>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </ThemeProvider>
  );
}

// ─── Public export ───────────────────────────────────────────────────────────
// Auth is now handled by WorkListWithAuth in WorkList.tsx (above the
// DataSourceWrapper data cycle), so StudyListPage is a pure layout component.

