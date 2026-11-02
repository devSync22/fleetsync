import { useState } from 'react'
import { Search } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { OrderSearch } from '../components/OrderSearch'
import { OrdersTable } from '../components/OrdersTable'
import { OrderTabs } from '../components/OrderTabs'
import { useSubmittedOrders } from '../hooks/useSubmittedOrders'
import { orderTabs, ordersInTab, parseOrderTab, searchOrders } from '../orderTabs'
import type { OrderTab } from '../types'

export function SubmittedOrdersPage() {
  const { state, retry } = useSubmittedOrders()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const activeTab = parseOrderTab(searchParams.get('status'))

  function selectTab(tab: OrderTab) {
    setSearchParams((params) => {
      const next = new URLSearchParams(params)
      if (tab === 'all') next.delete('status')
      else next.set('status', tab)
      return next
    })
  }

  const orders = state.status === 'success' ? state.data : null
  const counts = orders
    ? (Object.fromEntries(orderTabs.map((tab) => [tab.id, ordersInTab(orders, tab).length])) as Record<OrderTab, number>)
    : null
  const visibleOrders = orders ? searchOrders(ordersInTab(orders, activeTab), query) : []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Submitted orders"
        description="Review new orders, send fare quotations and create a trip once the customer has paid."
        actions={<OrderSearch value={query} onChange={setQuery} />}
      />

      <div className="flex flex-col gap-4">
        <div className="border-b">
          <OrderTabs activeTab={activeTab.id} counts={counts} onChange={selectTab} />
        </div>

        {state.status === 'loading' && (
          <div aria-busy="true" aria-label="Loading orders">
            <TableSkeleton rows={6} />
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

        {orders &&
          (visibleOrders.length > 0 ? (
            <OrdersTable orders={visibleOrders} />
          ) : query.trim() ? (
            <EmptyState
              icon={Search}
              tone="accent"
              title="No matching orders"
              description={`No orders in “${activeTab.label}” match “${query.trim()}”.`}
              action={
                <Button type="button" variant="outline" onClick={() => setQuery('')}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={activeTab.empty.icon}
              title={activeTab.empty.title}
              description={activeTab.empty.description}
            />
          ))}
      </div>
    </div>
  )
}
