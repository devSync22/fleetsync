import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { parsePage, useUrlQuery } from '@/hooks/useUrlQuery'
import { isApplicationTab } from '../labels'
import { getApplications } from '../services/applicationsApi'
import type { ApplicantType, RequestedRole } from '../types'

/** The Applications list. Tab, search, type / role filters and page live in the URL (`?tab=approved&type=company`). */
export function useApplications() {
  const [raw, setQuery] = useUrlQuery({ tab: 'open', search: '', type: 'all', role: 'all', page: '1' })
  const tab = isApplicationTab(raw.tab) ? raw.tab : 'open'
  const type = raw.type as ApplicantType | 'all'
  const role = raw.role as RequestedRole | 'all'
  const { search } = raw
  const page = parsePage(raw.page)

  const load = useCallback(() => getApplications({ tab, search, type, role, page }), [tab, search, type, role, page])
  const { state, retry } = useAsyncData(load)
  return { state, retry, query: { tab, search, type, role, page }, setQuery }
}
