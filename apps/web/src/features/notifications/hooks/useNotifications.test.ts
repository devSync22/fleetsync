import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { notificationsMock } from '../mocks/notificationsMock'
import { resetNotificationsMockForTests } from '../services/notificationsApi'
import type { NotificationRole } from '../types'
import { useNotifications } from './useNotifications'

const roles: NotificationRole[] = ['coordinator', 'customer', 'admin', 'owner']

beforeEach(() => resetNotificationsMockForTests())

describe('useNotifications', () => {
  for (const role of roles) {
    it(`counts the ${role}'s unread notifications`, async () => {
      const { result } = renderHook(() => useNotifications(role))
      await waitFor(() => expect(result.current.state.status).toBe('success'))
      expect(result.current.unreadCount).toBe(notificationsMock[role].filter((n) => n.unread).length)
    })
  }

  it('lowers the count when one is marked read, and reaches 0 after mark all', async () => {
    const { result } = renderHook(() => useNotifications('coordinator'))
    await waitFor(() => expect(result.current.state.status).toBe('success'))
    const before = result.current.unreadCount
    const firstUnread = result.current.items.find((n) => n.unread)!

    act(() => result.current.markAsRead([firstUnread.id]))
    expect(result.current.unreadCount).toBe(before - 1)

    act(() => result.current.markAllAsRead())
    expect(result.current.unreadCount).toBe(0)
  })
})
