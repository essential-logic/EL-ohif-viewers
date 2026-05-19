import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client singleton.
 *
 * Replace the two values below with your own from:
 * Supabase Dashboard → Project Settings → API
 *
 * SUPABASE_URL  : https://xxxxxxxxxxxxxxxxxxx.supabase.co
 * SUPABASE_ANON : your "anon" public key (safe to expose in frontend)
 */
const SUPABASE_URL =
  (window as any).SUPABASE_URL ||
  (window as any).VITE_SUPABASE_URL ||
  (typeof process !== 'undefined'
    ? process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
    : '') ||
  '';
const SUPABASE_ANON_KEY =
  (window as any).SUPABASE_ANON_KEY ||
  (window as any).VITE_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined'
    ? process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
    : '') ||
  '';

if (SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
  console.warn(
    '[EL-Auth] ⚠️  Supabase is not configured yet. ' +
      'Open extensions/custom-ui/src/lib/supabase.ts and replace the placeholder values ' +
      'with your Supabase Project URL and Anon Key.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Keep this FALSE — we don't use OAuth redirects. When true, Supabase
    // parses every URL on load (including ?datasources=orthanc) looking for
    // auth codes, which fires extra auth events that cause the login form to reset.
    detectSessionInUrl: false,
  },
});

// ─── Convenience helpers ──────────────────────────────────────────────────────

/** Sign up with email + password and optional metadata. */
export const signUp = (
  email: string,
  password: string,
  metadata: { full_name: string; organization: string; job_title?: string; phone?: string },
  redirectTo?: string
) =>
  supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: redirectTo,
    },
  });

/** Sign in with email + password. */
export const signIn = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password });

/** Sign out the current user. */
export const signOut = () => supabase.auth.signOut();

/** Sign in with Google OAuth. */
export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

/** Get the current session synchronously (from cache). */
export const getSession = () => supabase.auth.getSession();

/** Get the current logged-in user. */
export const getUser = () => supabase.auth.getUser();
