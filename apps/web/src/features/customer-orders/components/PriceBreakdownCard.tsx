import { SectionCard } from '@/components/shared/SectionCard'
import { formatLKR } from '@/lib/utils'
import type { QuotationLine } from '../types'

type PriceBreakdownCardProps = { vehicleLabel: string; lines: QuotationLine[]; total: number }

/** "Price breakdown": one row per charge, then the total on a grey band. */
export function PriceBreakdownCard({ vehicleLabel, lines, total }: PriceBreakdownCardProps) {
  return (
    <SectionCard title="Price breakdown" subtitle={vehicleLabel}>
      <ul>
        {lines.map((line) => (
          <li key={line.label} className="flex items-center gap-3 border-b px-5 py-3">
            <div className="flex min-w-0 flex-1 flex-col gap-px">
              <p className="text-sm font-medium">{line.label}</p>
              <p className="text-xs text-muted-foreground">{line.detail}</p>
            </div>
            <p className="shrink-0 font-mono text-sm whitespace-nowrap">{formatLKR(line.amount)}</p>
          </li>
        ))}
      </ul>
      <div className="flex items-center bg-background px-5 py-4">
        <p className="flex-1 text-[15px] font-semibold">Total</p>
        <p className="font-mono text-xl font-medium whitespace-nowrap">{formatLKR(total)}</p>
      </div>
    </SectionCard>
  )
}
