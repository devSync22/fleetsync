import { useCallback, useState } from 'react'
import { useAction } from '@/hooks/useAction'
import { useAsyncData } from '@/hooks/useAsyncData'
import {
  changePassword,
  getProfileOverview,
  signOutOtherSessions,
  signOutSession,
  submitChangeRequest,
} from '../services/profileApi'
import type { ChangeRequest, ProfileDetails, ProfileRole, Security } from '../types'

/** Profile, change requests and security, plus every action on the Profile & settings page, for one role. */
export function useProfile(role: ProfileRole) {
  const load = useCallback(() => getProfileOverview(role), [role])
  const { state, retry } = useAsyncData(load)
  const [newRequests, setNewRequests] = useState<ChangeRequest[]>([])
  const [security, setSecurity] = useState<Security | null>(null)

  // Bind the role once so the actions keep their (changes, reason) / (current, next) shapes.
  const submitting = useAction(useCallback((changes: Partial<ProfileDetails>, reason: string) => submitChangeRequest(role, changes, reason), [role]))
  const updatingPassword = useAction(useCallback((current: string, next: string) => changePassword(role, current, next), [role]))
  const signingOut = useAction(useCallback((id: string) => signOutSession(role, id), [role]))
  const signingOutOthers = useAction(useCallback(() => signOutOtherSessions(role), [role]))

  const overview =
    state.status === 'success'
      ? {
          ...state.data,
          // A retry refetches requests made this session too, so drop the duplicates.
          changeRequests: [...newRequests, ...state.data.changeRequests.filter((r) => !newRequests.some((n) => n.id === r.id))],
          security: security ?? state.data.security,
        }
      : null

  const submitChanges = useCallback(
    async (changes: Partial<ProfileDetails>, reason: string) => {
      const created = await submitting.run(changes, reason)
      if (created) setNewRequests((previous) => [...created, ...previous])
      return Boolean(created)
    },
    [submitting],
  )

  const updatePassword = useCallback(
    async (current: string, next: string) => {
      const result = await updatingPassword.run(current, next)
      if (result) setSecurity(result)
      return Boolean(result)
    },
    [updatingPassword],
  )

  const signOut = useCallback(
    async (id: string) => {
      const result = await signingOut.run(id)
      if (result) setSecurity(result)
    },
    [signingOut],
  )

  const signOutOthers = useCallback(async () => {
    const result = await signingOutOthers.run()
    if (result) setSecurity(result)
  }, [signingOutOthers])

  return {
    state,
    retry,
    overview,
    submitChanges,
    submitting: submitting.pending,
    submitError: submitting.error,
    updatePassword,
    updatingPassword: updatingPassword.pending,
    passwordError: updatingPassword.error,
    signOut,
    signOutOthers,
    signingOut: signingOut.pending || signingOutOthers.pending,
    sessionError: signingOut.error ?? signingOutOthers.error,
  }
}
