import { useAsyncData } from '@/hooks/useAsyncData'
import { getCreateUserOptions } from '../services/adminUsersApi'

/** Next employee ID, depots and licence classes for the Create user form. */
export function useCreateUserOptions() {
  return useAsyncData(getCreateUserOptions)
}
