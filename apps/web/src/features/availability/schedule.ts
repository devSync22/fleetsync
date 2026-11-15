import type { ScheduledPerson, ScheduledVehicle, TimeWindow, VehicleWindowStatus } from './types'

/** The timeline shows 06:00–20:00. */
export const DAY_START = 6 * 60
export const DAY_END = 20 * 60

export const timeWindows: TimeWindow[] = [
  { id: '06-12', label: '06:00 – 12:00', start: '06:00', end: '12:00' },
  { id: '08-14', label: '08:00 – 14:00', start: '08:00', end: '14:00' },
  { id: '12-18', label: '12:00 – 18:00', start: '12:00', end: '18:00' },
  { id: '14-20', label: '14:00 – 20:00', start: '14:00', end: '20:00' },
]

export const DEFAULT_WINDOW = timeWindows[1]

/** Days the date picker offers; only 22 Oct has bookings in the mock. */
export const scheduleDates = [
  { id: '2026-10-22', label: 'Wed, 22 Oct 2026' },
  { id: '2026-10-23', label: 'Thu, 23 Oct 2026' },
  { id: '2026-10-24', label: 'Fri, 24 Oct 2026' },
  { id: '2026-10-25', label: 'Sat, 25 Oct 2026' },
  { id: '2026-10-26', label: 'Sun, 26 Oct 2026' },
]

export function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** Position on the 06:00–20:00 timeline, 0–100. */
export function timelinePercent(time: string) {
  const clamped = Math.min(Math.max(toMinutes(time), DAY_START), DAY_END)
  return ((clamped - DAY_START) / (DAY_END - DAY_START)) * 100
}

function overlaps(booking: { start: string; end: string }, window: TimeWindow) {
  return toMinutes(booking.start) < toMinutes(window.end) && toMinutes(booking.end) > toMinutes(window.start)
}

/** Service in the window wins over trips: the vehicle is in the workshop. */
export function vehicleStatus(vehicle: ScheduledVehicle, window: TimeWindow): VehicleWindowStatus {
  const inWindow = vehicle.bookings.filter((b) => overlaps(b, window))
  if (inWindow.some((b) => b.kind === 'service')) return 'maintenance'
  return inWindow.length > 0 ? 'busy' : 'free'
}

export function isPersonFree(person: ScheduledPerson, window: TimeWindow) {
  return !person.bookings.some((b) => overlaps(b, window))
}

/** "Free all day", "Busy from 15:00", "Busy until 10:00", "Free from 13:00". */
export function personLabel(person: ScheduledPerson, window: TimeWindow) {
  if (person.bookings.length === 0) return 'Free all day'
  const current = person.bookings.find((b) => overlaps(b, window))
  if (current) {
    return toMinutes(current.start) <= toMinutes(window.start) ? `Busy until ${current.end}` : `Busy from ${current.start}`
  }
  const later = person.bookings.find((b) => toMinutes(b.start) >= toMinutes(window.end))
  if (later) return `Busy from ${later.start}`
  const earlier = person.bookings.at(-1)
  return earlier ? `Free from ${earlier.end}` : 'Free all day'
}
