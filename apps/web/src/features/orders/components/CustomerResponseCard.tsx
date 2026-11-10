import { Link } from 'react-router'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { responseStatus } from '../quotationResponse'
import type { SentQuotation } from '../types'

/** How the customer has answered, and the follow-up that answer calls for. */
export function CustomerResponseCard({ quotation }: { quotation: SentQuotation }) {
  const { response, orderId } = quotation
  return (
    <SectionCard title="Customer response" subtitle={`${quotation.contactName} · ${quotation.customerName}`}>
      <div className="flex flex-col gap-3 px-5 py-[18px]">
        <div className="flex flex-wrap items-center gap-2.5">
          <StatusBadge status={responseStatus(response)} />
          <p className="text-[13px]">{response.note}</p>
        </div>

        {response.status === 'declined' && (
          <blockquote className="rounded-lg bg-background px-3 py-2.5 text-[13px] leading-5">
            <p className="text-xs text-muted-foreground">Reason from the customer</p>
            <p>“{response.reason}”</p>
          </blockquote>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          {response.status === 'accepted' && response.paid && (
            <Button asChild>
              <Link to={`/coordinator/orders/${orderId}`}>Go to the order</Link>
            </Button>
          )}
          {(response.status === 'awaiting' || (response.status === 'accepted' && !response.paid)) && (
            <Button asChild variant="outline">
              <Link to={`/coordinator/chat?order=${orderId}`}>
                {response.status === 'awaiting' ? 'Ask the customer in chat' : 'Remind them to retry payment'}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </SectionCard>
  )
}
