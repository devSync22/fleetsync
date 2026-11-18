import type { ReactNode } from 'react'
import { SearchX } from 'lucide-react'
import { Banner } from '@/components/shared/Banner'
import { EmptyState } from '@/components/shared/EmptyState'
import { TablePagination } from '@/components/shared/TablePagination'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import type { AsyncState } from '@/hooks/useAsyncData'
import type { Paged } from '../types'

type ListCardProps<T, P extends Paged<T>> = {
  /** Search box and filter selects shown in the card's top row. */
  filters: ReactNode
  state: AsyncState<P>
  retry: () => void
  /** "users", "drivers"… used in the loading, error and empty texts. */
  noun: string
  onPageChange: (page: number) => void
  children: (data: P) => ReactNode
}

/**
 * The white table card used on every User accounts tab: filter row with "Showing 1–8 of 86",
 * the table, and the numbered pagination, plus the loading, error and no-results states.
 */
export function ListCard<T, P extends Paged<T>>({ filters, state, retry, noun, onPageChange, children }: ListCardProps<T, P>) {
  const data = state.status === 'success' ? state.data : null
  const first = data && data.total > 0 ? (data.page - 1) * data.pageSize + 1 : 0
  const last = data ? first + data.items.length - 1 : 0

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3.5">
        {filters}
        {data && data.total > 0 && (
          <p className="ml-auto text-[13px] text-muted-foreground">
            Showing {first}–{last} of {data.total}
          </p>
        )}
      </div>

      {state.status === 'loading' && (
        <div aria-busy="true" aria-label={`Loading ${noun}`}>
          <TableSkeleton rows={6} withHeader={false} className="rounded-none border-0" />
        </div>
      )}

      {state.status === 'error' && (
        <div className="p-5">
          <Banner
            tone="danger"
            title={`Couldn’t load ${noun}`}
            message={state.error.message}
            action={
              <Button type="button" variant="outline" size="sm" onClick={retry}>
                Try again
              </Button>
            }
          />
        </div>
      )}

      {data &&
        (data.items.length > 0 ? (
          <>
            {children(data)}
            {data.pageCount > 1 && (
              <TablePagination page={data.page} pageCount={data.pageCount} pageSize={data.pageSize} onChange={onPageChange} />
            )}
          </>
        ) : (
          <EmptyState
            bare
            icon={SearchX}
            title={`No ${noun} found`}
            description="Try another search or clear the filters."
          />
        ))}
    </section>
  )
}
