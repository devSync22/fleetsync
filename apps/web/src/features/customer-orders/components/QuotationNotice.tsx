import { Ban } from 'lucide-react'
import { Banner } from '@/components/shared/Banner'
import type { CustomerQuotation, QuotationStatus } from '../types'

/**
 * The line under the title: validity while awaiting (as in Figma), and — not in Figma —
 * what happened for accepted, declined and expired quotations.
 */
export function QuotationNotice({ quotation, status }: { quotation: CustomerQuotation; status: QuotationStatus }) {
  const when = quotation.decidedAtLabel ? ` · ${quotation.decidedAtLabel}` : ''

  switch (status) {
    case 'awaiting':
      return (
        <Banner
          tone="pending"
          title={`Valid until ${quotation.validUntilLabel}`}
          message="After that the quotation expires and the coordinator has to price the order again."
        />
      )
    case 'expired':
      return (
        <Banner
          tone="pending"
          title={`This quotation expired on ${quotation.validUntilLabel}`}
          message="The coordinator will price your order again and send you a new quotation. Ask in chat if you have questions."
        />
      )
    case 'accepted':
      return (
        <Banner
          tone="success"
          title={`You accepted this quotation${when}`}
          message={
            quotation.paymentDue
              ? 'Pay online to confirm the order. Your trip is scheduled once the payment is received.'
              : 'Follow your order’s progress on the order page.'
          }
        />
      )
    case 'declined':
      return (
        <div role="status" className="flex items-start gap-3 rounded-[10px] bg-secondary px-4 py-3.5">
          <Ban className="mt-px size-[18px] shrink-0 text-muted-foreground" aria-hidden />
          <div className="flex min-w-0 flex-col gap-0.5 leading-5">
            <p className="text-sm font-semibold">You declined this quotation{when}</p>
            <p className="text-[13px] text-muted-foreground">
              {quotation.declineReason ? `Your reason: “${quotation.declineReason}”` : 'You didn’t give a reason.'}
            </p>
          </div>
        </div>
      )
  }
}
