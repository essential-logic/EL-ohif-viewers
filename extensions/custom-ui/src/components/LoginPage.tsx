import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import medicalHero from '../assets/medical_hero.png';

// ─── Types ────────────────────────────────────────────────────────────────────
type Mode = 'signin' | 'signup';

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconEmail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconEye = ({ open }: { open: boolean }) =>
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );

const IconHospital = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 22V8a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
    <path d="M10 22v-4a2 2 0 0 1 4 0v4" />
    <path d="M14 2H10" />
    <path d="M12 2v4" />
    <path d="M8 12h8" />
  </svg>
);

const IconArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// ─── Field component ──────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  autoComplete?: string;
  rightEl?: React.ReactNode;
  placeholder?: string;
}

function Field({
  label,
  type,
  value,
  onChange,
  icon,
  autoComplete,
  rightEl,
  placeholder,
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.02em' }}>{label}</label>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: focused ? 'rgba(30, 41, 59, 0.7)' : 'rgba(30, 41, 59, 0.4)',
          border: `1px solid ${focused ? '#6366f1' : 'rgba(148, 163, 184, 0.15)'}`,
          borderRadius: 12,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: focused ? '0 0 0 4px rgba(99, 102, 241, 0.1)' : 'none',
          backdropFilter: 'blur(10px)',
        }}
      >
        {icon && (
          <div style={{ paddingLeft: 16, color: focused ? '#6366f1' : '#64748b', display: 'flex', alignItems: 'center', transition: 'color 0.3s' }}>
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          placeholder={placeholder || ''}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: '14px 16px',
            color: '#f8fafc',
            fontSize: 15,
            fontWeight: 400,
            fontFamily: 'inherit',
          }}
        />
        {rightEl && <div style={{ paddingRight: 14, flexShrink: 0, display: 'flex', alignItems: 'center' }}>{rightEl}</div>}
      </div>
    </div>
  );
}

// ─── Main LoginPage ───────────────────────────────────────────────────────────
export function LoginPage() {
  const { handleSignIn, handleSignUp } = useAuth();

  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isSignUp = mode === 'signup';

  const reset = () => {
    setName('');
    setEmail('');
    setPassword('');
    setOrganization('');
    setError(null);
    setSuccess(null);
  };

  const switchMode = (m: Mode) => {
    reset();
    setMode(m);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !password.trim()) {
      return setError('Email and password are required.');
    }
    if (isSignUp && !name.trim()) {
      return setError('Please enter your full name.');
    }
    if (isSignUp && !organization.trim()) {
      return setError('Organization is required.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    const err = isSignUp
      ? await handleSignUp(email.trim(), password, {
          full_name: name.trim(),
          organization: organization.trim(),
        })
      : await handleSignIn(email.trim(), password);
    setLoading(false);

    if (err) {
      setError(err);
    } else if (isSignUp) {
      reset();
      setMode('signin');
      setSuccess('Account created successfully! Please check your email inbox to verify your account.');
    }
  };

  // Form Animation Variants
  const formVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.1 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } },
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        background: '#020617', // Deeper modern slate
        fontFamily: "'Inter', sans-serif",
        color: '#f8fafc',
      }}
    >
      {/* Left Section (Sign In Form) */}
      <div
        style={{
          flex: '1 1 50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 40px',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Subtle Ambient Glow behind form */}
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(2,6,23,0) 70%)', filter: 'blur(40px)', zIndex: -1, pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56 }}>
            <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.5px', lineHeight: 1.1 }}>Essential Logic</span>
              <span style={{ fontSize: 13, fontWeight: 700, background: '-webkit-linear-gradient(0deg, #6366f1, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '1.5px', textTransform: 'uppercase' }}>OHIF Viewer</span>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h1 style={{ fontSize: 44, fontWeight: 800, color: '#f8fafc', marginBottom: 12, letterSpacing: '-1.5px', lineHeight: 1.1 }}>
                {isSignUp ? 'Join the future of radiology.' : 'Welcome back.'}
              </h1>
              <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 44, lineHeight: 1.5, fontWeight: 400 }}>
                {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
                <span
                  onClick={() => switchMode(isSignUp ? 'signin' : 'signup')}
                  style={{
                    color: '#818cf8',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
                  onMouseLeave={e => e.currentTarget.style.color = '#818cf8'}
                >
                  {isSignUp ? 'Sign in instead' : 'Create an account'}
                </span>
              </p>

              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {isSignUp && (
                   <motion.div variants={formVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                     <Field label="Full Name" type="text" value={name} onChange={setName} placeholder="Dr. Jane Smith" />
                     <Field label="Organization" type="text" value={organization} onChange={setOrganization} placeholder="Hospital / Univ" />
                   </motion.div>
                )}
                <motion.div variants={formVariants}>
                  <Field label="Email Address" type="email" value={email} onChange={setEmail} icon={<IconEmail />} placeholder="name@organization.com" />
                </motion.div>
                <motion.div variants={formVariants}>
                  <Field
                    label="Password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={setPassword}
                    icon={<IconLock />}
                    placeholder="••••••••"
                    rightEl={
                      <button type="button" onClick={() => setShowPw(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
                        <IconEye open={showPw} />
                      </button>
                    }
                  />
                </motion.div>

                {!isSignUp && (
                  <motion.div variants={formVariants} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', marginTop: '-4px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>
                      <input type="checkbox" style={{ width: 16, height: 16, accentColor: '#6366f1', cursor: 'pointer', borderRadius: 4 }} /> Remember me
                    </label>
                    <span style={{ fontSize: 13, color: '#818cf8', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'} onMouseLeave={e => e.currentTarget.style.color = '#818cf8'}>Forgot Password?</span>
                  </motion.div>
                )}

                <motion.button
                  variants={formVariants}
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading ? 'rgba(99, 102, 241, 0.5)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '16px',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 10px 25px -5px rgba(79, 70, 229, 0.4)',
                    marginTop: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  whileHover={!loading ? { scale: 1.02, boxShadow: '0 15px 35px -5px rgba(79, 70, 229, 0.5)' } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                >
                  {loading ? 'Processing...' : isSignUp ? 'Create your account' : 'Sign in securely'}
                  {!loading && <IconArrowRight />}
                </motion.button>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ color: '#fca5a5', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px 16px', borderRadius: 10, fontSize: 14, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span style={{ lineHeight: 1.4 }}>{error}</span>
                      </div>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ color: '#86efac', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '12px 16px', borderRadius: 10, fontSize: 14, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                         <span style={{ lineHeight: 1.4 }}>{success}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right Section (Hero Presentation) */}
      <div
        style={{
          flex: '1 1 50%',
          background: 'linear-gradient(135deg, #09090b 0%, #0f172a 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 80,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Animated Background Elements */}
        {/* Abstract Grid Line Pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', opacity: 0.5, transform: 'perspective(1000px) rotateX(60deg) translateY(-100px) scale(2.5)', transformOrigin: 'top center', zIndex: 0 }} />
        
        {/* Decorative Orbs */}
        <motion.div animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: '20%', right: '15%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0) 70%)', filter: 'blur(40px)', zIndex: 1 }} />
        <motion.div animate={{ x: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', bottom: '15%', left: '10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(56,189,248,0) 70%)', filter: 'blur(50px)', zIndex: 1 }} />

        {/* Support Link */}
        <div style={{ position: 'absolute', top: 40, right: 40, display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', cursor: 'pointer', zIndex: 10, transition: 'color 0.2s', padding: '8px 16px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }} onMouseEnter={e => e.currentTarget.style.color = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Get Support</span>
        </div>

        {/* Floating Glassmorphism Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: 5 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, type: 'spring', bounce: 0.4 }}
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(20px)',
            borderRadius: 24,
            padding: 8,
            width: '100%',
            maxWidth: 500,
            marginBottom: 60,
            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            zIndex: 10,
          }}
        >
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: 18, p: 2 }}>
            <div style={{ width: '100%', height: 260, borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
              <img src={medicalHero} alt="Medical Radiology Dashboard" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              {/* Inner Image Gradient overlays */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.9) 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(99,102,241,0.2) 0%, transparent 100%)' }} />
              
              <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 24, fontWeight: 800, color: '#f8fafc', marginBottom: 6, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Diagnostic Precision</h3>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                       <span style={{ display: 'inline-flex', width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 12px #10b981' }} />
                       <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Real-time 3D Sync</span>
                     </div>
                  </div>
                  
                  {/* Floating badge */}
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>Secure</span>
                  </motion.div>
                </div>
              </div>
            </div>

             <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <div style={{ flex: 1, paddingRight: 20 }}>
                 <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>Accelerate your clinical workflow with our advanced suite of segmentation and rendering tools.</p>
               </div>
               <button style={{ flexShrink: 0, padding: '10px 20px', background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}>
                 Explore Features <IconArrowRight />
               </button>
             </div>
          </div>
        </motion.div>

        {/* System Trust Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, zIndex: 10 }}>
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
             <span style={{ fontSize: 32, fontWeight: 900, color: '#f8fafc', background: 'linear-gradient(to right, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>99.9%</span>
             <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Uptime SLA</span>
           </div>
           <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)' }} />
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
             <span style={{ fontSize: 32, fontWeight: 900, color: '#f8fafc', background: 'linear-gradient(to right, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SOC 2</span>
             <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Certified</span>
           </div>
           <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)' }} />
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
             <span style={{ fontSize: 32, fontWeight: 900, color: '#f8fafc', background: 'linear-gradient(to right, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>E2E</span>
             <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Encrypted</span>
           </div>
        </div>

      </div>
    </div>
  );
}
