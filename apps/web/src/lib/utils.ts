import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** shadcn's class-name helper: joins classes and merges Tailwind conflicts (later ones win). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const lkrFormatter = new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 })

/** 24600 → "LKR 24,600" */
export function formatLKR(amount: number) {
  return `LKR ${lkrFormatter.format(amount)}`
}

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
