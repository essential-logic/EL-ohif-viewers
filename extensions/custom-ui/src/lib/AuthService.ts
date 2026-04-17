/**
 * AuthService Interface — Implement your enterprise backend here.
 *
 * Replace the current mock implementations with calls to your own auth API
 * (e.g., fetch, axios, etc.) to handle JWTs or custom enterprise logins.
 */

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  // Add other enterprise-specific fields here
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

const AUTH_STORAGE_KEY = 'el_enterprise_auth_session';

class EnterpriseAuthService {
  /** Check if a session exists in localStorage and return it */
  async getSession(): Promise<AuthSession | null> {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!saved) {
      return null;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }

  /** Handle email/password sign-in with your backend */
  async signIn(
    email: string,
    password: string
  ): Promise<{ session: AuthSession | null; error: Error | null }> {
    try {
      // ─── ENTERPRISE INTEGRATION POINT ──────────────────────────────────
      // Example call:
      // const res = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   body: JSON.stringify({ email, password })
      // });
      // const data = await res.json();
      // return { session: data, error: null };

      // MOCK IMPLEMENTATION (for now):
      const mockSession: AuthSession = {
        accessToken: 'mock-jwt-token',
        user: { id: 'user-1', email, fullName: 'Enterprise User' },
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockSession));
      return { session: mockSession, error: null };
    } catch (err) {
      return { session: null, error: err as Error };
    }
  }

  /** Handle sign-up/onboarding with your backend */
  async signUp(
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error: Error | null }> {
    try {
      // ENTERPRISE INTEGRATION POINT
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  /** Log out and clear tokens */
  async signOut(): Promise<void> {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  /** Optional: handle Google/Enterprise IDP OAuth */
  async signInWithGoogle(): Promise<void> {
    // ENTERPRISE INTEGRATION POINT
    console.log('Redirecting to Enterprise SSO / Google...');
  }
}

export const authService = new EnterpriseAuthService();
