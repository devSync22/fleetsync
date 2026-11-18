import { ApiError } from './apiClient'

const MOCK_LATENCY_MS = 400

/**
 * Stand-in for a network call while a feature still runs on mock data.
 * Waits a moment (so loading states show), then returns the dev-only `mock` URL scenario:
 *   ?mock=error  → throws, to preview error banners
 *   ?mock=empty  → returned as "empty", so the service can answer with empty lists
 * Any other value is returned as-is for feature-specific scenarios.
 */
export async function mockRequest(): Promise<string | null> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))
  const scenario = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('mock') : null
  if (scenario === 'error') {
    throw new ApiError('Check your connection and try again. If it keeps happening, contact support.')
  }
  return scenario
}

/** Current time as "09:05", for "Today, 09:05" style mock timestamps. */
export function nowTime() {
  return new Date().toTimeString().slice(0, 5)
}
