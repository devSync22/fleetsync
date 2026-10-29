import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import type { CoordinatorDashboard } from '../types'
import { DashboardCard } from './DashboardCard'

type OperationalReportCardProps = {
  report: CoordinatorDashboard['report']
}

export function OperationalReportCard({ report }: OperationalReportCardProps) {
  return (
    <DashboardCard title="Operational report" subtitle="Trips, distance and on-time rate">
      <div className="flex flex-col gap-3 px-5 py-4">
        <p className="text-[13px] text-muted-foreground">
          {report
            ? `Last generated ${report.lastGeneratedLabel} for ${report.periodLabel}.`
            : 'No report has been generated yet.'}
        </p>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/coordinator/reports">Generate</Link>
          </Button>
          {/* TODO: download the last report once the reports endpoint exists */}
          <Button type="button" variant="outline" size="sm" disabled={!report}>
            Export
          </Button>
        </div>
      </div>
    </DashboardCard>
  )
}
