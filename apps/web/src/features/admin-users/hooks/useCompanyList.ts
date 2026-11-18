import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { parsePage, useUrlQuery } from '@/hooks/useUrlQuery'
import { getCompanies } from '../services/adminUsersApi'
import type { CompaniesQuery, CompanyStatus } from '../types'

/** "Customer companies" tab: search, status and balance filters and the page live in the URL. */
export function useCompanyList() {
  const [query, setQuery] = useUrlQuery({ search: '', status: 'all', balance: 'any', page: '1' })
  const { search, status, balance } = query
  const page = parsePage(query.page)

  const load = useCallback(
    () =>
      getCompanies({
        search,
        status: status as CompanyStatus | 'all',
        balance: balance as CompaniesQuery['balance'],
        page,
      }),
    [search, status, balance, page],
  )
  const { state, retry } = useAsyncData(load)
  return { state, retry, query: { search, status, balance, page }, setQuery }
}
