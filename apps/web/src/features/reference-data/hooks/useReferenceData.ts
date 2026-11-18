import { useAsyncData } from '@/hooks/useAsyncData'
import { getReferenceData } from '../services/referenceDataApi'

/** All reference lists in one load (they are small). */
export function useReferenceData() {
  return useAsyncData(getReferenceData)
}
