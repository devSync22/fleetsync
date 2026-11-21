import { Link } from 'react-router'
import { KeyValueRow } from '@/components/shared/KeyValueRow'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatLKR } from '@/lib/utils'
import type { OrderPayment } from '../types'
import { DownloadInvoiceButton } from './DownloadInvoiceButton'

/** Quotation amount and how it was paid. While awaiting payment it shows "Pay now" instead. */
export function PaymentCard({ orderId, payment }: { orderId: string; payment: OrderPayment }) {
  const awaiting = payment.status === 'awaiting-payment'
  return (
    <SectionCard title="Payment" action={<StatusBadge status={payment.status} />}>
      <div className="flex flex-col gap-3.5 px-5 py-[18px]">
        <dl className="flex flex-col gap-3.5">
          <KeyValueRow label="Fare quotation" mono>
            {formatLKR(payment.quotationAmount)}
          </KeyValueRow>
          {payment.paidOn && <KeyValueRow label="Paid on">{payment.paidOn}</KeyValueRow>}
          {payment.method && <KeyValueRow label="Method">{payment.method}</KeyValueRow>}
          {payment.reference && (
            <KeyValueRow label="Reference" mono>
              {payment.reference}
            </KeyValueRow>
          )}
        </dl>
        {awaiting && (
          <p className="text-[13px] leading-5 text-muted-foreground">
            You accepted the quotation. Pay by card to confirm the order so a coordinator can schedule the trip.
          </p>
        )}
        {payment.status === 'refunded' && (
          <p className="text-[13px] leading-5 text-muted-foreground">
            The trip was cancelled, so the full amount was refunded to your card.
          </p>
        )}
        {awaiting && (
          <Button asChild size="sm" className="w-full">
            <Link to={`/customer/orders/${orderId}/pay`}>Pay now</Link>
          </Button>
        )}
        {payment.status === 'paid' && (
          <>
            <hr className="border-border" />
            <DownloadInvoiceButton size="sm" className="w-full" />
          </>
        )}
      </div>
    </SectionCard>
  )
}
