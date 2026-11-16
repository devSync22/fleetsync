import { CreditCard } from 'lucide-react'
import { Banner } from '@/components/shared/Banner'
import { EmptyState } from '@/components/shared/EmptyState'
import { FilterSelect } from '@/components/shared/FilterSelect'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { InvoicePreviewCard } from '../components/InvoicePreviewCard'
import { PaymentHistoryTable } from '../components/PaymentHistoryTable'
import { PaymentKpis } from '../components/PaymentKpis'
import { useInvoicePreview } from '../hooks/useInvoicePreview'
import { usePaymentHistory } from '../hooks/usePaymentHistory'
import { DEFAULT_PERIOD, DEFAULT_STATUS, periodFilters, statusFilters } from '../paymentHistoryFilters'

// TODO: read the company name from AuthContext once sign-in exists
const COMPANY_NAME = 'Lanka Tiles PLC'

/** "Customer — Payment history" (162:6243). */
export function PaymentHistoryPage() {
  const history = usePaymentHistory()
  const { state, query } = history
  const result = state.status === 'success' ? state.data : null
  const preview = useInvoicePreview(history.selectedInvoiceId)
  const filtered = query.status !== DEFAULT_STATUS || query.period !== DEFAULT_PERIOD

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payments"
        description={`Every online payment for ${COMPANY_NAME} orders. Download an invoice for any paid order.`}
      />

      <PaymentKpis kpis={result?.kpis ?? null} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <SectionCard
          title="Payment history"
          action={
            <div className="flex shrink-0 flex-wrap gap-2.5">
              <FilterSelect label="Status" value={query.status} onChange={history.setStatus} options={statusFilters} className="w-[150px]" />
              <FilterSelect label="Period" value={query.period} onChange={history.setPeriod} options={periodFilters} className="w-[160px]" />
            </div>
          }
        >
          {state.status === 'loading' && (
            <div aria-busy="true" aria-label="Loading payments">
              <TableSkeleton rows={6} className="rounded-none border-0" />
            </div>
          )}

          {state.status === 'error' && (
            <div className="p-5">
              <Banner
                tone="danger"
                title="Couldn’t load your payments"
                message={state.error.message}
                action={
                  <Button type="button" variant="outline" size="sm" onClick={history.retry}>
                    Retry
                  </Button>
                }
              />
            </div>
          )}

          {result &&
            (result.items.length > 0 ? (
              <>
                <PaymentHistoryTable rows={result.items} selectedInvoiceId={history.selectedInvoiceId} onSelect={history.selectInvoice} />
                <nav aria-label="Pages" className="flex items-center gap-2 border-t px-5 py-3">
                  <p className="flex-1 text-xs text-muted-foreground">
                    Showing {result.items.length} of {result.total} {result.total === 1 ? 'payment' : 'payments'}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={result.page <= 1}
                    onClick={() => history.setPage(result.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={result.page >= result.pageCount}
                    onClick={() => history.setPage(result.page + 1)}
                  >
                    Next
                  </Button>
                </nav>
              </>
            ) : (
              <EmptyState
                bare
                icon={CreditCard}
                title={filtered ? 'No payments match these filters' : 'No payments yet'}
                description={
                  filtered
                    ? 'Try another status or a longer period.'
                    : 'Payments you make for accepted quotations appear here, with an invoice for each paid order.'
                }
              />
            ))}
        </SectionCard>

        <InvoicePreviewCard
          invoice={preview.state.status === 'success' ? preview.state.data : null}
          loading={preview.state.status === 'loading' || (state.status === 'loading' && !history.selectedInvoiceId)}
          error={preview.state.status === 'error' ? preview.state.error : null}
          onRetry={preview.retry}
          onDownload={preview.download}
          downloading={preview.downloading}
          downloadError={preview.downloadError}
        />
      </div>
    </div>
  )
}
