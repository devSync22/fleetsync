import { Skeleton } from '@/components/ui/skeleton'

/** Placeholder in the Fare quotation page's shape while it loads. */
export function QuotationSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading quotation" className="flex flex-col gap-6">
      <Skeleton className="h-3.5 w-40 rounded-full" />
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-8 w-80 max-w-full rounded-full" />
        <Skeleton className="h-3.5 w-96 max-w-full rounded-full" />
      </div>
      <Skeleton className="h-[58px] w-full rounded-[10px]" />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-[420px] rounded-xl" />
          <Skeleton className="h-[130px] rounded-xl" />
        </div>
        <div className="flex flex-col gap-5">
          <Skeleton className="h-[260px] rounded-xl" />
          <Skeleton className="h-[170px] rounded-xl" />
        </div>
      </div>
    </div>
  )
}
