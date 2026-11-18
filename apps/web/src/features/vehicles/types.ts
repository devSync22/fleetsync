import type { Paged } from '@/lib/paging'

export type VehicleType = 'light-truck' | 'heavy-truck' | 'van' | 'pickup' | 'refrigerated-truck'

/**
 * Available / In maintenance / Out of service are set by the administrator;
 * On trip and Trip scheduled are set automatically from trips.
 */
export type VehicleStatus = 'available' | 'on-trip' | 'trip-scheduled' | 'in-maintenance' | 'out-of-service'
export type ManualVehicleStatus = Extract<VehicleStatus, 'available' | 'in-maintenance' | 'out-of-service'>

export type CapacityUnit = 't' | 'kg'

/** Where the vehicle stands against its next service (calculated from the odometer and service types). */
export type NextService = { kind: 'due-in'; km: number } | { kind: 'overdue'; km: number } | { kind: 'in-workshop' }

export type Vehicle = {
  /** Registration number, unique: "WP CAB-4521". */
  plate: string
  model: string
  year: number
  chassisNo: string
  type: VehicleType
  capacity: number
  capacityUnit: CapacityUnit
  odometerKm: number
  nextService: NextService
  status: VehicleStatus
}

export type VehiclesQuery = { search: string; type: VehicleType | 'all'; status: VehicleStatus | 'all'; page: number }

export type VehiclesPage = Paged<Vehicle> & { statusCounts: Record<VehicleStatus | 'all', number> }

/** What the Add / Edit vehicle form sends. */
export type VehicleInput = {
  plate: string
  model: string
  year: number
  type: VehicleType
  capacity: number
  capacityUnit: CapacityUnit
  odometerKm: number
  status: ManualVehicleStatus
}
