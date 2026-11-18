import { ApiError } from '@/services/apiClient'
import { adminProfileMock, profileMock } from '../mocks/profileMock'
import { passwordRules } from '../profileFields'
import type { ChangeRequest, ProfileDetails, ProfileField, ProfileOverview, ProfileRole, Security } from '../types'

/*
 * Mocked until the profile endpoints exist:
 *   getProfileOverview    → apiClient.get<ProfileOverview>('/me/profile')
 *   submitChangeRequest   → apiClient.post<ChangeRequest[]>('/me/change-requests', { changes, reason })
 *   changePassword        → apiClient.post<Security>('/me/password', { currentPassword, newPassword })
 *   signOutSession(s)     → apiClient.delete(`/me/sessions/${id}`) / apiClient.delete('/me/sessions?others=true')
 * Detail changes are never applied directly: a Fleet Administrator approves each change request
 * (for an administrator's own profile, another administrator). The signed-in user's role picks the mock;
 * the real endpoints take it from the session, so `role` goes away then.
 * Changes made here live in module state until the page is reloaded.
 * In dev, add `mock=error` to the URL query to preview the error state.
 */

const states: Record<ProfileRole, ProfileOverview> = {
  coordinator: structuredClone(profileMock),
  admin: structuredClone(adminProfileMock),
}
let nextRequest = 314

function now() {
  return new Date().toTimeString().slice(0, 5)
}

async function mockRequest(ms = 400) {
  await new Promise((resolve) => setTimeout(resolve, ms))
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('mock') === 'error') {
    throw new ApiError('Check your connection and try again. If it keeps happening, contact support.')
  }
}

export async function getProfileOverview(role: ProfileRole): Promise<ProfileOverview> {
  await mockRequest()
  return structuredClone(states[role])
}

export async function submitChangeRequest(role: ProfileRole, changes: Partial<ProfileDetails>, reason: string): Promise<ChangeRequest[]> {
  const state = states[role]
  await mockRequest(500)
  const fields = Object.keys(changes) as ProfileField[]
  if (fields.length === 0) throw new ApiError('Change at least one detail first.', 400)
  if (!reason.trim()) throw new ApiError('Add a reason so the Fleet Administrator knows why.', 400)

  const created: ChangeRequest[] = fields.map((field) => ({
    id: `CR-2026-0${nextRequest++}`,
    field,
    newValue: changes[field] ?? '',
    status: 'pending-review',
    note: 'submitted today',
  }))
  states[role] = { ...state, changeRequests: [...created, ...state.changeRequests] }
  return created
}

export async function changePassword(role: ProfileRole, currentPassword: string, newPassword: string): Promise<Security> {
  const state = states[role]
  await mockRequest(600)
  if (!currentPassword) throw new ApiError('Enter your current password.', 400)
  if (!passwordRules.every((rule) => rule.test(newPassword))) {
    throw new ApiError('The new password doesn’t meet all the rules.', 400)
  }
  // TODO: the API also rejects the last 3 passwords and a wrong current password

  const at = now()
  const others = state.security.sessions.filter((s) => !s.current)
  states[role] = {
    ...state,
    security: {
      ...state.security,
      passwordLastChanged: `today at ${at}`,
      sessions: state.security.sessions.filter((s) => s.current),
      signIns: [
        { id: `pw-${at}`, when: `Today, ${at}`, description: 'Password changed on this device', outcome: 'password-changed' as const },
        ...state.security.signIns,
      ].slice(0, 5),
      passwordChange: { at, signedOut: others.map((s) => s.device) },
    },
  }
  return structuredClone(states[role].security)
}

export async function signOutSession(role: ProfileRole, id: string): Promise<Security> {
  await mockRequest(300)
  const state = states[role]
  states[role] = { ...state, security: { ...state.security, sessions: state.security.sessions.filter((s) => s.id !== id) } }
  return structuredClone(states[role].security)
}

export async function signOutOtherSessions(role: ProfileRole): Promise<Security> {
  await mockRequest(300)
  const state = states[role]
  states[role] = { ...state, security: { ...state.security, sessions: state.security.sessions.filter((s) => s.current) } }
  return structuredClone(states[role].security)
}
