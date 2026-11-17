import { ApiError } from '@/services/apiClient'
import { notificationsMock } from '../mocks/notificationsMock'
import type { AppNotification, NotificationRole } from '../types'

/*
 * Mocked until the notification endpoints exist:
 *   getNotifications → apiClient.get<AppNotification[]>('/notifications') (the role comes from the signed-in user)
 *   markRead         → apiClient.post('/notifications/read', { ids })
 * In dev, add `mock=empty` or `mock=error` to the URL query to preview those states.
 */

const readIds = new Set<string>()

function mockMode() {
  return import.meta.env.DEV ? new URLSearchParams(window.location.search).get('mock') : null
}

export async function getNotifications(role: NotificationRole = 'coordinator'): Promise<AppNotification[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  if (mockMode() === 'error') throw new ApiError('Couldn’t load notifications. Try again.')
  if (mockMode() === 'empty') return []
  return notificationsMock[role].map((n) => (readIds.has(n.id) ? { ...n, unread: false } : n))
}

export async function markRead(ids: string[]): Promise<void> {
  ids.forEach((id) => readIds.add(id))
}

// Tests only: clears read state so each test starts from the mock data.
export function resetNotificationsMockForTests() {
  readIds.clear()
}
