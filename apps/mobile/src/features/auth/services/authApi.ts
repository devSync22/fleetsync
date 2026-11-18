import { ApiError, apiClient } from '@/services/apiClient';

import type { AccountApproval } from '../activation/types';
import type { AccountRequest } from '../registration/types';
import type { AuthUser, Session, SignInCredentials, StaffRole } from '../types';

/**
 * Auth service: every call goes to the FleetSync API (`/api/auth/*`, see /scalar on the API in
 * development). apiClient sends `X-Client-Type: mobile`, so the API returns the refresh token in the
 * body instead of a browser cookie. The in-memory test double lives in `mocks/authApiMock.ts`.
 */

/** Wrong email or password. `attemptsLeft` drives the "2 attempts left" helper (null when unknown). */
export class InvalidCredentialsError extends ApiError {
  readonly attemptsLeft: number | null;

  constructor(attemptsLeft: number | null) {
    super('Incorrect email or password', 401, 'auth.invalid_credentials');
    this.name = 'InvalidCredentialsError';
    this.attemptsLeft = attemptsLeft;
  }
}

/** Too many failed attempts. */
export class AccountLockedError extends ApiError {
  constructor(message: string) {
    super(message, 423, 'auth.locked_out');
    this.name = 'AccountLockedError';
  }
}

/** The reset link is invalid, expired or already used. */
export class ResetLinkExpiredError extends ApiError {
  constructor() {
    super('This reset link has expired or was already used. Request a new one.', 400, 'auth.invalid_token');
    this.name = 'ResetLinkExpiredError';
  }
}

/** The new password is the same as the current or a recent one ("Not the same as your last password"). */
export class SamePasswordError extends ApiError {
  constructor() {
    super('Choose a password that’s different from your last one.', 400, 'auth.password_reused');
    this.name = 'SamePasswordError';
  }
}

/** Change password: the current password is wrong. */
export class WrongCurrentPasswordError extends ApiError {
  constructor() {
    super('Your current password is incorrect.', 400, 'auth.wrong_current_password');
    this.name = 'WrongCurrentPasswordError';
  }
}

/** Signed in with a web-only role (customer, coordinator, admin, owner). */
export class WebOnlyRoleError extends ApiError {
  constructor() {
    super('This app is for drivers and mechanics. Please sign in on the FleetSync website.', 403, 'auth.web_only_role');
    this.name = 'WebOnlyRoleError';
  }
}

/** POST /api/auth/login, /refresh and /change-password response (AuthSessionResponse). */
type ApiSession = {
  accessToken: string;
  tokenType: 'Bearer';
  accessTokenExpiresAt: string;
  /** Filled for mobile clients only. */
  refreshToken: string | null;
  refreshTokenExpiresAt: string;
  user: { id: string; email: string; fullName: string; roles: string[] };
};

const MOBILE_ROLES: readonly StaffRole[] = ['driver', 'mechanic'];

/**
 * The API's session → the app's Session. Only drivers and mechanics may use the app.
 * Staff ID and depot are not in the API yet (staff management isn't built), so they stay empty.
 */
function toSession(data: ApiSession): Session {
  const role = data.user.roles.find((candidate): candidate is StaffRole =>
    MOBILE_ROLES.includes(candidate as StaffRole),
  );
  if (!role || !data.refreshToken) {
    throw new WebOnlyRoleError();
  }

  const user: AuthUser = {
    id: data.user.id,
    name: data.user.fullName,
    role,
    email: data.user.email,
  };
  return { token: data.accessToken, refreshToken: data.refreshToken, user };
}

/** Re-throws the API's error as the typed error a screen checks for, when there is one. */
function rethrow(error: unknown): never {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'auth.invalid_credentials': {
        const attemptsLeft = error.extensions.attemptsLeft;
        throw new InvalidCredentialsError(typeof attemptsLeft === 'number' ? attemptsLeft : null);
      }
      case 'auth.locked_out':
        throw new AccountLockedError(error.message);
      case 'auth.invalid_token':
        throw new ResetLinkExpiredError();
      case 'auth.password_reused':
        throw new SamePasswordError();
      case 'auth.wrong_current_password':
        throw new WrongCurrentPasswordError();
    }
  }
  throw error;
}

/** POST /api/auth/login. `keepSignedIn` asks for the longer "remember me" refresh token. */
export async function signIn(credentials: SignInCredentials, keepSignedIn = false): Promise<Session> {
  try {
    const { data } = await apiClient.post<ApiSession>('/auth/login', {
      email: credentials.email.trim(),
      password: credentials.password,
      rememberMe: keepSignedIn,
    });
    return toSession(data);
  } catch (error) {
    rethrow(error);
  }
}

/** POST /api/auth/refresh: swaps the (single-use) refresh token for a new session. */
export async function refreshSession(refreshToken: string): Promise<Session> {
  const { data } = await apiClient.post<ApiSession>('/auth/refresh', { refreshToken });
  return toSession(data);
}

/** POST /api/auth/logout: ends the session on the server. Never throws — signing out locally always works. */
export async function signOut(refreshToken: string | null): Promise<void> {
  if (!refreshToken) return;
  try {
    await apiClient.post('/auth/logout', { refreshToken });
  } catch {
    // Offline or already expired: the local session is cleared anyway.
  }
}

/**
 * POST /api/auth/staff-applications (multipart): a driver or mechanic asks for an account.
 * Resolves to the reference shown on "Request sent" (e.g. "REG-2026-0001").
 */
export async function requestAccount(request: AccountRequest): Promise<{ reference: string; submittedAt: string }> {
  const form = new FormData();
  form.append('role', request.role);
  form.append('fullName', request.fullName);
  form.append('nic', request.nic);
  form.append('email', request.email);
  form.append('mobile', request.mobile);
  if (request.licenceNumber) form.append('licenceNumber', request.licenceNumber);
  if (request.licenceClass) form.append('licenceClass', request.licenceClass);
  // React Native's FormData takes { uri, name, type } for a local file; one "documents" part per file.
  for (const document of request.documents) {
    form.append('documents', {
      uri: document.uri,
      name: document.name,
      type: document.mimeType ?? 'application/octet-stream',
    } as unknown as Blob);
  }

  const { data } = await apiClient.post<{ reference: string; submittedAt: string }>('/auth/staff-applications', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** POST /api/auth/activation/lookup: the approved account behind the approval email's link. */
export async function getAccountApproval(token: string): Promise<AccountApproval> {
  try {
    const { data } = await apiClient.post<AccountApproval>('/auth/activation/lookup', { token });
    return data;
  } catch (error) {
    rethrow(error);
  }
}

/** POST /api/auth/activation: sets the first password. The user then signs in with it. */
export async function activateAccount(token: string, password: string): Promise<void> {
  try {
    await apiClient.post('/auth/activation', { token, password });
  } catch (error) {
    rethrow(error);
  }
}

/**
 * POST /api/auth/forgot-password: emails a reset link. Resolves the same way whether or not an account
 * exists, so the screen can't reveal which emails are registered.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email });
}

/** POST /api/auth/reset-password: sets a new password using the token from the reset link. */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  try {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  } catch (error) {
    rethrow(error);
  }
}

/**
 * POST /api/auth/change-password while signed in. The API signs out every other device and returns a
 * new session for this phone, which the caller must store.
 */
export async function changePassword(currentPassword: string, newPassword: string, keepSignedIn: boolean): Promise<Session> {
  try {
    const { data } = await apiClient.post<ApiSession>('/auth/change-password', {
      currentPassword,
      newPassword,
      rememberMe: keepSignedIn,
    });
    return toSession(data);
  } catch (error) {
    rethrow(error);
  }
}
