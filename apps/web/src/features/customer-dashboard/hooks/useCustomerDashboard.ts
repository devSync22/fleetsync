import { useAsyncData } from '@/hooks/useAsyncData'
import { getCustomerDashboard } from '../services/customerDashboardApi'

export function useCustomerDashboard() {
  return useAsyncData(getCustomerDashboard)
}
