import { useAsyncData } from '@/hooks/useAsyncData'
import { getCoordinatorDashboard } from '../services/coordinatorDashboardApi'

export function useCoordinatorDashboard() {
  return useAsyncData(getCoordinatorDashboard)
}
