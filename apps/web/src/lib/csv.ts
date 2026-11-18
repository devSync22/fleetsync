/** Quotes a CSV cell when it contains a comma, quote or line break (RFC 4180). */
function csvCell(value: string | number | null | undefined) {
  const text = value == null ? '' : String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * Builds a CSV file from a header row and data rows and makes the browser download it.
 * Used by the admin "Export" buttons until the API offers server-side exports.
 */
export function downloadCsv(fileName: string, header: string[], rows: (string | number | null | undefined)[][]) {
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
  // BOM so Excel opens UTF-8 names (e.g. "Ayesha’s") correctly.
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
