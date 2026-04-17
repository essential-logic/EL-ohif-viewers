import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut, signInWithGoogle } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** The current logged-in Supabase user, or null if not authenticated. */
  user: User | null;
  /** The active Supabase session, or null. */
  session: Session | null;
  /** True while the initial session check is in progress. */
  loading: boolean;
  /** Sign in with email/password. Returns an error string on failure. */
  handleSignIn: (email: string, password: string) => Promise<string | null>;
  /** Sign up with user details. Returns an error string on failure. */
  handleSignUp: (
    email: string,
    password: string,
    metadata: { full_name: string; organization: string; job_title?: string; phone?: string },
    redirectTo?: string
  ) => Promise<string | null>;
  /** Sign the current user out. */
  handleSignOut: () => Promise<void>;
  /** Sign in with Google OAuth. */
  handleGoogleSignIn: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  handleSignIn: async () => null,
  handleSignUp: async () => null,
  handleSignOut: async () => {},
  handleGoogleSignIn: async () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
  /**
   * OHIF's UserAuthenticationService instance, passed from App.tsx.
   * When provided, the Supabase access_token is injected into OHIF's auth
   * header mechanism so that DICOMweb requests to the Supabase proxy include
   * the Authorization: Bearer <token> header.
   */
  userAuthenticationService?: {
    setServiceImplementation: (impl: {
      getAuthorizationHeader?: () => Record<string, string> | Promise<Record<string, string>>;
    }) => void;
  };
}

/**
 * Decodes a JWT payload locally to check for expiry.
 * Returns true if the token is expired or will expire within 60 seconds.
 */
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true;
    }
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    // Treat token as expired if it will expire within the next 60 seconds
    return payload.exp && payload.exp < Date.now() / 1000 + 60;
  } catch (e) {
    return true;
  }
}

/**
 * Robustly finds the latest Supabase session token from either the active state
 * or localStorage variants.
 */
function getSupabaseTokenFromStorage(): string | null {
  const projectRef = 'xyuxiachrjpcrmiephqa';
  const knownKeys = [
    `sb-${projectRef}-auth-token`,
    `sb-${window.location.hostname}-auth-token`,
    'supabase.auth.token',
  ];

  for (const key of knownKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.access_token ?? parsed?.currentSession?.access_token;
        if (token && !isTokenExpired(token)) {
          return token;
        }
      }
    } catch (e) {
      /* ignore */
    }
  }

  // Final scan for any "auth-token" key
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.includes('auth-token')) {
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || '{}');
        const token = parsed?.access_token ?? parsed?.currentSession?.access_token;
        if (token && !isTokenExpired(token)) {
          return token;
        }
      } catch (e) {
        /* ignore */
      }
    }
  }
  return null;
}

// ── Global token cache (window) so synchronous onBeforeSendHeaders can use it ──
declare global {
  interface Window {
    __supabaseToken?: string;
    __supabaseTokenRefreshing?: boolean;
    /** Callable by DataSourceWrapper on 401 to refresh the session and update the cache. */
    __refreshSupabaseToken?: () => Promise<string | null>;
  }
}

/**
 * Proactively refreshes the Supabase session and updates the window cache.
 * Safe to call multiple times — only one refresh will run at a time.
 */
async function proactiveRefresh(): Promise<string | null> {
  if (window.__supabaseTokenRefreshing) {
    return null;
  }
  window.__supabaseTokenRefreshing = true;
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.warn('[EL-Auth] Proactive refresh failed:', error.message);
      return null;
    }
    if (data?.session?.access_token) {
      window.__supabaseToken = data.session.access_token;
      console.log('[EL-Auth] Proactive token refresh succeeded.');
      return data.session.access_token;
    }
  } finally {
    window.__supabaseTokenRefreshing = false;
  }
  return null;
}

export function AuthProvider({ children, userAuthenticationService }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Register the refresh function globally so DataSourceWrapper can call it on 401
  // This avoids any module coupling between the platform and the extension.
  useEffect(() => {
    window.__refreshSupabaseToken = proactiveRefresh;
    return () => {
      delete window.__refreshSupabaseToken;
    };
  }, []);
  // ── Wire Supabase session → OHIF UserAuthenticationService ────────────────
  // This ensures OHIF's DicomWebDataSource uses the Supabase Bearer token.
  // We use a ref for the session to avoid stale closures in the service implementation.
  const sessionRef = React.useRef<Session | null>(session);
  useEffect(() => {
    sessionRef.current = session;
    // Keep window cache in sync so synchronous onBeforeSendHeaders can read it
    if (session?.access_token) {
      window.__supabaseToken = session.access_token;
    }
  }, [session]);

  useEffect(() => {
    if (!userAuthenticationService) {
      return;
    }

    userAuthenticationService.setServiceImplementation({
      getAuthorizationHeader: () => {
        // We use the synchronous window cache for OHIF's DICOMweb requests
        // fallback to storage if needed.
        const token = window.__supabaseToken || getSupabaseTokenFromStorage();

        if (token) {
          return { Authorization: `Bearer ${token}` };
        }

        console.warn('[EL-Auth] No Supabase session — DICOMweb requests will be unauthorized.');
        return {};
      },
    });
  }, [userAuthenticationService]);

  // ── Initial session load + subscription ──────────────────────────────────

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION immediately on mount —
    // so we use it as the SOLE source of truth instead of calling
    // getSession() separately (which caused a double setState that
    // briefly reset the loading flag and unmounted LoginPage mid-input).
    let initialized = false;

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      // Eagerly populate the window cache so onBeforeSendHeaders in app-config.js
      // can use a valid token synchronously, before any React re-render.
      if (newSession?.access_token) {
        window.__supabaseToken = newSession.access_token;
      }

      // Only clear the loading spinner on the first event (INITIAL_SESSION).
      // Subsequent events (TOKEN_REFRESHED, SIGNED_OUT, etc.) don't need to
      // trigger a loading state change.
      if (!initialized) {
        initialized = true;
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSignIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { error } = await signIn(email, password);
      return error ? error.message : null;
    },
    []
  );

  const handleSignUp = useCallback(
    async (
      email: string,
      password: string,
      metadata: { full_name: string; organization: string; job_title?: string; phone?: string },
      redirectTo?: string
    ): Promise<string | null> => {
      const { data, error } = await signUp(email, password, metadata, redirectTo);

      if (error) {
        return error.message;
      }

      // If identities is an empty array, it means the user already exists
      // (Supabase returns 200 OK but doesn't create a new identity to prevent enumeration)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return 'Email is already registered. Please sign in or reset your password.';
      }

      return null;
    },
    []
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
    setSession(null);
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        handleSignIn,
        handleSignUp,
        handleSignOut,
        handleGoogleSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/** Use this hook in any component to access auth state and actions. */
export const useAuth = () => useContext(AuthContext);
