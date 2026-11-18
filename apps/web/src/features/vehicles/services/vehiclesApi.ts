import { paginate, textMatches } from '@/lib/paging'
import { ApiError } from '@/services/apiClient'
import { mockRequest } from '@/services/mockRequest'
import { vehiclesMock } from '../mocks/vehiclesMock'
import type { ManualVehicleStatus, Vehicle, VehicleInput, VehiclesPage, VehiclesQuery, VehicleStatus } from '../types'

/*
 * Mocked until the Fleet module endpoints exist. Planned calls:
 *   getVehicles      → apiClient.get<VehiclesPage>('/vehicles', { params: query })
 *   getVehicle       → apiClient.get<Vehicle>(`/vehicles/${encodeURIComponent(plate)}`)
 *   createVehicle    → apiClient.post<Vehicle>('/vehicles', input)
 *   updateVehicle    → apiClient.put<Vehicle>(`/vehicles/${encodeURIComponent(plate)}`, input)
 *   setVehicleStatus → apiClient.put(`/vehicles/${encodeURIComponent(plate)}/status`, { status })
 * Changes are kept in memory for the session. In dev, `?mock=error` / `?mock=empty` preview those states.
 */

const vehicles: Vehicle[] = vehiclesMock.map((v) => ({ ...v }))

/** Shortest service interval in Reference data (Oil & filter, every 5,000 km), used for new vehicles. */
const FIRST_SERVICE_INTERVAL_KM = 5000

/** "wp cab 4521" → "WP CAB-4521"-ish comparison key, so spacing and dashes don't create duplicates. */
const plateKey = (plate: string) => plate.toUpperCase().replace(/[\s-]/g, '')

function findVehicle(plate: string) {
  const vehicle = vehicles.find((v) => plateKey(v.plate) === plateKey(plate))
  if (!vehicle) throw new ApiError(`Vehicle ${plate} was not found.`, 404)
  return vehicle
}

export async function getVehicles(query: VehiclesQuery): Promise<VehiclesPage> {
  const scenario = await mockRequest()
  const source = scenario === 'empty' ? [] : vehicles
  const statusCounts = { all: source.length } as VehiclesPage['statusCounts']
  for (const status of ['available', 'on-trip', 'trip-scheduled', 'in-maintenance', 'out-of-service'] as VehicleStatus[]) {
    statusCounts[status] = source.filter((v) => v.status === status).length
  }
  const rows = source.filter(
    (v) =>
      (query.type === 'all' || v.type === query.type) &&
      (query.status === 'all' || v.status === query.status) &&
      (textMatches(v.plate, query.search) || textMatches(v.model, query.search) || textMatches(v.chassisNo, query.search)),
  )
  return { ...paginate(rows, query.page), statusCounts }
}

export async function getVehicle(plate: string): Promise<Vehicle> {
  await mockRequest()
  return { ...findVehicle(plate) }
}

function normalisePlate(plate: string) {
  return plate.trim().toUpperCase().replace(/\s+/g, ' ')
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  await mockRequest()
  if (vehicles.some((v) => plateKey(v.plate) === plateKey(input.plate))) {
    throw new ApiError(`A vehicle with registration ${normalisePlate(input.plate)} already exists.`, 409)
  }
  const vehicle: Vehicle = {
    ...input,
    plate: normalisePlate(input.plate),
    chassisNo: '—',
    nextService: { kind: 'due-in', km: FIRST_SERVICE_INTERVAL_KM - (input.odometerKm % FIRST_SERVICE_INTERVAL_KM) },
  }
  vehicles.unshift(vehicle)
  return vehicle
}

export async function updateVehicle(plate: string, input: VehicleInput): Promise<Vehicle> {
  await mockRequest()
  const vehicle = findVehicle(plate)
  if (input.odometerKm < vehicle.odometerKm) {
    throw new ApiError(`The odometer can’t go down (it was ${vehicle.odometerKm.toLocaleString('en-LK')} km).`, 422)
  }
  const automatic = vehicle.status === 'on-trip' || vehicle.status === 'trip-scheduled'
  // The registration number is the key and can't change; trip-driven statuses are kept.
  Object.assign(vehicle, { ...input, plate: vehicle.plate, status: automatic ? vehicle.status : input.status })
  if (vehicle.nextService.kind === 'due-in') {
    vehicle.nextService = { kind: 'due-in', km: Math.max(0, vehicle.nextService.km - (input.odometerKm - vehicle.odometerKm)) }
  }
  return { ...vehicle }
}

export async function setVehicleStatus(plate: string, status: ManualVehicleStatus): Promise<Vehicle> {
  await mockRequest()
  const vehicle = findVehicle(plate)
  if (vehicle.status === 'on-trip' || vehicle.status === 'trip-scheduled') {
    throw new ApiError(`${vehicle.plate} has a trip. Wait for it to finish, or ask a coordinator to reassign it.`, 409)
  }
  vehicle.status = status
  if (status === 'in-maintenance') vehicle.nextService = { kind: 'in-workshop' }
  else if (vehicle.nextService.kind === 'in-workshop') vehicle.nextService = { kind: 'due-in', km: FIRST_SERVICE_INTERVAL_KM }
  return { ...vehicle }
}

/** Every vehicle (all pages) for the Export button. */
export async function getAllVehicles(): Promise<Vehicle[]> {
  await mockRequest()
  return vehicles.map((v) => ({ ...v }))
}
