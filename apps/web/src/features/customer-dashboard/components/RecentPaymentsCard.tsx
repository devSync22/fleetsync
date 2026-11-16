import { CreditCard } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionCard } from '@/components/shared/SectionCard'
import type { RecentPayment } from '../types'
import { RecentPaymentRow } from './RecentPaymentRow'

/** "Recent payments": the newest paid orders, each with its invoice. */
export function RecentPaymentsCard({ payments }: { payments: RecentPayment[] }) {
  return (
    <SectionCard title="Recent payments" link={{ label: 'All payments', to: '/customer/payments' }}>
      {payments.length > 0 ? (
        <ul>
          {payments.map((payment) => (
            <RecentPaymentRow key={payment.invoiceId} payment={payment} />
          ))}
        </ul>
      ) : (
        <EmptyState
          bare
          icon={CreditCard}
          title="No payments yet"
          description="When you pay for an accepted quotation, the payment and its invoice show here."
        />
      )}
    </SectionCard>
  )
}
