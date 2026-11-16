import { Loader2 } from 'lucide-react'
import { Link } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { KeyValueRow } from '@/components/shared/KeyValueRow'
import { Button } from '@/components/ui/button'
import { formatLKR } from '@/lib/utils'
import type { ApiError } from '@/services/apiClient'
import type { PaymentSummary } from '../types'

type PaymentSummaryCardProps = {
  summary: PaymentSummary
  paying: boolean
  error: ApiError | null
  onPay: () => void
}

/** "Payment summary": what is paid for, the total, "Pay LKR …" and "Back to quotation". */
export function PaymentSummaryCard({ summary, paying, error, onPay }: PaymentSummaryCardProps) {
  return (
    <section className="flex flex-col gap-3.5 rounded-xl border bg-card p-5">
      <h2 className="text-[15px] font-semibold">Payment summary</h2>
      <dl className="flex flex-col gap-3.5">
        <KeyValueRow label="Order" mono>
          {summary.orderId}
        </KeyValueRow>
        <KeyValueRow label="Route">{summary.route}</KeyValueRow>
        <KeyValueRow label="Pickup">{summary.pickupLabel}</KeyValueRow>
        <KeyValueRow label="Fare quotation" mono>
          {formatLKR(summary.quotationAmount)}
        </KeyValueRow>
      </dl>
      <hr className="border-border" />
      <div className="flex items-center gap-3">
        <p className="flex-1 text-[15px] font-semibold">Total to pay</p>
        <p className="font-mono text-lg font-medium whitespace-nowrap">{formatLKR(summary.total)}</p>
      </div>

      {error && (
        <Banner
          tone="danger"
          title={error.status === 409 ? 'This order can’t be paid now' : 'Couldn’t start the payment'}
          message={error.message}
        />
      )}

      <Button type="button" className="w-full" onClick={onPay} disabled={paying}>
        {paying ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            Waiting for PayHere…
          </>
        ) : (
          `Pay ${formatLKR(summary.total)}`
        )}
      </Button>
      <Button asChild variant="ghost" className="w-full text-brand hover:text-brand">
        <Link to={`/customer/quotations/${summary.orderId}`}>Back to quotation</Link>
      </Button>
    </section>
  )
}
