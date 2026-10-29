import { CreditCard } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatLKR } from '@/lib/utils'
import { plural } from '../format'
import type { PaymentSummary } from '../types'
import { DashboardCard } from './DashboardCard'

export function OrderPaymentsCard({ payments }: { payments: PaymentSummary[] }) {
  return (
    <DashboardCard title="Order payments" subtitle="This week" link={{ label: 'View all', to: '/coordinator/orders' }}>
      {payments.length === 0 ? (
        <EmptyState
          bare
          icon={CreditCard}
          title="No payments this week"
          description="Card payments made through PayHere will be summarised here."
        />
      ) : (
        <ul className="flex flex-col gap-2.5 px-5 py-4 text-[13px]">
          {payments.map((payment) => (
            <li key={payment.status} className="flex items-center gap-3">
              <StatusBadge status={payment.status} />
              <span className="min-w-0 flex-1">{plural(payment.orderCount, 'order')}</span>
              <span className="shrink-0 font-mono font-medium whitespace-nowrap">{formatLKR(payment.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  )
}
