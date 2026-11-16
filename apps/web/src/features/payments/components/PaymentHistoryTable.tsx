import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { cn, formatLKR } from '@/lib/utils'
import type { PaymentHistoryRow } from '../types'

const cell = 'py-3 pr-3.5 first:pl-5 last:pr-5'
const headCell = 'py-2 pr-3.5 text-xs font-medium whitespace-nowrap text-muted-foreground first:pl-5 last:pr-5'

type PaymentHistoryTableProps = {
  rows: PaymentHistoryRow[]
  selectedInvoiceId: string | null
  onSelect: (invoiceId: string) => void
}

/**
 * Payment rows of "Customer — Payment history" (162:6243). Clicking a row with an invoice (or its
 * Invoice button) selects it; failed attempts have no invoice.
 */
export function PaymentHistoryTable({ rows, selectedInvoiceId, onSelect }: PaymentHistoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="border-b bg-background">
          <tr>
            <th scope="col" className={cn(headCell, 'w-[110px]')}>Date</th>
            <th scope="col" className={headCell}>Order</th>
            <th scope="col" className={cn(headCell, 'w-[120px] text-right')}>Amount · ref</th>
            <th scope="col" className={cn(headCell, 'w-[84px]')}>Status</th>
            <th scope="col" className={cn(headCell, 'w-[98px]')}>
              <span className="sr-only">Invoice</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const { invoiceId } = row
            const selected = invoiceId !== null && invoiceId === selectedInvoiceId
            return (
              <tr
                key={row.paymentId}
                aria-selected={invoiceId ? selected : undefined}
                onClick={invoiceId ? () => onSelect(invoiceId) : undefined}
                className={cn(
                  'border-b transition-colors last:border-b-0',
                  invoiceId && 'cursor-pointer',
                  selected ? 'bg-brand-soft' : invoiceId && 'hover:bg-secondary/50',
                )}
              >
                <td className={cell}>
                  <div className="flex flex-col gap-px whitespace-nowrap">
                    <span className="text-sm font-medium">{row.dateLabel}</span>
                    <span className="text-xs text-muted-foreground">{row.timeLabel}</span>
                  </div>
                </td>
                <td className={cell}>
                  <div className="flex min-w-0 flex-col gap-px">
                    <span className="font-mono text-sm font-medium">{row.orderId}</span>
                    <span className="text-xs text-muted-foreground">{row.routeOrReason}</span>
                  </div>
                </td>
                <td className={cn(cell, 'text-right')}>
                  <div className="flex flex-col items-end gap-px font-mono whitespace-nowrap">
                    <span className="text-[13px]">{formatLKR(row.amount)}</span>
                    <span className={cn('text-xs', row.reference ? 'text-muted-foreground' : 'text-faint')}>
                      {row.reference ?? '—'}
                    </span>
                  </div>
                </td>
                <td className={cell}>
                  <StatusBadge status={row.status} />
                </td>
                <td className={cn(cell, 'text-right')}>
                  {invoiceId ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-pressed={selected}
                      aria-label={`Invoice for ${row.orderId}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        onSelect(invoiceId)
                      }}
                    >
                      Invoice
                    </Button>
                  ) : (
                    <span className="text-[13px] text-faint" aria-label="No invoice">
                      —
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
