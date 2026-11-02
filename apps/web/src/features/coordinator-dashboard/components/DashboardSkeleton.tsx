import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Skeleton } from '@/components/ui/skeleton'

function KpiCardSkeleton() {
  return (
    <div className="flex flex-col gap-3.5 rounded-xl border bg-card p-5">
      <Skeleton className="size-10 rounded-[10px]" />
      <Skeleton className="h-2.5 w-[110px] rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-2 w-[90px] rounded-full" />
    </div>
  )
}

/** Style Guide → Loading: skeletons keep the layout steady (no full-page spinner). */
export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard" className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
      <TableSkeleton rows={2} />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <TableSkeleton rows={4} />
        <TableSkeleton rows={4} />
      </div>
    </div>
  )
}
