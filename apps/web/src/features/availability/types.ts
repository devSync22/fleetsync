export type VehicleStatus = 'available' | 'on-trip' | 'assigned' | 'in-maintenance'
export type DriverStatus = 'available' | 'on-trip' | 'assigned' | 'off-duty'
export type MechanicStatus = 'available' | 'off-duty'

export interface Vehicle {
  plate: string
  type: string
  capacityKg: number
  odometerKm: number
  status: VehicleStatus
  /** The assigned or in-progress trip using this vehicle. */
  tripId: string | null
  /** Maintenance reason, for vehicles in maintenance. */
  note: string | null
}

export interface Driver {
  name: string
  licence: string
  status: DriverStatus
  tripId: string | null
}

export interface Mechanic {
  name: string
  speciality: string
  status: MechanicStatus
  /** Assigned or in-progress trips this mechanic is matched to. */
  activeTripCount: number
}

export interface Availability {
  vehicles: Vehicle[]
  drivers: Driver[]
  mechanics: Mechanic[]
}

/** Tabs of the Availability page; also the `?resource=` URL value. */
export type ResourceKind = keyof Availability
