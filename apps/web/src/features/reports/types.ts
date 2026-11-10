export type ReportType = 'trip-summary' | 'vehicle-utilisation' | 'driver-activity' | 'orders-payments'
export type ExportFormat = 'PDF' | 'Excel'

export interface ReportSettings {
  type: ReportType
  period: string
  base: string
  customer: string
}

export interface ReportStat {
  label: string
  value: string
  note: string
}

export interface Report {
  type: ReportType
  title: string
  periodLabel: string
  /** "Generated today at 10:32 by Nimal Perera · all bases, all customers". */
  subtitle: string
  stats: ReportStat[]
  chart: {
    title: string
    /** Unit for the tooltip, e.g. "trips". */
    unit: string
    bars: { label: string; value: number }[]
  }
  table: {
    columns: string[]
    rows: string[][]
    total: string[] | null
  }
}

export interface ReportExport {
  id: string
  title: string
  format: ExportFormat
  by: string
  dateLabel: string
}
