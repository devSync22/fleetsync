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

function ListCardSkeleton({ rows }: { rows: number }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="border-b px-5 py-[18px]">
        <Skeleton className="h-3 w-40 rounded-full" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-6 border-b px-5 py-4 last:border-b-0">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-2.5 w-24 rounded-full" />
            <Skeleton className="h-2 w-16 rounded-full" />
          </div>
          <Skeleton className="h-2.5 w-[120px] rounded-full" />
          <Skeleton className="h-2.5 w-[90px] rounded-full" />
          <div className="flex flex-1 justify-end">
            <Skeleton className="h-5 w-[72px] rounded-full" />
          </div>
        </div>
      ))}
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
      <ListCardSkeleton rows={2} />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <ListCardSkeleton rows={4} />
        <ListCardSkeleton rows={4} />
      </div>
    </div>
  )
}
