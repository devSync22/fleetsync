import { Skeleton } from '@/components/ui/skeleton'

/** Style Guide → Loading / Skeleton / KPI card. */
export function KpiCardSkeleton() {
  return (
    <div className="flex flex-col gap-3.5 rounded-xl border bg-card p-5">
      <Skeleton className="size-10 rounded-[10px]" />
      <Skeleton className="h-2.5 w-[110px] rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-2 w-[90px] rounded-full" />
    </div>
  )
}
