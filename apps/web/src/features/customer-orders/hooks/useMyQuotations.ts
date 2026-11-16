import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { useAsyncData } from '@/hooks/useAsyncData'
import { DEFAULT_QUOTATION_TAB, parseQuotationTab } from '../quotationTabs'
import { getMyQuotations } from '../services/customerOrdersApi'
import type { QuotationListQuery, QuotationListTab } from '../types'

/**
 * The Quotations list. Tab and page live in the URL (`?tab=accepted&page=2`), like My orders,
 * so refresh and Back keep the view. Default values are left out of the URL.
 */
export function useMyQuotations() {
  const [searchParams, setSearchParams] = useSearchParams()

  const tab = parseQuotationTab(searchParams.get('tab'))
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const query: QuotationListQuery = { tab, page }

  const load = useCallback(() => getMyQuotations({ tab, page }), [tab, page])
  const { state, retry } = useAsyncData(load)

  const setTab = useCallback(
    (value: QuotationListTab) => {
      setSearchParams((params) => {
        const next = new URLSearchParams(params)
        if (value === DEFAULT_QUOTATION_TAB) next.delete('tab')
        else next.set('tab', value)
        next.delete('page')
        return next
      })
    },
    [setSearchParams],
  )

  const setPage = useCallback(
    (value: number) => {
      setSearchParams((params) => {
        const next = new URLSearchParams(params)
        if (value === 1) next.delete('page')
        else next.set('page', String(value))
        return next
      })
    },
    [setSearchParams],
  )

  return { state, retry, query, setTab, setPage }
}
