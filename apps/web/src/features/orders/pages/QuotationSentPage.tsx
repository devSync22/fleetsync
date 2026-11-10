import { SearchX } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { EmptyState } from '@/components/shared/EmptyState'
import { NotificationPreview } from '@/components/shared/NotificationPreview'
import { NotificationsTable } from '@/components/shared/NotificationsTable'
import { ResultHeader } from '@/components/shared/ResultHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatLKR } from '@/lib/utils'
import { QuotationSummaryCard } from '../components/QuotationSummaryCard'
import { useSentQuotation } from '../hooks/useSentQuotation'

/** "Quotation sent" (507:11349): shown right after Send quotation. */
export function QuotationSentPage() {
  const { orderId = '' } = useParams()
  const { state, retry } = useSentQuotation(orderId)

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: 'Submitted orders', to: '/coordinator/orders' }, { label: orderId, mono: true }]} />

      {state.status === 'loading' && (
        <div aria-busy="true" aria-label="Loading quotation" className="flex flex-col gap-6">
          <Skeleton className="h-[126px] w-full rounded-xl" />
          <TableSkeleton rows={2} />
        </div>
      )}

      {state.status === 'error' &&
        (state.error.status === 404 ? (
          <EmptyState
            className="mx-auto mt-6 w-[380px]"
            icon={SearchX}
            tone="accent"
            title="No quotation sent yet"
            description={state.error.message}
            action={
              <Button asChild variant="outline">
                <Link to={`/coordinator/orders/${orderId}`}>Review the order</Link>
              </Button>
            }
          />
        ) : (
          <Banner
            tone="danger"
            title="Couldn’t load the quotation"
            message={state.error.message}
            action={
              <Button type="button" variant="outline" size="sm" onClick={retry}>
                Try again
              </Button>
            }
          />
        ))}

      {state.status === 'success' && (
        <>
          <ResultHeader
            tone="success"
            title={`Quotation sent for ${state.data.orderId}`}
            badge={<StatusBadge status="quoted" />}
            description={`${state.data.customerName} was sent a fare quotation of ${formatLKR(state.data.total)} by email and in their account. It is valid until ${state.data.validUntilLabel}.`}
            actions={
              <>
                <Button asChild variant="outline">
                  <Link to={`/coordinator/chat?order=${state.data.orderId}`}>Open chat</Link>
                </Button>
                <Button asChild>
                  <Link to="/coordinator/orders?status=quoted">Back to orders</Link>
                </Button>
              </>
            }
          />

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex min-w-0 flex-col gap-5">
              <NotificationsTable
                title="Sent to the customer"
                subtitle="Sent automatically when you clicked Send quotation"
                notifications={[
                  {
                    name: state.data.contactName,
                    initials: state.data.contactInitials,
                    role: 'Customer',
                    sentTo: 'Email',
                    sentAt: state.data.sentAt,
                    status: state.data.delivery.email,
                  },
                  {
                    name: state.data.contactName,
                    initials: state.data.contactInitials,
                    role: 'Customer',
                    sentTo: 'Customer account',
                    sentAt: state.data.sentAt,
                    status: state.data.delivery.account,
                  },
                ]}
                footnote="If the customer has not answered 2 hours before the quotation expires, it appears on your dashboard."
              />
              <NotificationPreview
                audience="customer"
                title={`Fare quotation ready · ${state.data.orderId}`}
                body={`${formatLKR(state.data.total)} · valid until ${state.data.validUntilLabel.replace(/ \d{4},/, ',')}. Open it to accept and pay, or decline.`}
                effects={[
                  'They can accept and pay online, or decline',
                  'They can ask you a question in the order’s chat',
                  'The order moves to Quoted in Submitted orders',
                ]}
              />
            </div>
            <QuotationSummaryCard quotation={state.data} />
          </div>
        </>
      )}
    </div>
  )
}
