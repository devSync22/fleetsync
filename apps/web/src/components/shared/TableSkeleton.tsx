import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type TableSkeletonProps = {
  rows: number
  /** Draw the card header bar (dashboard cards); tables with their own header row can skip it. */
  withHeader?: boolean
  className?: string
}

/** Style Guide → Loading / Skeleton / Table. */
export function TableSkeleton({ rows, withHeader = true, className }: TableSkeletonProps) {
  return (
    <div className={cn('overflow-hidden rounded-xl border bg-card', className)}>
      {withHeader && (
        <div className="border-b px-5 py-[18px]">
          <Skeleton className="h-3 w-40 rounded-full" />
        </div>
      )}
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-6 border-b px-5 py-4 last:border-b-0">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-2.5 w-24 rounded-full" />
            <Skeleton className="h-2 w-16 rounded-full" />
          </div>
          <Skeleton className="h-2.5 w-[120px] rounded-full" />
          <Skeleton className="h-2.5 w-[90px] rounded-full" />
          <Skeleton className="h-2.5 w-[110px] rounded-full" />
          <div className="flex flex-1 justify-end">
            <Skeleton className="h-5 w-[72px] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
