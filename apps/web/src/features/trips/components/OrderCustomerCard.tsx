import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatLKR } from '@/lib/utils'
import type { TripDetail } from '../types'
import { KeyValueRow } from '@/components/shared/KeyValueRow'

export function OrderCustomerCard({ trip }: { trip: TripDetail }) {
  return (
    <SectionCard title="Order and customer">
      <dl className="flex flex-col gap-3.5 px-5 py-[18px]">
        <KeyValueRow label="Order" mono>
          {trip.orderId}
        </KeyValueRow>
        <KeyValueRow label="Customer">{trip.customerName}</KeyValueRow>
        <KeyValueRow label="Contact">{trip.customerContact ?? '—'}</KeyValueRow>
        <KeyValueRow label="Payment">
          <StatusBadge status={trip.paymentStatus} />
        </KeyValueRow>
        <KeyValueRow label="Quoted fare" mono>
          {trip.quotedFare === null ? '—' : formatLKR(trip.quotedFare)}
        </KeyValueRow>
      </dl>
    </SectionCard>
  )
}
