import * as SecureStore from 'expo-secure-store';
import { createContext, use, useEffect, useRef, useState, type ReactNode } from 'react';

import {
  changePassword as requestPasswordChange,
  refreshSession,
  signIn as requestSignIn,
  signOut as requestSignOut,
} from '@/features/auth/services/authApi';
import type { AuthUser, Session, SignInCredentials, StaffRole } from '@/features/auth/types';
import { setAccessTokenGetter, setRefreshHandler } from '@/services/apiClient';

const TOKEN_KEY = 'fleetsync.auth.token';
const REFRESH_TOKEN_KEY = 'fleetsync.auth.refreshToken';
const USER_KEY = 'fleetsync.auth.user';
const ROLES: readonly StaffRole[] = ['driver', 'mechanic'];

type SessionOptions = {
  /** "Keep me signed in": save the session so it survives an app restart. */
  keepSignedIn: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  /** True while the saved session is being read at start-up. */
  isLoading: boolean;
  /** Signs in with email and password. Rejects with the service's errors (e.g. wrong password). */
  signIn: (credentials: SignInCredentials, options: SessionOptions) => Promise<void>;
  /** Starts a session the auth feature already has. */
  startSession: (session: Session, options: SessionOptions) => Promise<void>;
  /** Ends the session on the API (best effort) and forgets it on this phone. */
  signOut: () => Promise<void>;
  /**
   * Changes the signed-in user's password. The API signs out other devices and returns a new session
   * for this phone, which is stored here. Rejects with WrongCurrentPasswordError or SamePasswordError.
   */
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Reads the saved user, rejecting anything that isn't a driver or mechanic. */
function parseStoredUser(raw: string): AuthUser | null {
  try {
    const value = JSON.parse(raw) as Partial<AuthUser>;
    const fields = [value.id, value.name, value.email];
    if (fields.every((field) => typeof field === 'string') && ROLES.includes(value.role as StaffRole)) {
      return value as AuthUser;
    }
  } catch {
    // Corrupt entry: treat as signed out.
  }
  return null;
}

async function readStoredSession(): Promise<Session | null> {
  try {
    const [token, refreshToken, rawUser] = await Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.getItemAsync(USER_KEY),
    ]);
    const user = rawUser ? parseStoredUser(rawUser) : null;
    return token && refreshToken && user ? { token, refreshToken, user } : null;
  } catch {
    return null;
  }
}

async function saveSession(session: Session) {
  try {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, session.token),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refreshToken),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user)),
    ]);
  } catch {
    // Storage unavailable: the session still works until the app closes.
  }
}

async function clearStoredSession() {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  } catch {
    // Nothing stored or storage unavailable.
  }
}

/**
 * Holds the signed-in driver or mechanic and connects their tokens to `apiClient`:
 * every request carries the access token, and a 401 triggers one refresh with the refresh token.
 * Tokens live in refs (not state) so apiClient always reads the latest pair.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);
  const refreshTokenRef = useRef<string | null>(null);
  /** Whether rotated sessions should be saved too ("Keep me signed in" was ticked). */
  const keepSignedInRef = useRef(false);

  /** Puts a session in memory, and in secure storage when "Keep me signed in" is on. */
  async function applySession(session: Session) {
    tokenRef.current = session.token;
    refreshTokenRef.current = session.refreshToken;
    if (keepSignedInRef.current) {
      await saveSession(session);
    }
    setUser(session.user);
  }

  /** Forgets the session on this phone only. */
  async function clearSession() {
    tokenRef.current = null;
    refreshTokenRef.current = null;
    setUser(null);
    await clearStoredSession();
  }

  // apiClient reads the current token from here, and asks here for a refresh on 401.
  useEffect(() => {
    setAccessTokenGetter(() => tokenRef.current);
    setRefreshHandler(async () => {
      const refreshToken = refreshTokenRef.current;
      if (!refreshToken) return null;
      try {
        const session = await refreshSession(refreshToken);
        await applySession(session);
        return session.token;
      } catch {
        // Refresh token expired or revoked (e.g. password changed elsewhere): sign out.
        await clearSession();
        return null;
      }
    });
    return () => {
      setAccessTokenGetter(() => null);
      setRefreshHandler(null);
    };
    // Runs once: applySession/clearSession only touch refs and stable state setters.
  }, []);

  // Restore the saved session on start-up ("Keep me signed in"). An expired access token is
  // refreshed automatically by apiClient on the first request that gets a 401.
  useEffect(() => {
    let cancelled = false;
    readStoredSession().then((session) => {
      if (cancelled) return;
      if (session) {
        keepSignedInRef.current = true;
        tokenRef.current = session.token;
        refreshTokenRef.current = session.refreshToken;
        setUser(session.user);
      }
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function startSession(session: Session, { keepSignedIn }: SessionOptions) {
    keepSignedInRef.current = keepSignedIn;
    if (!keepSignedIn) {
      await clearStoredSession();
    }
    await applySession(session);
  }

  async function signIn(credentials: SignInCredentials, options: SessionOptions) {
    const session = await requestSignIn(credentials, options.keepSignedIn);
    await startSession(session, options);
  }

  async function signOut() {
    const refreshToken = refreshTokenRef.current;
    await clearSession();
    await requestSignOut(refreshToken);
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    if (!user) throw new Error('Sign in to change your password.');
    const session = await requestPasswordChange(currentPassword, newPassword, keepSignedInRef.current);
    await applySession(session);
  }

  return (
    <AuthContext value={{ user, isLoading, signIn, startSession, signOut, changePassword }}>
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>.');
  }
  return context;
}
