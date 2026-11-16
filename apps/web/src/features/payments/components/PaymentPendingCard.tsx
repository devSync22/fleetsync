import { Loader2 } from 'lucide-react'
import { formatLKR } from '@/lib/utils'
import type { PaymentResult } from '../types'
import { ResultCard } from './ResultCard'

/** Not in Figma: shown while PayHere's outcome is not known yet; the page keeps checking. */
export function PaymentPendingCard({ result }: { result: PaymentResult }) {
  return (
    <div role="status" aria-live="polite">
      <ResultCard
        icon={Loader2}
        spinning
        tone="info"
        title="Confirming your payment…"
        message={`PayHere is confirming your payment of ${formatLKR(result.amount)} for ${result.orderId}. This usually takes a few seconds. Please keep this page open.`}
      />
    </div>
  )
}
