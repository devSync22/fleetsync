import { useCallback, useState } from 'react'
import { useAction } from '@/hooks/useAction'
import { useAsyncData } from '@/hooks/useAsyncData'
import { exportReport, generateReport, getReportsHome } from '../services/reportsApi'
import type { ExportFormat, Report, ReportExport, ReportSettings } from '../types'

/** The last generated report and recent exports, plus Generate and Export. */
export function useReports() {
  const { state, retry } = useAsyncData(getReportsHome)
  const [generated, setGenerated] = useState<Report | null>(null)
  const [newExports, setNewExports] = useState<ReportExport[]>([])
  const generate = useAction(generateReport)
  const exporting = useAction(exportReport)

  const report = generated ?? (state.status === 'success' ? state.data.report : null)
  const exports = state.status === 'success' ? [...newExports, ...state.data.exports] : []

  const runGenerate = useCallback(
    async (settings: ReportSettings) => {
      const result = await generate.run(settings)
      if (result) setGenerated(result)
    },
    [generate],
  )

  const runExport = useCallback(
    async (format: ExportFormat) => {
      if (!report) return
      const result = await exporting.run(report, format)
      if (result) setNewExports((previous) => [result, ...previous])
    },
    [exporting, report],
  )

  return {
    state,
    retry,
    report,
    exports,
    generate: runGenerate,
    generating: generate.pending,
    exportAs: runExport,
    exportingNow: exporting.pending,
    error: generate.error ?? exporting.error,
  }
}
