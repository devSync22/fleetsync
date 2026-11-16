import { Check } from 'lucide-react'
import { Link } from 'react-router'
import { KeyValueRow } from '@/components/shared/KeyValueRow'
import { Button } from '@/components/ui/button'
import { formatLKR } from '@/lib/utils'
import type { PaymentResult } from '../types'
import { ResultCard } from './ResultCard'

// TODO: read the account's receipt email from AuthContext once sign-in exists
const RECEIPT_EMAIL = 'orders@lankatiles.lk'

/** "Customer — Payment / Success" (161:6347). */
export function PaymentSuccessCard({ result }: { result: PaymentResult }) {
  return (
    <ResultCard
      icon={Check}
      tone="success"
      title="Payment successful"
      message={`We received ${formatLKR(result.amount)} for ${result.orderId}. The coordinator will now schedule your trip and assign a vehicle and driver.`}
    >
      <dl className="flex w-full flex-col gap-2.5 rounded-[10px] bg-background px-4 py-3.5">
        <KeyValueRow label="Amount" mono>
          {formatLKR(result.amount)}
        </KeyValueRow>
        <KeyValueRow label="Paid with">Card ending {result.cardLast4}</KeyValueRow>
        <KeyValueRow label="Reference" mono>
          {result.reference}
        </KeyValueRow>
        <KeyValueRow label="Date">{result.dateLabel}</KeyValueRow>
      </dl>
      <div className="flex w-full flex-wrap gap-2.5">
        {result.invoiceId && (
          <Button asChild variant="outline" className="min-w-[160px] flex-1">
            <Link to={`/customer/payments?invoice=${result.invoiceId}`}>Download invoice</Link>
          </Button>
        )}
        <Button asChild className="min-w-[160px] flex-1">
          <Link to={`/customer/orders/${result.orderId}`}>View order</Link>
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">A receipt has also been sent to {RECEIPT_EMAIL}.</p>
    </ResultCard>
  )
}
