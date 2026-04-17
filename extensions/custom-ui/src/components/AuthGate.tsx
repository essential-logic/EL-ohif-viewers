import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from './LoginPage';

interface AuthGateProps {
  children: ReactNode;
}

/**
 * AuthGate — protects content behind authentication.
 *
 * Key design decision: LoginPage is NEVER conditionally unmounted while
 * the user is unauthenticated. Previously, showing a loading spinner
 * (while session restored) caused LoginPage to unmount → form state lost.
 *
 * Flow:
 *  • loading === true  → show LoginPage with a subtle "checking session" overlay
 *  • user === null     → show LoginPage (fully interactive)
 *  • user exists       → render the real app (children)
 */
export function AuthGate({ children }: AuthGateProps) {
  const { user, loading } = useAuth();

  // ── Authenticated → show the real app ─────────────────────────────────────
  if (user) {
    return <>{children}</>;
  }

  // ── Not authenticated (or still loading) → show LoginPage ─────────────────
  // We render LoginPage in BOTH the loading and unauthenticated states so the
  // component is never unmounted. A thin loading overlay covers it while the
  // initial session check is in progress (typically < 200ms).
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <LoginPage />
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#080d1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '3px solid rgba(59,130,246,0.15)',
              borderTop: '3px solid #3b82f6',
              animation: 'el-spin 0.8s linear infinite',
            }}
          />
          <style>{`@keyframes el-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}
