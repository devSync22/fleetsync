import { KeyValueRow } from '@/components/shared/KeyValueRow'
import { SectionCard } from '@/components/shared/SectionCard'
import { formatLKR } from '@/lib/utils'
import type { SentQuotation } from '../types'

/** Right-hand "Quotation summary" on the Quotation sent page. */
export function QuotationSummaryCard({ quotation }: { quotation: SentQuotation }) {
  return (
    <SectionCard title="Quotation summary">
      <dl className="flex flex-col gap-3.5 px-5 py-[18px]">
        <KeyValueRow label="Order" mono>{quotation.orderId}</KeyValueRow>
        <KeyValueRow label="Customer">{quotation.customerName}</KeyValueRow>
        <KeyValueRow label="Route">{quotation.route}</KeyValueRow>
        <KeyValueRow label="Vehicle type">{quotation.vehicleLabel}</KeyValueRow>
        <div className="h-px bg-border" />
        {quotation.lines.map((line) => (
          <KeyValueRow key={line.id} label={line.label} mono>
            {formatLKR(line.amount)}
          </KeyValueRow>
        ))}
        <div className="flex items-center gap-3">
          <dt className="flex-1 text-[13px] font-semibold">Total quotation</dt>
          <dd className="font-mono text-base font-medium">{formatLKR(quotation.total)}</dd>
        </div>
        <div className="h-px bg-border" />
        <KeyValueRow label="Valid until">{quotation.validUntilLabel}</KeyValueRow>
        <KeyValueRow label="Sent by">
          {quotation.sentBy} · {quotation.sentAt}
        </KeyValueRow>
        {quotation.message && (
          <p className="text-xs leading-[18px] text-muted-foreground">Message: “{quotation.message}”</p>
        )}
      </dl>
    </SectionCard>
  )
}
