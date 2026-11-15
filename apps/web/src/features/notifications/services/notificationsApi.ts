import { ApiError } from '@/services/apiClient'
import { notificationsMock } from '../mocks/notificationsMock'
import type { AppNotification } from '../types'

/*
 * Mocked until the notification endpoints exist:
 *   getNotifications → apiClient.get<AppNotification[]>('/notifications')
 *   markRead         → apiClient.post('/notifications/read', { ids })
 * In dev, add `mock=empty` or `mock=error` to the URL query to preview those states.
 */

const readIds = new Set<string>()

function mockMode() {
  return import.meta.env.DEV ? new URLSearchParams(window.location.search).get('mock') : null
}

export async function getNotifications(): Promise<AppNotification[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  if (mockMode() === 'error') throw new ApiError('Couldn’t load notifications. Try again.')
  if (mockMode() === 'empty') return []
  return notificationsMock.map((n) => (readIds.has(n.id) ? { ...n, unread: false } : n))
}

export async function markRead(ids: string[]): Promise<void> {
  ids.forEach((id) => readIds.add(id))
}
