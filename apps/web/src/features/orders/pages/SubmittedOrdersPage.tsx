import { useState } from 'react'
import { Search } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { EmptyState } from '@/components/shared/EmptyState'
import { FilterSelect } from '@/components/shared/FilterSelect'
import { PageHeader } from '@/components/shared/PageHeader'
import { SearchInput } from '@/components/shared/SearchInput'
import { StatusTabs } from '@/components/shared/StatusTabs'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { statusMeta } from '@/components/shared/statusTones'
import { Button } from '@/components/ui/button'
import { OrdersTable } from '../components/OrdersTable'
import { useSubmittedOrders } from '../hooks/useSubmittedOrders'
import { matchesSearch, orderTabs, parseOrderTab } from '../orderTabs'
import type { OrderTab, PaymentStatus } from '../types'

const paymentStatuses: PaymentStatus[] = ['not-due', 'awaiting-payment', 'paid', 'payment-failed', 'no-payment']

/** "Coordinator — Submitted orders" (122:4080) and its tab frames (510:11470, 510:11983, 510:12458, 510:12957). */
export function SubmittedOrdersPage() {
  const { state, retry } = useSubmittedOrders()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [pickup, setPickup] = useState('any')
  const [payment, setPayment] = useState<'any' | PaymentStatus>('any')
  const activeTab = parseOrderTab(searchParams.get('status'))

  function selectTab(tab: OrderTab) {
    setSearchParams((params) => {
      const next = new URLSearchParams(params)
      if (tab === 'all-open') next.delete('status')
      else next.set('status', tab)
      return next
    })
  }

  const orders = state.status === 'success' ? state.data : null
  const tabs = orderTabs.map((tab) => ({
    id: tab.id,
    label: tab.label,
    count: orders ? orders.filter(tab.matches).length : undefined,
  }))
  const inTab = orders ? orders.filter(activeTab.matches) : []
  const visible = inTab.filter(
    (o) => matchesSearch(o, query) && (pickup === 'any' || o.pickupDate === pickup) && (payment === 'any' || o.payment === payment),
  )
  const pickupDates = [...new Set((orders ?? []).map((o) => o.pickupDate).filter(Boolean))].sort(
    (a, b) => Number(a.split(' ')[0]) - Number(b.split(' ')[0]),
  )
  const filtered = query.trim() !== '' || pickup !== 'any' || payment !== 'any'

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Submitted orders"
        description="Transport orders from customers. Quote new orders, then create a trip once the customer has paid."
        actions={
          // TODO: download the order list once the export endpoint exists
          <Button type="button" variant="outline">
            Export
          </Button>
        }
      />

      <StatusTabs label="Order status" tabs={tabs} activeId={activeTab.id} onChange={selectTab} />

      {state.status === 'loading' && (
        <div aria-busy="true" aria-label="Loading orders">
          <TableSkeleton rows={8} />
        </div>
      )}

      {state.status === 'error' && (
        <Banner
          tone="danger"
          title="Couldn’t load orders"
          message={state.error.message}
          action={
            <Button type="button" variant="outline" size="sm" onClick={retry}>
              Try again
            </Button>
          }
        />
      )}

      {orders && (
        <section className="overflow-hidden rounded-xl border bg-card">
          <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3.5">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search order ID, customer or place"
              label="Search orders"
              className="w-[280px] border-0 bg-secondary py-2.5"
            />
            <FilterSelect
              label="Pickup date"
              value={pickup}
              onChange={setPickup}
              className="w-[170px]"
              options={[{ id: 'any', label: 'Any pickup date' }, ...pickupDates.map((d) => ({ id: d, label: `Pickup ${d}` }))]}
            />
            <FilterSelect
              label="Payment status"
              value={payment}
              onChange={setPayment}
              className="w-[190px]"
              options={[
                { id: 'any', label: 'All payment statuses' },
                ...paymentStatuses.map((p) => ({ id: p, label: statusMeta[p].label })),
              ]}
            />
            <p className="ml-auto text-[13px] text-muted-foreground">
              Showing {visible.length} of {inTab.length}
              {activeTab.hint && ` · ${activeTab.hint}`}
            </p>
          </div>

          {visible.length > 0 ? (
            <OrdersTable orders={visible} showQuotation={activeTab.id === 'quoted'} />
          ) : filtered ? (
            <EmptyState
              bare
              icon={Search}
              tone="accent"
              title="No matching orders"
              description={`No orders in “${activeTab.label}” match these filters.`}
              action={
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setQuery('')
                    setPickup('any')
                    setPayment('any')
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState bare icon={activeTab.empty.icon} title={activeTab.empty.title} description={activeTab.empty.description} />
          )}
        </section>
      )}
    </div>
  )
}
