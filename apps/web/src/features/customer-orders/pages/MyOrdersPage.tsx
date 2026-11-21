import { Search } from 'lucide-react'
import { Link } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { EmptyState } from '@/components/shared/EmptyState'
import { FilterSelect } from '@/components/shared/FilterSelect'
import { PageHeader } from '@/components/shared/PageHeader'
import { SearchInput } from '@/components/shared/SearchInput'
import { StatusTabs } from '@/components/shared/StatusTabs'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { MyOrdersPagination } from '../components/MyOrdersPagination'
import { MyOrdersTable } from '../components/MyOrdersTable'
import { useMyOrders } from '../hooks/useMyOrders'
import { myOrdersPeriods, myOrdersTabs } from '../myOrdersTabs'

// TODO: read the company name from AuthContext once sign-in exists
const COMPANY_NAME = 'Lanka Tiles PLC'

function NewOrderButton() {
  return (
    <Button asChild>
      <Link to="/customer/new-order">New transport order</Link>
    </Button>
  )
}

/** "Customer — My orders" (157:5675). */
export function MyOrdersPage() {
  const { state, retry, query, setTab, setSearch, setPeriod, setPage } = useMyOrders()
  const result = state.status === 'success' ? state.data : null
  const activeTab = myOrdersTabs.find((tab) => tab.id === query.tab) ?? myOrdersTabs[0]

  const tabs = myOrdersTabs.map((tab) => ({ id: tab.id, label: tab.label, count: result?.tabCounts[tab.id] }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        className="items-end"
        title="My orders"
        description={`Every transport order ${COMPANY_NAME} has placed, with its current status.`}
        actions={<NewOrderButton />}
      />

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="px-5 pt-3">
          <StatusTabs label="Order status" tabs={tabs} activeId={query.tab} onChange={setTab} />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 border-b px-5 py-3">
          <SearchInput
            value={query.search}
            onChange={setSearch}
            placeholder="Search order number or city"
            label="Search orders"
            className="w-[300px] border-line py-[9px]"
          />
          <FilterSelect label="Placed in" value={query.period} onChange={setPeriod} options={myOrdersPeriods} className="w-[180px]" />
          {result && (
            <p className="ml-auto text-xs text-muted-foreground">
              Showing {result.items.length} of {result.total}
            </p>
          )}
        </div>

        {state.status === 'loading' && (
          <div aria-busy="true" aria-label="Loading orders">
            <TableSkeleton rows={7} withHeader={false} className="rounded-none border-0" />
          </div>
        )}

        {state.status === 'error' && (
          <div className="p-5">
            <Banner
              tone="danger"
              title="Couldn’t load your orders"
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
              <MyOrdersTable orders={result.items} />
              <MyOrdersPagination page={result.page} pageCount={result.pageCount} onChange={setPage} />
            </>
          ) : query.search.trim() !== '' ? (
            <EmptyState
              bare
              icon={Search}
              tone="accent"
              title="No matching orders"
              description={`No orders in “${activeTab.label}” match “${query.search.trim()}”.`}
              action={
                <Button type="button" variant="outline" onClick={() => setSearch('')}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <EmptyState
              bare
              icon={activeTab.empty.icon}
              title={activeTab.empty.title}
              description={activeTab.empty.description}
              action={<NewOrderButton />}
            />
          ))}
      </section>
    </div>
  )
}
