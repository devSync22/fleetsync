import { useAsyncData } from '@/hooks/useAsyncData'
import { getUserTabCounts } from '../services/adminUsersApi'

/** Counts for the All users / Drivers / Customer companies / Roles tab pills. */
export function useUserTabCounts() {
  return useAsyncData(getUserTabCounts)
}
