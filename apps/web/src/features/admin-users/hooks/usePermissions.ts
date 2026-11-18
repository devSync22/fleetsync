import { useAsyncData } from '@/hooks/useAsyncData'
import { getPermissions } from '../services/adminUsersApi'

/** The read-only Roles & permissions matrix. */
export function usePermissions() {
  return useAsyncData(getPermissions)
}
