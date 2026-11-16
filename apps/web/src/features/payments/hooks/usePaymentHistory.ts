import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { useAsyncData } from '@/hooks/useAsyncData'
import { DEFAULT_PERIOD, DEFAULT_STATUS, parsePeriod, parseStatusFilter } from '../paymentHistoryFilters'
import { getPaymentHistory } from '../services/paymentsApi'
import type { PaymentHistoryQuery, PaymentPeriod, PaymentStatusFilter } from '../types'

/**
 * The Payments page. Status, period, page and the selected invoice live in the URL
 * (`?status=paid&period=this-year&page=2&invoice=INV-2026-1040`); defaults are left out.
 * Without `invoice`, the newest paid payment in the list is selected.
 */
export function usePaymentHistory() {
  const [searchParams, setSearchParams] = useSearchParams()

  const status = parseStatusFilter(searchParams.get('status'))
  const period = parsePeriod(searchParams.get('period'))
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const invoiceParam = searchParams.get('invoice')
  const query: PaymentHistoryQuery = { status, period, page }

  const load = useCallback(() => getPaymentHistory({ status, period, page }), [status, period, page])
  const { state, retry } = useAsyncData(load)
  const selectedInvoiceId = invoiceParam ?? (state.status === 'success' ? state.data.defaultInvoiceId : null)

  /** Sets one URL value (dropping it when it's the default). Filter changes go back to page 1 and the default invoice. */
  const update = useCallback(
    (key: 'status' | 'period' | 'page' | 'invoice', value: string, fallback: string) => {
      setSearchParams((params) => {
        const next = new URLSearchParams(params)
        if (value === fallback) next.delete(key)
        else next.set(key, value)
        if (key === 'status' || key === 'period') {
          next.delete('page')
          next.delete('invoice')
        }
        return next
      })
    },
    [setSearchParams],
  )

  const setStatus = useCallback((value: PaymentStatusFilter) => update('status', value, DEFAULT_STATUS), [update])
  const setPeriod = useCallback((value: PaymentPeriod) => update('period', value, DEFAULT_PERIOD), [update])
  const setPage = useCallback((value: number) => update('page', String(value), '1'), [update])
  const selectInvoice = useCallback((invoiceId: string) => update('invoice', invoiceId, ''), [update])

  return { state, retry, query, selectedInvoiceId, setStatus, setPeriod, setPage, selectInvoice }
}
