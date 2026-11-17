/** "17 Oct 2026, 10:12" — full date and 24h time. */
export function formatDateTime(date: Date) {
  return `${formatDate(date, true)}, ${formatTime(date)}`
}

/** "17 Oct, 10:12" — same as above without the year (timeline rows). */
export function formatShortDateTime(date: Date) {
  return `${formatDate(date, false)}, ${formatTime(date)}`
}

/** "17 Oct" or "17 Oct 2026". */
export function formatDate(date: Date, withYear: boolean) {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  })
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/** "1.1 MB" / "640 KB", as shown under each document. */
export function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}
