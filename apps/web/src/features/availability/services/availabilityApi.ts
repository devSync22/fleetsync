import { ApiError } from '@/services/apiClient'
import { driversMock, mechanicsMock, vehiclesMock } from '../mocks/availabilityMock'
import type { DaySchedule } from '../types'

const MOCK_DATE = '2026-10-22'

/**
 * Bookings for every vehicle, driver and mechanic on one day.
 *
 * Mocked until the backend endpoint exists. When it does, replace the body with:
 *   const { data } = await apiClient.get<DaySchedule>('/coordinator/availability', { params: { date } })
 *   return data
 *
 * Only 22 Oct 2026 has bookings in the mock; other days come back with everyone free.
 * In dev, add `mock=error` to the URL query to preview the error state.
 */
export async function getDaySchedule(date: string): Promise<DaySchedule> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  const scenario = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('mock') : null
  if (scenario === 'error') {
    throw new ApiError('Check your connection and try again. If it keeps happening, contact support.')
  }
  if (scenario === 'empty') return { date, vehicles: [], drivers: [], mechanics: [] }
  if (date === MOCK_DATE) return { date, vehicles: vehiclesMock, drivers: driversMock, mechanics: mechanicsMock }
  return {
    date,
    vehicles: vehiclesMock.map((v) => ({ ...v, bookings: [] })),
    drivers: driversMock.map((p) => ({ ...p, bookings: [] })),
    mechanics: mechanicsMock.map((p) => ({ ...p, bookings: [] })),
  }
}
