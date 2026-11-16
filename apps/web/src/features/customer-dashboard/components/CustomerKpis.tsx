import { Activity, TrendingUp, Truck, Users } from 'lucide-react'
import { KpiCard } from '@/components/shared/KpiCard'
import type { CustomerDashboard } from '../types'

/** The four KPI cards; icons and tones as in the Figma frame. */
export function CustomerKpis({ kpis }: { kpis: CustomerDashboard['kpis'] }) {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <KpiCard icon={Activity} tone="info" label="Open orders" value={kpis.openOrders.value} meta={kpis.openOrders.caption} />
      <KpiCard
        icon={TrendingUp}
        tone="accent"
        label="Quotations to review"
        value={kpis.quotationsToReview.value}
        meta={kpis.quotationsToReview.caption}
      />
      <KpiCard
        icon={Users}
        tone="success"
        label="Trips in progress"
        value={kpis.tripsInProgress.value}
        meta={kpis.tripsInProgress.caption}
      />
      <KpiCard
        icon={Truck}
        label="Completed this month"
        value={kpis.completedThisMonth.value}
        meta={kpis.completedThisMonth.caption}
      />
    </div>
  )
}
