import { SearchX } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { CardPaymentCard } from '../components/CardPaymentCard'
import { PaymentPageSkeleton } from '../components/PaymentPageSkeleton'
import { PaymentSummaryCard } from '../components/PaymentSummaryCard'
import { usePayment } from '../hooks/usePayment'

/** "Customer — Payment" (161:5978), without the card fields: cards are entered in PayHere's window only. */
export function PaymentPage() {
  const { orderId = '' } = useParams()
  const { state, retry, payNow, paying, payError } = usePayment(orderId)
  const quotationPath = `/customer/quotations/${orderId}`
  const crumbs = <Breadcrumbs items={[{ label: `Quotation ${orderId}`, to: quotationPath }, { label: 'Payment' }]} />

  if (state.status === 'loading') return <PaymentPageSkeleton />

  if (state.status === 'error') {
    if (state.error.status === 404) {
      return (
        <EmptyState
          className="mx-auto mt-10 w-[360px] max-w-full"
          icon={SearchX}
          tone="accent"
          title="Order not found"
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
      <div className="flex flex-col gap-6">
        {crumbs}
        {state.error.status === 409 ? (
          <Banner
            tone="pending"
            title="This order can’t be paid now"
            message={state.error.message}
            action={
              <Button asChild variant="outline" size="sm">
                <Link to={quotationPath}>View quotation</Link>
              </Button>
            }
          />
        ) : (
          <Banner
            tone="danger"
            title="Couldn’t load the payment"
            message={state.error.message}
            action={
              <Button type="button" variant="outline" size="sm" onClick={retry}>
                Retry
              </Button>
            }
          />
        )}
      </div>
    )
  }

  const summary = state.data

  return (
    <div className="flex flex-col gap-6">
      {crumbs}
      <PageHeader title={`Pay for ${summary.orderId}`} description="You accepted the fare quotation. Pay online to confirm the order." />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <CardPaymentCard />
        <PaymentSummaryCard summary={summary} paying={paying} error={payError} onPay={() => void payNow()} />
      </div>
    </div>
  )
}
