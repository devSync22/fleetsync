import { Skeleton } from '@/components/ui/skeleton'

/** Placeholder in the Payment page's shape while the summary loads. */
export function PaymentPageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading payment" className="flex flex-col gap-6">
      <Skeleton className="h-3.5 w-48 rounded-full" />
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-8 w-64 rounded-full" />
        <Skeleton className="h-3.5 w-80 max-w-full rounded-full" />
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Skeleton className="h-[170px] rounded-xl" />
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    </div>
  )
}
