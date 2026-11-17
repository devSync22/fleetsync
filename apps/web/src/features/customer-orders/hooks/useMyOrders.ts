import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { useAsyncData } from '@/hooks/useAsyncData'
import { DEFAULT_PERIOD, parseMyOrdersPeriod, parseMyOrdersTab } from '../myOrdersTabs'
import { getMyOrders } from '../services/customerOrdersApi'
import type { MyOrdersPeriod, MyOrdersQuery, MyOrdersTab } from '../types'

/**
 * The My orders list. Tab, search, period and page live in the URL query string
 * (`?tab=quoted&search=kandy&period=all-time&page=2`), so refresh and Back keep the view.
 * Default values are left out of the URL.
 */
export function useMyOrders() {
  const [searchParams, setSearchParams] = useSearchParams()

  const tab = parseMyOrdersTab(searchParams.get('tab'))
  const search = searchParams.get('search') ?? ''
  const period = parseMyOrdersPeriod(searchParams.get('period'))
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const query: MyOrdersQuery = { tab, search, period, page }

  const load = useCallback(() => getMyOrders({ tab, search, period, page }), [tab, search, period, page])
  const { state, retry } = useAsyncData(load)

  /** Sets (or clears, when the value is the default) one URL value; any filter change goes back to page 1. */
  const update = useCallback(
    (key: keyof MyOrdersQuery, value: string, fallback: string, replace = false) => {
      setSearchParams(
        (params) => {
          const next = new URLSearchParams(params)
          if (value === fallback) next.delete(key)
          else next.set(key, value)
          if (key !== 'page') next.delete('page')
          return next
        },
        { replace },
      )
    },
    [setSearchParams],
  )

  const setTab = useCallback((value: MyOrdersTab) => update('tab', value, 'all'), [update])
  // Typing replaces the history entry so Back doesn't step through every keystroke.
  const setSearch = useCallback((value: string) => update('search', value, '', true), [update])
  const setPeriod = useCallback((value: MyOrdersPeriod) => update('period', value, DEFAULT_PERIOD), [update])
  const setPage = useCallback((value: number) => update('page', String(value), '1'), [update])

  return { state, retry, query, setTab, setSearch, setPeriod, setPage }
}
