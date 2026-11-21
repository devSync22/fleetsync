import { handlingOptions, packingTypes } from './newOrderOptions'
import type { HandlingFlag, NewOrderCargo, NewOrderDestination, NewOrderPickup } from './types'

/** "8,000" / "8000" / " 8 000 " → 8000; NaN when it isn't a number. */
export function parseNumber(value: string) {
  const cleaned = value.replace(/[,\s]/g, '')
  return cleaned === '' ? Number.NaN : Number(cleaned)
}

/** "2026-10-23" → local Date at midnight (no UTC shift); null when empty or invalid. */
export function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

/** Date + "HH:MM" → Date; the time defaults to `fallbackTime` when empty. */
export function combine(date: string, time: string, fallbackTime = '00:00') {
  const day = parseDate(date)
  const [h, m] = (time || fallbackTime).split(':').map(Number)
  if (!day || Number.isNaN(h) || Number.isNaN(m)) return null
  day.setHours(h, m, 0, 0)
  return day
}

const longDay = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
const shortDay = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
const dayMonth = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const number = new Intl.NumberFormat('en-LK', { maximumFractionDigits: 1 })

/** "Thu, 23 Oct 2026" */
export const formatLongDay = (date: Date) => longDay.format(date).replace(/^(\w{3})/, '$1,').replace(',,', ',')
/** "Thu 23 Oct" */
export const formatShortDay = (date: Date) => shortDay.format(date).replace(',', '')
/** "23 Oct" */
export const formatDayMonth = (date: Date) => dayMonth.format(date)
/** 8000 → "8,000" */
export const formatNumber = (value: number) => number.format(value)

/** "Thu 23 Oct, 08:00" for the summary card; empty when there's no date. */
export function pickupWhenShort(pickup: NewOrderPickup) {
  const day = parseDate(pickup.date)
  if (!day) return ''
  return pickup.time ? `${formatShortDay(day)}, ${pickup.time}` : formatShortDay(day)
}

/** "Thu, 23 Oct 2026 · 08:00" for the Review step. */
export function pickupWhenLong(pickup: NewOrderPickup) {
  const day = parseDate(pickup.date)
  if (!day) return '—'
  return pickup.time ? `${formatLongDay(day)} · ${pickup.time}` : formatLongDay(day)
}

/**
 * "23 Oct, before 15:00" (`withDay`) or "Before 15:00" when it's the pickup day.
 * Empty when no deliver-by was given.
 */
export function deliverByText(destination: NewOrderDestination, pickupDate: string, withDay: boolean) {
  const { deliverByDate, deliverByTime } = destination
  if (!deliverByDate && !deliverByTime) return ''
  const day = parseDate(deliverByDate || pickupDate)
  const sameDay = !deliverByDate || deliverByDate === pickupDate
  const dayText = day && (withDay || !sameDay) ? formatDayMonth(day) : ''
  if (!deliverByTime) return dayText ? `By ${dayText}` : ''
  return dayText ? `${dayText}, before ${deliverByTime}` : `Before ${deliverByTime}`
}

/** "No. 82, …, Colombo 15" — adds the city when the address doesn't already end with it. */
export function fullAddress(address: string, city: string) {
  const trimmed = address.trim()
  if (!city || trimmed.toLowerCase().includes(city.toLowerCase())) return trimmed
  return trimmed ? `${trimmed}, ${city}` : city
}

/** "16 pallets" / "1 pallet"; empty when the quantity isn't a number yet. */
export function quantityText(cargo: NewOrderCargo) {
  const count = parseNumber(cargo.quantity)
  if (!cargo.packing || !Number.isFinite(count)) return ''
  const [one, many] = packingTypes[cargo.packing].unit
  return `${formatNumber(count)} ${count === 1 ? one : many}`
}

/** "8,000 kg"; empty when no valid weight. */
export function weightText(cargo: NewOrderCargo) {
  const kg = parseNumber(cargo.weightKg)
  return Number.isFinite(kg) && kg > 0 ? `${formatNumber(kg)} kg` : ''
}

/** "Ceramic tiles · 8,000 kg · 16 pallets" — only the parts filled in so far. */
export function cargoSummary(cargo: NewOrderCargo) {
  return [cargo.cargoType, weightText(cargo), quantityText(cargo)].filter(Boolean).join(' · ')
}

/** "Fragile, keep upright, forklift at pickup"; "None" when nothing is ticked. */
export function handlingText(flags: HandlingFlag[]) {
  const labels = handlingOptions.filter((o) => flags.includes(o.id)).map((o, i) => (i === 0 ? o.label : o.label.toLowerCase()))
  return labels.length ? labels.join(', ') : 'None'
}
