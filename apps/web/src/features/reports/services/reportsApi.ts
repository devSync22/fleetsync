import { ApiError } from '@/services/apiClient'
import { recentExportsMock, reportContent } from '../mocks/reportsMock'
import { bases, customers, labelOf, periods, reportTypeLabel } from '../reportOptions'
import type { ExportFormat, Report, ReportExport, ReportSettings } from '../types'

/*
 * Mocked until the report endpoints exist:
 *   getReportsHome → apiClient.get<{ report: Report; exports: ReportExport[] }>('/coordinator/reports')
 *   generateReport → apiClient.post<Report>('/coordinator/reports', settings)
 *   exportReport   → apiClient.post<ReportExport>('/coordinator/reports/export', { settings, format })
 * The mock returns the same numbers whatever the period, base or customer.
 * In dev, add `mock=error` to the URL query to preview the error state.
 */

const COORDINATOR_NAME = 'Nimal Perera'

export const defaultSettings: ReportSettings = { type: 'trip-summary', period: periods[0].id, base: 'all', customer: 'all' }

async function mockRequest(ms = 400) {
  await new Promise((resolve) => setTimeout(resolve, ms))
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('mock') === 'error') {
    throw new ApiError('Check your connection and try again. If it keeps happening, contact support.')
  }
}

function buildReport(settings: ReportSettings, generatedAt: string): Report {
  const periodLabel = labelOf(periods, settings.period)
  const base = settings.base === 'all' ? 'all bases' : labelOf(bases, settings.base)
  const customer = settings.customer === 'all' ? 'all customers' : labelOf(customers, settings.customer)
  const scope = `${base}, ${customer}`
  return {
    type: settings.type,
    title: reportTypeLabel(settings.type),
    periodLabel,
    subtitle: `Generated today at ${generatedAt} by ${COORDINATOR_NAME} · ${scope}`,
    ...reportContent[settings.type],
  }
}

export async function getReportsHome(): Promise<{ report: Report; exports: ReportExport[] }> {
  await mockRequest()
  return { report: buildReport(defaultSettings, '10:32'), exports: recentExportsMock }
}

export async function generateReport(settings: ReportSettings): Promise<Report> {
  await mockRequest(600)
  return buildReport(settings, new Date().toTimeString().slice(0, 5))
}

let nextExport = 1

export async function exportReport(report: Report, format: ExportFormat): Promise<ReportExport> {
  await mockRequest(300)
  // TODO: the real endpoint returns a file URL to download
  return {
    id: `new-${nextExport++}`,
    title: `${report.title} · ${report.periodLabel}`,
    format,
    by: COORDINATOR_NAME,
    dateLabel: 'Today',
  }
}
