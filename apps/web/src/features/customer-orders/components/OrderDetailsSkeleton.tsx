import { Skeleton } from '@/components/ui/skeleton'

/** Placeholder in the page's shape while the order loads. */
export function OrderDetailsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading order" className="flex flex-col gap-6">
      <Skeleton className="h-3.5 w-40 rounded-full" />
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-8 w-72 rounded-full" />
        <Skeleton className="h-3.5 w-96 max-w-full rounded-full" />
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-[440px] rounded-xl" />
          <Skeleton className="h-[220px] rounded-xl" />
        </div>
        <div className="flex flex-col gap-5">
          <Skeleton className="h-[260px] rounded-xl" />
          <Skeleton className="h-[150px] rounded-xl" />
        </div>
      </div>
    </div>
  )
}
