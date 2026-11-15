import { SearchX } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { EmptyState } from '@/components/shared/EmptyState'
import { NotificationPreview } from '@/components/shared/NotificationPreview'
import { NotificationsTable } from '@/components/shared/NotificationsTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { ResultHeader } from '@/components/shared/ResultHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatLKR } from '@/lib/utils'
import { CustomerResponseCard } from '../components/CustomerResponseCard'
import { QuotationSummaryCard } from '../components/QuotationSummaryCard'
import { responseStatus } from '../quotationResponse'
import { useSentQuotation } from '../hooks/useSentQuotation'
import type { SentQuotation } from '../types'

/** "17 Oct, 15:10" stays; a bare "11:20" (sent today) becomes "today at 11:20". */
function sentPhrase(sentAt: string) {
  if (/^\d{2}:\d{2}$/.test(sentAt)) return `today at ${sentAt}`
  return /^(Today|Yesterday)/.test(sentAt) ? sentAt[0].toLowerCase() + sentAt.slice(1) : `on ${sentAt}`
}

function SentToCustomer({ quotation }: { quotation: SentQuotation }) {
  const recipient = { name: quotation.contactName, initials: quotation.contactInitials, role: 'Customer', sentAt: quotation.sentAt }
  return (
    <NotificationsTable
      title="Sent to the customer"
      subtitle="Sent automatically when the quotation was sent"
      notifications={[
        { ...recipient, sentTo: 'Email', status: quotation.delivery.email },
        { ...recipient, sentTo: 'Customer account', status: quotation.delivery.account },
      ]}
      footnote="If the customer has not answered 2 hours before the quotation expires, it appears on your dashboard."
    />
  )
}

/**
 * "Quotation sent" (507:11349) right after Send quotation, and the quotation details for any quoted
 * order later on (no frame): the customer's response, who was told, and the fare breakdown.
 */
export function QuotationSentPage() {
  const { orderId = '' } = useParams()
  const justSent = (useLocation().state as { justSent?: boolean } | null)?.justSent === true
  const { state, retry } = useSentQuotation(orderId)

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[
          { label: 'Submitted orders', to: '/coordinator/orders' },
          { label: orderId, mono: true, to: `/coordinator/orders/${orderId}` },
          { label: 'Quotation' },
        ]}
      />

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
          {justSent ? (
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
          ) : (
            <PageHeader
              title={
                <span className="flex flex-wrap items-center gap-2.5">
                  Quotation for {state.data.orderId}
                  <StatusBadge status={responseStatus(state.data.response)} />
                </span>
              }
              description={`${formatLKR(state.data.total)} to ${state.data.customerName} · sent ${sentPhrase(state.data.sentAt)} by ${state.data.sentBy} · valid until ${state.data.validUntilLabel}`}
              actions={
                <>
                  <Button asChild variant="outline">
                    <Link to={`/coordinator/chat?order=${state.data.orderId}`}>Open chat</Link>
                  </Button>
                  <Button asChild>
                    <Link to={`/coordinator/orders/${state.data.orderId}`}>View order</Link>
                  </Button>
                </>
              }
            />
          )}

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex min-w-0 flex-col gap-5">
              {!justSent && <CustomerResponseCard quotation={state.data} />}
              <SentToCustomer quotation={state.data} />
              {justSent && (
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
              )}
            </div>
            <QuotationSummaryCard quotation={state.data} />
          </div>
        </>
      )}
    </div>
  )
}
