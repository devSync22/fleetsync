import type { ManualVehicleStatus, VehicleStatus, VehicleType } from './types'

/** Vehicle types with the hint shown in the type picker (Add vehicle, 378:7357). */
export const vehicleTypes: { id: VehicleType; label: string; hint: string }[] = [
  { id: 'light-truck', label: 'Light truck', hint: 'Up to 5 t' },
  { id: 'heavy-truck', label: 'Heavy truck', hint: '5 t and above' },
  { id: 'van', label: 'Van', hint: 'Small loads and parcels' },
  { id: 'pickup', label: 'Pickup', hint: 'Short local trips' },
  { id: 'refrigerated-truck', label: 'Refrigerated truck', hint: 'Cold chain cargo' },
]

export const vehicleTypeLabel = (type: VehicleType) => vehicleTypes.find((t) => t.id === type)?.label ?? type

/** Status cards across the top of the Vehicles page, in frame order. */
export const statusFilters: { id: VehicleStatus | 'all'; label: string; dot: string | null }[] = [
  { id: 'all', label: 'All vehicles', dot: null },
  { id: 'available', label: 'Available', dot: 'bg-success' },
  { id: 'on-trip', label: 'On trip', dot: 'bg-info' },
  { id: 'in-maintenance', label: 'In maintenance', dot: 'bg-pending' },
  { id: 'out-of-service', label: 'Out of service', dot: 'bg-danger' },
]

/** Options of "Operating status" on the form. */
export const manualStatuses: { id: ManualVehicleStatus; label: string; hint: string }[] = [
  { id: 'available', label: 'Available', hint: 'Can be assigned to trips' },
  { id: 'in-maintenance', label: 'In maintenance', hint: 'Hidden from trips until it is ready' },
  { id: 'out-of-service', label: 'Out of service', hint: 'Off the road or retired' },
]

/** A next service closer than this is flagged "Due soon". */
export const DUE_SOON_KM = 1000
