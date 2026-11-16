import { useState } from 'react'
import { SearchX } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { CoordinatorMessageCard } from '../components/CoordinatorMessageCard'
import { DeclineQuotationDialog } from '../components/DeclineQuotationDialog'
import { OrderQuestionsCard } from '../components/OrderQuestionsCard'
import { PriceBreakdownCard } from '../components/PriceBreakdownCard'
import { QuotationDecisionCard } from '../components/QuotationDecisionCard'
import { QuotationNotice } from '../components/QuotationNotice'
import { QuotationSkeleton } from '../components/QuotationSkeleton'
import { RouteCargoCard } from '../components/RouteCargoCard'
import { useQuotation } from '../hooks/useQuotation'
import { quotationBadge } from '../quotationStatus'

const QUOTATIONS_CRUMB = { label: 'Quotations', to: '/customer/quotations' }

/** "Customer — Fare quotation" (160:5892), plus accepted / declined / expired states. */
export function FareQuotationPage() {
  const { orderId = '' } = useParams()
  const quote = useQuotation(orderId)
  const [declineOpen, setDeclineOpen] = useState(false)
  const { state, status } = quote

  if (state.status === 'loading') return <QuotationSkeleton />

  if (state.status === 'error') {
    if (state.error.status === 404) {
      return (
        <EmptyState
          className="mx-auto mt-10 w-[380px] max-w-full"
          icon={SearchX}
          tone="accent"
          title="No quotation for this order yet"
          description={state.error.message}
          action={
            <Button asChild variant="outline">
              <Link to={`/customer/orders/${orderId}`}>View order</Link>
            </Button>
          }
        />
      )
    }
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumbs items={[QUOTATIONS_CRUMB, { label: orderId, mono: true }]} />
        <Banner
          tone="danger"
          title="Couldn’t load the quotation"
          message={state.error.message}
          action={
            <Button type="button" variant="outline" size="sm" onClick={quote.retry}>
              Retry
            </Button>
          }
        />
      </div>
    )
  }

  const quotation = state.data
  if (!status) return null

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[QUOTATIONS_CRUMB, { label: quotation.orderId, mono: true }]} />

      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            Fare quotation for {quotation.orderId}
            <StatusBadge status={quotationBadge[status]} />
          </span>
        }
        description={`Sent by ${quotation.sentBy}, ${quotation.sentByRole} · ${quotation.sentAtLabel}`}
      />

      <QuotationNotice quotation={quotation} status={status} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-5">
          <PriceBreakdownCard vehicleLabel={quotation.vehicleLabel} lines={quotation.lines} total={quotation.total} />
          {quotation.coordinatorMessage && (
            <CoordinatorMessageCard message={quotation.coordinatorMessage} meta={quotation.messageMeta} />
          )}
          <RouteCargoCard
            title="Your order"
            divider={false}
            pickup={quotation.order.pickup}
            destination={quotation.order.destination}
            cargo={quotation.order.cargo}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <QuotationDecisionCard
            quotation={quotation}
            status={status}
            accepting={quote.accepting}
            declining={quote.declining}
            acceptError={quote.acceptError}
            onAccept={() => void quote.acceptAndPay()}
            onDecline={() => setDeclineOpen(true)}
          />
          <OrderQuestionsCard
            orderId={quotation.orderId}
            hasTrip={false}
            title={status === 'awaiting' ? 'Not sure about the price?' : 'Questions about this quotation?'}
            description={
              status === 'awaiting'
                ? 'Ask the coordinator in this order’s chat room before you decide.'
                : 'Ask the coordinator in this order’s chat room.'
            }
          />
        </div>
      </div>

      {status === 'awaiting' && (
        <DeclineQuotationDialog
          open={declineOpen}
          orderId={quotation.orderId}
          total={quotation.total}
          pending={quote.declining}
          error={quote.declineError}
          onClose={() => setDeclineOpen(false)}
          onDecline={quote.declineWithReason}
        />
      )}
    </div>
  )
}
