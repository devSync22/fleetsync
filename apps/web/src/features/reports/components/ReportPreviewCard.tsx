import { SectionCard } from '@/components/shared/SectionCard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ExportFormat, Report } from '../types'
import { DailyBarChart } from './DailyBarChart'

type ReportPreviewCardProps = {
  report: Report
  exporting: boolean
  onExport: (format: ExportFormat) => void
}

/** The generated report: four headline numbers, the per-day chart and the breakdown table. */
export function ReportPreviewCard({ report, exporting, onExport }: ReportPreviewCardProps) {
  const isDaily = report.chart.bars.every((b) => /^\d+$/.test(b.label))
  const monthSuffix = isDaily ? report.periodLabel.split(' ').at(-2) ?? '' : ''
  const numeric = (i: number) => i > 0

  return (
    <SectionCard
      title={`${report.title} · ${report.periodLabel}`}
      subtitle={report.subtitle}
      action={
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onExport('PDF')} disabled={exporting}>
            Export PDF
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onExport('Excel')} disabled={exporting}>
            Export Excel
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 px-5 py-[18px]">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {report.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1 rounded-[10px] bg-background px-3.5 py-3">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xl leading-7 font-semibold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.note}</p>
            </div>
          ))}
        </div>

        <DailyBarChart chart={report.chart} labelSuffix={monthSuffix} />

        <div className="overflow-x-auto rounded-[10px] border">
          <table className="w-full text-[13px]">
            <thead className="border-b bg-background">
              <tr>
                {report.table.columns.map((column, i) => (
                  <th
                    key={column}
                    scope="col"
                    className={cn('px-4 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground', numeric(i) ? 'text-right' : 'text-left')}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.table.rows.map((row) => (
                <tr key={row[0]} className="border-b last:border-b-0">
                  {row.map((value, i) =>
                    i === 0 ? (
                      <th key={i} scope="row" className="px-4 py-[11px] text-left font-medium">
                        {value}
                      </th>
                    ) : (
                      <td key={i} className="px-4 py-[11px] text-right font-mono whitespace-nowrap">
                        {value}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
            {report.table.total && (
              <tfoot className="border-t bg-background">
                <tr>
                  {report.table.total.map((value, i) =>
                    i === 0 ? (
                      <th key={i} scope="row" className="px-4 py-[11px] text-left font-semibold">
                        {value}
                      </th>
                    ) : (
                      <td key={i} className="px-4 py-[11px] text-right font-mono font-medium whitespace-nowrap">
                        {value}
                      </td>
                    ),
                  )}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </SectionCard>
  )
}
