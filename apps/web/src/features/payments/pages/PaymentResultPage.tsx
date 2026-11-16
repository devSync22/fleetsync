import { SearchX } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PaymentFailedCard } from '../components/PaymentFailedCard'
import { PaymentPendingCard } from '../components/PaymentPendingCard'
import { PaymentSuccessCard } from '../components/PaymentSuccessCard'
import { usePaymentResult } from '../hooks/usePaymentResult'

/** "Customer — Payment / Success" (161:6347) and "/ Failed" (161:6668), plus a pending state. */
export function PaymentResultPage() {
  const { paymentId = '' } = useParams()
  const { state, retry } = usePaymentResult(paymentId)

  if (state.status === 'loading') {
    return (
      <div aria-busy="true" aria-label="Loading payment result" className="flex justify-center pt-10">
        <Skeleton className="h-[430px] w-[560px] max-w-full rounded-2xl" />
      </div>
    )
  }

  if (state.status === 'error') {
    if (state.error.status === 404) {
      return (
        <EmptyState
          className="mx-auto mt-10 w-[360px] max-w-full"
          icon={SearchX}
          tone="accent"
          title="Payment not found"
          description={state.error.message}
          action={
            <Button asChild variant="outline">
              <Link to="/customer/orders">Back to My orders</Link>
            </Button>
          }
        />
      )
    }
    return (
      <Banner
        tone="danger"
        title="Couldn’t load the payment result"
        message={state.error.message}
        action={
          <Button type="button" variant="outline" size="sm" onClick={retry}>
            Retry
          </Button>
        }
      />
    )
  }

  const result = state.data
  if (result.status === 'pending') return <PaymentPendingCard result={result} />
  if (result.status === 'failed') return <PaymentFailedCard result={result} />
  return <PaymentSuccessCard result={result} />
}
