import { X } from 'lucide-react'
import { Link } from 'react-router'
import { KeyValueRow } from '@/components/shared/KeyValueRow'
import { Button } from '@/components/ui/button'
import { formatLKR } from '@/lib/utils'
import type { PaymentResult } from '../types'
import { ResultCard } from './ResultCard'

function failureMessage(result: PaymentResult) {
  const cause =
    result.failureReason === 'Declined by your bank'
      ? 'Your bank declined the payment, so no money was taken. Check your card details or try another card.'
      : 'The payment didn’t go through, so no money was taken. You can try again.'
  return `${cause} Your quotation is still valid until ${result.validUntilLabel}.`
}

/** "Customer — Payment / Failed" (161:6668). */
export function PaymentFailedCard({ result }: { result: PaymentResult }) {
  return (
    <ResultCard icon={X} tone="danger" title="Payment failed" message={failureMessage(result)}>
      <dl className="flex w-full flex-col gap-2.5 rounded-[10px] bg-background px-4 py-3.5">
        <KeyValueRow label="Amount" mono>
          {formatLKR(result.amount)}
        </KeyValueRow>
        {result.cardLast4 && <KeyValueRow label="Card">Card ending {result.cardLast4}</KeyValueRow>}
        <KeyValueRow label="Reason">{result.failureReason ?? 'Not given'}</KeyValueRow>
        <KeyValueRow label="Attempt">{result.dateLabel}</KeyValueRow>
      </dl>
      <div className="flex w-full flex-wrap gap-2.5">
        <Button asChild variant="outline" className="min-w-[160px] flex-1">
          <Link to={`/customer/quotations/${result.orderId}`}>Back to quotation</Link>
        </Button>
        <Button asChild className="min-w-[160px] flex-1">
          <Link to={`/customer/quotations/${result.orderId}/pay`}>Try again</Link>
        </Button>
      </div>
    </ResultCard>
  )
}
