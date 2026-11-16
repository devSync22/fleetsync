import { Link } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusTabs } from '@/components/shared/StatusTabs'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { MyOrdersPagination } from '../components/MyOrdersPagination'
import { QuotationsTable } from '../components/QuotationsTable'
import { useMyQuotations } from '../hooks/useMyQuotations'
import { quotationTabs } from '../quotationTabs'
import type { QuotationListResult } from '../types'

// TODO: read the company name from AuthContext once sign-in exists
const COMPANY_NAME = 'Lanka Tiles PLC'

/** "1 quotation is waiting for your answer · ORD-1049 expires 20 Oct, 18:00" */
function AwaitingBanner({ result }: { result: QuotationListResult }) {
  const count = result.tabCounts.awaiting
  const soonest = result.soonestAwaiting
  if (count === 0 || !soonest) return null
  const waiting = count === 1 ? '1 quotation is waiting for your answer' : `${count} quotations are waiting for your answer`
  return (
    <Banner
      tone="pending"
      title={`${waiting} · ${soonest.orderId} expires ${soonest.validUntilLabel}`}
      message="After a quotation expires, the coordinator has to price the order again."
    />
  )
}

/** Customer Quotations list — not in Figma; built from "Customer — My orders" (157:5675) and Fare quotation (160:5892). */
export function CustomerQuotationsPage() {
  const { state, retry, query, setTab, setPage } = useMyQuotations()
  const result = state.status === 'success' ? state.data : null
  const activeTab = quotationTabs.find((tab) => tab.id === query.tab) ?? quotationTabs[0]
  const tabs = quotationTabs.map((tab) => ({ id: tab.id, label: tab.label, count: result?.tabCounts[tab.id] }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Quotations"
        description={`Fare quotations sent for ${COMPANY_NAME} orders. Answer before they expire.`}
      />

      {result && <AwaitingBanner result={result} />}

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="px-5 pt-3">
          <StatusTabs label="Quotation status" tabs={tabs} activeId={query.tab} onChange={setTab} />
        </div>

        {state.status === 'loading' && (
          <div aria-busy="true" aria-label="Loading quotations">
            <TableSkeleton rows={7} withHeader={false} className="rounded-none border-0" />
          </div>
        )}

        {state.status === 'error' && (
          <div className="p-5">
            <Banner
              tone="danger"
              title="Couldn’t load your quotations"
              message={state.error.message}
              action={
                <Button type="button" variant="outline" size="sm" onClick={retry}>
                  Retry
                </Button>
              }
            />
          </div>
        )}

        {result &&
          (result.items.length > 0 ? (
            <>
              <QuotationsTable rows={result.items} />
              <MyOrdersPagination page={result.page} pageCount={result.pageCount} onChange={setPage} />
            </>
          ) : (
            <EmptyState
              bare
              icon={activeTab.empty.icon}
              title={activeTab.empty.title}
              description={activeTab.empty.description}
              action={
                <Button asChild variant="outline">
                  <Link to="/customer/orders">Go to My orders</Link>
                </Button>
              }
            />
          ))}
      </section>
    </div>
  )
}
