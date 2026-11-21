import { useCallback, useMemo, useState } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getNotifications, markRead } from '../services/notificationsApi'
import type { NotificationRole } from '../types'

/** The signed-in user's notifications, marked read optimistically (rolled back if the call fails). */
export function useNotifications(role: NotificationRole = 'coordinator') {
  const load = useCallback(() => getNotifications(role), [role])
  const { state, retry } = useAsyncData(load)
  const [readLocally, setReadLocally] = useState<Set<string>>(() => new Set())

  const items = useMemo(
    () => (state.status === 'success' ? state.data.map((n) => (readLocally.has(n.id) ? { ...n, unread: false } : n)) : []),
    [state, readLocally],
  )
  const unreadCount = items.filter((n) => n.unread).length

  const markAsRead = useCallback((ids: string[]) => {
    setReadLocally((previous) => new Set([...previous, ...ids]))
    markRead(ids).catch(() =>
      setReadLocally((previous) => new Set([...previous].filter((id) => !ids.includes(id)))),
    )
  }, [])

  const markAllAsRead = useCallback(() => markAsRead(items.filter((n) => n.unread).map((n) => n.id)), [items, markAsRead])

  return { state, retry, items, unreadCount, markAsRead, markAllAsRead }
}
