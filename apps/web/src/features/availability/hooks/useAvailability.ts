import { useAsyncData } from '@/hooks/useAsyncData'
import { getAvailability } from '../services/availabilityApi'

export function useAvailability() {
  return useAsyncData(getAvailability)
}
