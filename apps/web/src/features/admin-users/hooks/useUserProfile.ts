import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getUser } from '../services/adminUsersApi'

/** One user's full profile for the View profile sheet. */
export function useUserProfile(userId: string) {
  const load = useCallback(() => getUser(userId), [userId])
  return useAsyncData(load)
}
