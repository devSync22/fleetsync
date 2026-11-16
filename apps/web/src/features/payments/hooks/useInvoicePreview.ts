import { useCallback } from 'react'
import { useAction } from '@/hooks/useAction'
import { useAsyncData, type AsyncState } from '@/hooks/useAsyncData'
import { downloadInvoice, getInvoicePreview } from '../services/paymentsApi'
import type { InvoicePreview } from '../types'

/** The invoice shown in the preview card (null while nothing is selected), and its download action. */
export function useInvoicePreview(invoiceId: string | null) {
  const load = useCallback(() => (invoiceId ? getInvoicePreview(invoiceId) : Promise.resolve(null)), [invoiceId])
  const { state, retry } = useAsyncData(load)
  const download = useAction(downloadInvoice)

  // When the selection changes, don't keep showing the previous invoice while the new one loads.
  const current: AsyncState<InvoicePreview | null> =
    state.status === 'success' && (state.data?.invoiceNumber ?? null) !== invoiceId ? { status: 'loading' } : state

  return {
    state: current,
    retry,
    download: () => (invoiceId ? void download.run(invoiceId) : undefined),
    downloading: download.pending,
    downloadError: download.error,
  }
}
