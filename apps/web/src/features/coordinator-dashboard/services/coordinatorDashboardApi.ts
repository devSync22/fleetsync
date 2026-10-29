import { ApiError } from '@/services/apiClient'
import { coordinatorDashboardMock, emptyCoordinatorDashboardMock } from '../mocks/coordinatorDashboardMock'
import type { CoordinatorDashboard } from '../types'

const MOCK_LATENCY_MS = 500

/**
 * Coordinator dashboard summary.
 *
 * Mocked until the backend endpoint exists. When it does, replace the body with:
 *   const { data } = await apiClient.get<CoordinatorDashboard>('/coordinator/dashboard')
 *   return data
 *
 * In dev, add `?mock=empty` or `?mock=error` to the URL to preview those states.
 */
export async function getCoordinatorDashboard(): Promise<CoordinatorDashboard> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

  const scenario = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('mock') : null
  if (scenario === 'error') {
    throw new ApiError('Check your connection and try again. If it keeps happening, contact support.')
  }
  return scenario === 'empty' ? emptyCoordinatorDashboardMock : coordinatorDashboardMock
}
