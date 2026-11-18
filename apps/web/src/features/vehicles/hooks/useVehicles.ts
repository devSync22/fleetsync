import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { parsePage, useUrlQuery } from '@/hooks/useUrlQuery'
import { getVehicles } from '../services/vehiclesApi'
import type { VehicleStatus, VehicleType } from '../types'

/** The Vehicles list; search, type, status and page live in the URL. */
export function useVehicles() {
  const [raw, setQuery] = useUrlQuery({ search: '', type: 'all', status: 'all', page: '1' })
  const type = raw.type as VehicleType | 'all'
  const status = raw.status as VehicleStatus | 'all'
  const { search } = raw
  const page = parsePage(raw.page)

  const load = useCallback(() => getVehicles({ search, type, status, page }), [search, type, status, page])
  const { state, retry } = useAsyncData(load)
  return { state, retry, query: { search, type, status, page }, setQuery }
}
