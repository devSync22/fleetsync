import * as SecureStore from 'expo-secure-store';
import { createContext, use, useEffect, useRef, useState, type ReactNode } from 'react';

import { changePassword as requestPasswordChange, signIn as requestSignIn } from '@/features/auth/services/authApi';
import type { AuthUser, Session, SignInCredentials, StaffRole } from '@/features/auth/types';
import { setAccessTokenGetter } from '@/services/apiClient';

const TOKEN_KEY = 'fleetsync.auth.token';
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
  /** Starts a session the auth feature already has (e.g. after activating an account). */
  startSession: (session: Session, options: SessionOptions) => Promise<void>;
  signOut: () => Promise<void>;
  /**
   * Changes the signed-in user's password. Rejects with an `ApiError`: status 401 = wrong current
   * password, 422 = same as the current one.
   */
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function parseStoredUser(raw: string): AuthUser | null {
  try {
    const value = JSON.parse(raw) as Partial<AuthUser>;
    const fields = [value.id, value.name, value.staffId, value.email, value.depot];
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
    const [token, rawUser] = await Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(USER_KEY),
    ]);
    const user = rawUser ? parseStoredUser(rawUser) : null;
    return token && user ? { token, user } : null;
  } catch {
    return null;
  }
}

async function saveSession(session: Session) {
  try {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, session.token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user)),
    ]);
  } catch {
    // Storage unavailable: the session still works until the app closes.
  }
}

async function clearStoredSession() {
  try {
    await Promise.all([SecureStore.deleteItemAsync(TOKEN_KEY), SecureStore.deleteItemAsync(USER_KEY)]);
  } catch {
    // Nothing stored or storage unavailable.
  }
}

/** Holds the signed-in driver or mechanic and connects their token to `apiClient`. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  // Every apiClient request reads the current token from here.
  useEffect(() => {
    setAccessTokenGetter(() => tokenRef.current);
    return () => setAccessTokenGetter(() => null);
  }, []);

  // Restore the saved session on start-up ("Keep me signed in").
  useEffect(() => {
    let cancelled = false;
    readStoredSession().then((session) => {
      if (cancelled) return;
      if (session) {
        tokenRef.current = session.token;
        setUser(session.user);
      }
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function startSession(session: Session, { keepSignedIn }: SessionOptions) {
    if (keepSignedIn) {
      await saveSession(session);
    } else {
      await clearStoredSession();
    }
    tokenRef.current = session.token;
    setUser(session.user);
  }

  async function signIn(credentials: SignInCredentials, options: SessionOptions) {
    const session = await requestSignIn(credentials);
    await startSession(session, options);
  }

  async function signOut() {
    tokenRef.current = null;
    setUser(null);
    await clearStoredSession();
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    if (!user) throw new Error('Sign in to change your password.');
    await requestPasswordChange(user.email, currentPassword, newPassword);
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
