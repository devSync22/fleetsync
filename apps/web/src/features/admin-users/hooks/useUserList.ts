import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { parsePage, useUrlQuery } from '@/hooks/useUrlQuery'
import { getUsers } from '../services/adminUsersApi'
import type { AccountStatus, UserRole } from '../types'

/** "All users" tab: search, role and status filters and the page live in the URL. */
export function useUserList() {
  const [query, setQuery] = useUrlQuery({ search: '', role: 'all', status: 'all', page: '1' })
  const { search, role, status } = query
  const page = parsePage(query.page)

  const load = useCallback(
    () => getUsers({ search, role: role as UserRole | 'all', status: status as AccountStatus | 'all', page }),
    [search, role, status, page],
  )
  const { state, retry } = useAsyncData(load)
  return { state, retry, query: { search, role, status, page }, setQuery }
}
