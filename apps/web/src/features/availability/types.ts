/** Times are "HH:MM" on the selected day. */
export interface Booking {
  kind: 'trip' | 'service'
  /** Trip ID for trips, "Service" for maintenance. */
  label: string
  start: string
  end: string
}

export interface ScheduledVehicle {
  plate: string
  model: string
  capacityTonnes: number
  bookings: Booking[]
}

export interface ScheduledPerson {
  name: string
  initials: string
  /** "Heavy · DRV-022", "Heavy vehicle · Kurunegala". */
  detail: string
  bookings: { start: string; end: string }[]
}

export interface DaySchedule {
  date: string
  vehicles: ScheduledVehicle[]
  drivers: ScheduledPerson[]
  mechanics: ScheduledPerson[]
}

export type VehicleWindowStatus = 'free' | 'busy' | 'maintenance'

export interface TimeWindow {
  id: string
  label: string
  start: string
  end: string
}
