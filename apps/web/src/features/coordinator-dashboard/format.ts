import type { CoordinatorDashboard } from './types'

export function greeting(now = new Date()) {
  const hour = now.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

/** 55 → "55 min", 100 → "1 h 40 min" */
export function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes} min`
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`
}

/** "6 orders need a fare quotation, 2 quotations expire soon and 1 trip has not started on time." */
export function attentionSummary(dashboard: CoordinatorDashboard) {
  const { ordersToQuote, tripsNotStartedOnTime } = dashboard
  const expiring = dashboard.expiringQuotations.length
  const parts: string[] = []
  if (ordersToQuote > 0) {
    parts.push(`${ordersToQuote} ${ordersToQuote === 1 ? 'order needs' : 'orders need'} a fare quotation`)
  }
  if (expiring > 0) {
    parts.push(`${expiring} ${expiring === 1 ? 'quotation expires' : 'quotations expire'} soon`)
  }
  if (tripsNotStartedOnTime > 0) {
    parts.push(`${tripsNotStartedOnTime} ${tripsNotStartedOnTime === 1 ? 'trip has' : 'trips have'} not started on time`)
  }
  if (parts.length === 0) return 'Nothing needs your attention right now.'
  if (parts.length === 1) return `${parts[0]}.`
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}.`
}
