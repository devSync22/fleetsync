import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { parsePage, useUrlQuery } from '@/hooks/useUrlQuery'
import { getDrivers } from '../services/adminUsersApi'
import type { DriverAvailability } from '../types'

/** "Drivers" tab: search, licence class and status filters and the page live in the URL. */
export function useDriverList() {
  const [query, setQuery] = useUrlQuery({ search: '', licenceClass: 'all', status: 'all', page: '1' })
  const { search, licenceClass, status } = query
  const page = parsePage(query.page)

  const load = useCallback(
    () => getDrivers({ search, licenceClass, status: status as DriverAvailability | 'all', page }),
    [search, licenceClass, status, page],
  )
  const { state, retry } = useAsyncData(load)
  return { state, retry, query: { search, licenceClass, status, page }, setQuery }
}
