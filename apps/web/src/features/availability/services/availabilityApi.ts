import { fleetDrivers, fleetMechanics, fleetVehicles } from '@/mocks/fleetMock'
import { ApiError } from '@/services/apiClient'
import type { Availability } from '../types'

const MOCK_LATENCY_MS = 500

/**
 * Today's vehicles, drivers and mechanics with what each is doing now.
 *
 * Mocked until the backend endpoint exists. When it does, replace the body with:
 *   const { data } = await apiClient.get<Availability>('/coordinator/availability')
 *   return data
 *
 * In dev, add `mock=empty` or `mock=error` to the URL query to preview those states.
 */
export async function getAvailability(): Promise<Availability> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

  const scenario = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('mock') : null
  if (scenario === 'error') {
    throw new ApiError('Check your connection and try again. If it keeps happening, contact support.')
  }
  if (scenario === 'empty') return { vehicles: [], drivers: [], mechanics: [] }
  return { vehicles: fleetVehicles, drivers: fleetDrivers, mechanics: fleetMechanics }
}
