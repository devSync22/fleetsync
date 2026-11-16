import { Link } from 'react-router'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { cn, formatLKR } from '@/lib/utils'
import { quotationRowBadge } from '../quotationTabs'
import type { QuotationListRow } from '../types'

// Same cell rhythm as the My orders table.
const cell = 'px-2 py-3 first:pl-5 last:pr-5 xl:px-2'
const headCell = 'px-2 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground first:pl-5 last:pr-5 xl:px-2'

/** Awaiting quotations get the dark "Review quote"; the rest "View". Both open the Fare quotation page. */
function QuotationAction({ row }: { row: QuotationListRow }) {
  const to = `/customer/quotations/${row.orderId}`
  return row.status === 'awaiting' ? (
    <Button asChild size="sm">
      <Link to={to}>Review quote</Link>
    </Button>
  ) : (
    <Button asChild variant="outline" size="sm">
      <Link to={to}>View</Link>
    </Button>
  )
}

/** The Quotations table (not in Figma; styled like "Customer — My orders"). */
export function QuotationsTable({ rows }: { rows: QuotationListRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b bg-background">
          <tr>
            <th scope="col" className={headCell}>Order</th>
            <th scope="col" className={headCell}>Route</th>
            <th scope="col" className={cn(headCell, 'w-[140px]')}>Valid until</th>
            <th scope="col" className={cn(headCell, 'w-[120px] text-right')}>Amount</th>
            <th scope="col" className={cn(headCell, 'w-[150px]')}>Status</th>
            <th scope="col" className={cn(headCell, 'w-[130px]')}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.orderId} className="border-b transition-colors last:border-b-0 hover:bg-secondary/50">
              <td className={cn(cell, 'font-mono text-sm font-medium whitespace-nowrap')}>{row.orderId}</td>
              <td className={cell}>
                <div className="flex flex-col gap-px">
                  <span className="whitespace-nowrap">{row.route}</span>
                  <span className="text-xs text-muted-foreground">Sent {row.sentAtLabel}</span>
                </div>
              </td>
              <td className={cn(cell, 'whitespace-nowrap', row.status !== 'awaiting' && 'text-muted-foreground')}>
                {row.validUntilLabel}
              </td>
              <td className={cn(cell, 'text-right font-mono whitespace-nowrap')}>{formatLKR(row.amount)}</td>
              <td className={cell}>
                <StatusBadge status={quotationRowBadge(row)} />
              </td>
              <td className={cn(cell, 'text-right')}>
                <QuotationAction row={row} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
