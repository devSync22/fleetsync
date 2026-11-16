import { Loader2 } from 'lucide-react'
import { Link } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { Button } from '@/components/ui/button'
import { formatLKR } from '@/lib/utils'
import type { ApiError } from '@/services/apiClient'
import type { CustomerQuotation, QuotationStatus } from '../types'

type QuotationDecisionCardProps = {
  quotation: CustomerQuotation
  status: QuotationStatus
  accepting: boolean
  declining: boolean
  acceptError: ApiError | null
  onAccept: () => void
  onDecline: () => void
}

/**
 * "Amount to pay" with Accept and pay / Decline quotation (Figma). After a decision the buttons
 * are replaced by "Go to payment" or "View order" (accepted) or a short line (declined, expired).
 */
export function QuotationDecisionCard({
  quotation,
  status,
  accepting,
  declining,
  acceptError,
  onAccept,
  onDecline,
}: QuotationDecisionCardProps) {
  const orderPath = `/customer/orders/${quotation.orderId}`
  const toPay = status === 'awaiting' || (status === 'accepted' && quotation.paymentDue)
  const busy = accepting || declining

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-5" aria-label="Your decision">
      <div className="flex flex-col gap-1">
        <p className="text-[13px] text-muted-foreground">{toPay ? 'Amount to pay' : 'Quotation total'}</p>
        <p className="font-mono text-[30px] leading-9 font-medium">{formatLKR(quotation.total)}</p>
      </div>

      {status === 'awaiting' && (
        <>
          {acceptError && <Banner tone="danger" title="Couldn’t accept the quotation" message={acceptError.message} />}
          <Button type="button" className="w-full" onClick={onAccept} disabled={busy}>
            {accepting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Accepting…
              </>
            ) : (
              'Accept and pay'
            )}
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={onDecline} disabled={busy}>
            Decline quotation
          </Button>
          <p className="text-xs leading-[18px] text-muted-foreground">
            Accepting takes you to online payment. Your trip is scheduled once the payment is received.
          </p>
        </>
      )}

      {status === 'accepted' &&
        (quotation.paymentDue ? (
          <Button asChild className="w-full">
            <Link to={`/customer/quotations/${quotation.orderId}/pay`}>Go to payment</Link>
          </Button>
        ) : (
          <Button asChild variant="outline" className="w-full">
            <Link to={orderPath}>View order</Link>
          </Button>
        ))}

      {status === 'declined' && <p className="text-[13px] text-muted-foreground">You declined this quotation, so there is nothing to pay.</p>}
      {status === 'expired' && <p className="text-[13px] text-muted-foreground">This quotation has expired and can no longer be accepted.</p>}
    </section>
  )
}
