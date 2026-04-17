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
const SUPABASE_URL = 'https://xyuxiachrjpcrmiephqa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dXhpYWNocmpwY3JtaWVwaHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzg5MTQsImV4cCI6MjA4ODYxNDkxNH0.Juyha-EgArRaPu7Sk05aqLzQPT5KrjhHFG4AK31zpBw';

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
