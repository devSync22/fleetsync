import { Activity, TrendingUp, TriangleAlert, Truck } from 'lucide-react'
import { KpiCard } from '@/components/shared/KpiCard'
import { KpiCardSkeleton } from '@/components/shared/KpiCardSkeleton'
import { formatLKR } from '@/lib/utils'
import type { PaymentKpis as Kpis } from '../types'

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

/** The four KPI cards above the history; skeletons while `kpis` is null. */
export function PaymentKpis({ kpis }: { kpis: Kpis | null }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis ? (
        <>
          <KpiCard
            icon={Truck}
            label={`Paid in ${kpis.monthLabel}`}
            value={formatLKR(kpis.paidThisMonth.amount)}
            meta={plural(kpis.paidThisMonth.count, 'payment', 'payments')}
          />
          <KpiCard
            icon={Activity}
            tone="info"
            label="Last payment"
            value={kpis.lastPayment ? formatLKR(kpis.lastPayment.amount) : '—'}
            meta={kpis.lastPayment ? `${kpis.lastPayment.orderId} · ${kpis.lastPayment.dateLabel}` : 'No payments yet'}
          />
          <KpiCard
            icon={TriangleAlert}
            tone="danger"
            label="Failed attempts"
            value={kpis.failedThisMonth}
            meta="This month · no money taken"
          />
          <KpiCard
            icon={TrendingUp}
            tone="accent"
            label="Paid this year"
            value={formatLKR(kpis.paidThisYear.amount)}
            meta={plural(kpis.paidThisYear.orderCount, 'order', 'orders')}
          />
        </>
      ) : (
        Array.from({ length: 4 }, (_, i) => <KpiCardSkeleton key={i} />)
      )}
    </div>
  )
}
