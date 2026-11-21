import { apiClient } from './apiClient'

/**
 * Session calls shared by the app-wide AuthContext and the auth feature
 * (sign-in itself lives in features/auth/services/authApi.ts).
 */

/** Roles as the API sends them (kebab-case). */
export type UserRole = 'owner' | 'fleet-administrator' | 'coordinator' | 'driver' | 'mechanic' | 'customer'

/** The signed-in user (GET /api/auth/me, and inside every session response). */
export type AuthUser = {
  id: string
  email: string
  fullName: string
  roles: UserRole[]
}

/** Returned by sign-in and refresh. The refresh token itself stays in the HttpOnly cookie. */
export type AuthSession = {
  accessToken: string
  tokenType: 'Bearer'
  accessTokenExpiresAt: string
  refreshTokenExpiresAt: string
  user: AuthUser
}

/** POST /api/auth/refresh — the browser sends the refresh cookie; no body needed. */
export async function refreshSession(): Promise<AuthSession> {
  const { data } = await apiClient.post<AuthSession>('/auth/refresh')
  return data
}

/** POST /api/auth/logout — ends the session and clears the cookie. */
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}
