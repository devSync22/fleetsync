import type { DomainStatus } from '@/components/shared/statusTones'
import type { DashboardOrderStatus } from './types'

/** "Good morning" / "Good afternoon" / "Good evening" by the local time. */
export function greeting(now = new Date()) {
  const hour = now.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/** "Lanka Tiles PLC · 1 quotation is waiting for your answer." — just the company when nothing waits. */
export function dashboardSubtitle(companyName: string, quotationsWaiting: number) {
  if (quotationsWaiting === 0) return companyName
  const waiting = quotationsWaiting === 1 ? '1 quotation is' : `${quotationsWaiting} quotations are`
  return `${companyName} · ${waiting} waiting for your answer.`
}

/** The badge each status shows; the same wording as My orders ("Trip in progress", "Quote declined"). */
export const orderStatusBadge: Record<DashboardOrderStatus, DomainStatus> = {
  'pending-review': 'pending-review',
  quoted: 'quoted',
  accepted: 'accepted',
  'trip-scheduled': 'trip-scheduled',
  'in-progress': 'trip-in-progress',
  completed: 'completed',
  declined: 'quote-declined',
  'quotation-expired': 'quotation-expired',
  cancelled: 'cancelled',
}
