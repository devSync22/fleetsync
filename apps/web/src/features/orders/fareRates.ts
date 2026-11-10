import type { FareLine, VehicleClass } from './types'

/** Vehicle classes offered in "Vehicle type needed", with the per-km rate the frames use. */
export const vehicleClasses: { id: VehicleClass; label: string; ratePerKm: number }[] = [
  { id: 'light-5', label: 'Light truck · up to 5 t', ratePerKm: 150 },
  { id: 'heavy-9', label: 'Heavy truck · up to 9 t', ratePerKm: 210 },
  { id: 'heavy-14', label: 'Heavy truck · up to 14 t', ratePerKm: 260 },
]

export function vehicleClassOf(id: VehicleClass) {
  return vehicleClasses.find((v) => v.id === id) ?? vehicleClasses[1]
}

/** The distance line is always "km × rate"; the rest are entered by the coordinator. */
export function distanceLine(distanceKm: number, vehicleClass: VehicleClass): FareLine {
  const { ratePerKm } = vehicleClassOf(vehicleClass)
  return {
    id: 'distance',
    label: 'Distance charge',
    detail: `${distanceKm} km × LKR ${ratePerKm}`,
    amount: distanceKm * ratePerKm,
  }
}

export function totalOf(lines: FareLine[]) {
  return lines.reduce((sum, line) => sum + (Number.isFinite(line.amount) ? line.amount : 0), 0)
}

/** "2026-10-20T18:00" → "20 Oct 2026, 18:00". */
export function formatValidUntil(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const day = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${day}, ${value.slice(11, 16)}`
}
