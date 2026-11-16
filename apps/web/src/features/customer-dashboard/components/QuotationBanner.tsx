import { FileText } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { formatLKR } from '@/lib/utils'
import type { QuotationBannerData } from '../types'

/**
 * "Your fare quotation for … is ready". An accent call-to-action, not one of the shared Banner's
 * message tones (it has a white icon circle and a primary button), so it lives here.
 */
export function QuotationBanner({ quotation }: { quotation: QuotationBannerData }) {
  return (
    <div role="status" className="flex flex-wrap items-center gap-3.5 rounded-xl bg-brand-soft px-5 py-3.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-brand">
        <FileText className="size-[18px]" aria-hidden />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-sm font-semibold">Your fare quotation for {quotation.orderId} is ready</p>
        <p className="text-[13px] text-muted-foreground">
          {quotation.route} · {formatLKR(quotation.amount)} · valid until {quotation.validUntilLabel}
        </p>
      </div>
      <Button asChild>
        <Link to={`/customer/quotations/${quotation.orderId}`}>Review quotation</Link>
      </Button>
    </div>
  )
}
