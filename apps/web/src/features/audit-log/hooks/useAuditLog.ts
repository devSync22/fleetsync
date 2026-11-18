import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { parsePage, useUrlQuery } from '@/hooks/useUrlQuery'
import { getAuditLog } from '../services/auditLogApi'
import type { AuditModule, AuditPeriod, AuditResult } from '../types'

const periods: AuditPeriod[] = ['today', '24h', '7d', '30d']

/**
 * The audit log list. Filters, page and the selected event (`event`) live in the URL,
 * e.g. `?period=24h&module=Users&event=AUD-2026-118402`.
 */
export function useAuditLog() {
  const [raw, setQuery] = useUrlQuery({ search: '', period: 'today', user: 'all', module: 'all', result: 'all', page: '1', event: '' })
  const period = periods.includes(raw.period as AuditPeriod) ? (raw.period as AuditPeriod) : 'today'
  const module = raw.module as AuditModule | 'all'
  const result = raw.result as AuditResult | 'all'
  const { search, user } = raw
  const page = parsePage(raw.page)

  const load = useCallback(() => getAuditLog({ search, period, user, module, result, page }), [search, period, user, module, result, page])
  const { state, retry } = useAsyncData(load)
  return { state, retry, query: { search, period, user, module, result, page, event: raw.event }, setQuery }
}
