import { useAsyncData } from '@/hooks/useAsyncData'
import { getAdminDashboard } from '../services/adminDashboardApi'

/** Loads everything the Fleet Administrator's dashboard shows, with loading / error / retry. */
export function useAdminDashboard() {
  return useAsyncData(getAdminDashboard)
}
