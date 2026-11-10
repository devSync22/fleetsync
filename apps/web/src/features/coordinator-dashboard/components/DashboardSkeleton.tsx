import { KpiCardSkeleton } from '@/components/shared/KpiCardSkeleton'
import { TableSkeleton } from '@/components/shared/TableSkeleton'

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
