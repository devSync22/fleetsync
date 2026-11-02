import { ApiError } from '@/services/apiClient'
import { submittedOrdersMock } from '../mocks/submittedOrdersMock'
import type { SubmittedOrder } from '../types'

const MOCK_LATENCY_MS = 500

/**
 * All orders customers have submitted, newest first.
 *
 * Mocked until the backend endpoint exists. When it does, replace the body with:
 *   const { data } = await apiClient.get<SubmittedOrder[]>('/coordinator/orders')
 *   return data
 *
 * In dev, add `mock=empty` or `mock=error` to the URL query to preview those states.
 */
export async function getSubmittedOrders(): Promise<SubmittedOrder[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

  const scenario = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('mock') : null
  if (scenario === 'error') {
    throw new ApiError('Check your connection and try again. If it keeps happening, contact support.')
  }
  return scenario === 'empty' ? [] : submittedOrdersMock
}
