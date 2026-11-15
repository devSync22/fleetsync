/**
 * Small shared helpers. `cn` is shadcn's class-name helper (merges Tailwind
 * classes, later ones win), used by every component in components/ui.
 */
export { cn } from 'cn'

/** "2026-10-26" or a Date → "26 Oct 2026", the date style used across the designs. */
export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** A Date → "09:05" (24-hour clock). */
export function formatTime(value: Date): string {
  return value.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/** A Date → "23 Oct 2026, 09:05". */
export function formatDateTime(value: Date): string {
  return `${formatDate(value)}, ${formatTime(value)}`
}

/** 125000 → "LKR 125,000.00" — the money format used across the designs. */
export function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
