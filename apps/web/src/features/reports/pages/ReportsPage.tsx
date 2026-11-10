import { Banner } from '@/components/shared/Banner'
import { PageHeader } from '@/components/shared/PageHeader'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { RecentExportsCard } from '../components/RecentExportsCard'
import { ReportPreviewCard } from '../components/ReportPreviewCard'
import { ReportSettingsCard } from '../components/ReportSettingsCard'
import { useReports } from '../hooks/useReports'

/** "Coordinator — Operational reports" (142:5026). */
export function ReportsPage() {
  const reports = useReports()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Operational reports"
        description="Generate a report for a period, check it here, then export it as PDF or Excel."
      />

      {reports.state.status === 'error' && (
        <Banner
          tone="danger"
          title="Couldn’t load reports"
          message={reports.state.error.message}
          action={
            <Button type="button" variant="outline" size="sm" onClick={reports.retry}>
              Try again
            </Button>
          }
        />
      )}

      {reports.state.status !== 'error' && (
        // Below xl the columns stack as settings → report → recent exports, so the report sits right under Generate.
        <div className="grid items-start gap-6 xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-x-6 xl:gap-y-5">
          <div className="xl:col-start-1 xl:row-start-1">
            <ReportSettingsCard generating={reports.generating} onGenerate={reports.generate} />
          </div>
          <div className="max-xl:order-last xl:col-start-1 xl:row-start-2">
            {reports.state.status === 'success' ? (
              <RecentExportsCard exports={reports.exports} />
            ) : (
              <Skeleton className="h-[220px] w-full rounded-xl" />
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-4 xl:col-start-2 xl:row-span-2 xl:row-start-1">
            {reports.error && <Banner tone="danger" title="That didn’t work" message={reports.error.message} />}
            {reports.report && !reports.generating ? (
              <ReportPreviewCard report={reports.report} exporting={reports.exportingNow} onExport={reports.exportAs} />
            ) : (
              <div aria-busy="true" aria-label="Generating report" className="flex flex-col gap-4">
                <TableSkeleton rows={6} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
