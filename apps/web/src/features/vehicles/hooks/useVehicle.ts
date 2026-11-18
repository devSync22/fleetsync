import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getVehicle } from '../services/vehiclesApi'

/** One vehicle, for the Edit vehicle form. */
export function useVehicle(plate: string) {
  const load = useCallback(() => getVehicle(plate), [plate])
  return useAsyncData(load)
}
