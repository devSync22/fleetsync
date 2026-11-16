import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { formatLKR } from '@/lib/utils'
import type { RecentPayment } from '../types'

export function RecentPaymentRow({ payment }: { payment: RecentPayment }) {
  return (
    <li className="flex items-center gap-3 border-b px-5 py-3 last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="font-mono text-sm font-medium">{payment.orderId}</span>
        <span className="text-xs text-muted-foreground">{payment.paidLabel}</span>
      </div>
      <span className="font-mono text-[13px] font-medium whitespace-nowrap">{formatLKR(payment.amount)}</span>
      <Button asChild variant="ghost" size="sm" className="text-brand hover:text-brand">
        <Link to={`/customer/payments?invoice=${encodeURIComponent(payment.invoiceId)}`}>Invoice</Link>
      </Button>
    </li>
  )
}
