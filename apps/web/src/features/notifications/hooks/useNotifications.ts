import { useCallback, useMemo, useState } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getNotifications, markRead } from '../services/notificationsApi'

/** The signed-in user's notifications, with read state kept locally after marking. */
export function useNotifications() {
  const { state, retry } = useAsyncData(getNotifications)
  const [readLocally, setReadLocally] = useState<Set<string>>(() => new Set())

  const items = useMemo(
    () => (state.status === 'success' ? state.data.map((n) => (readLocally.has(n.id) ? { ...n, unread: false } : n)) : []),
    [state, readLocally],
  )
  const unreadCount = items.filter((n) => n.unread).length

  const markAsRead = useCallback((ids: string[]) => {
    setReadLocally((previous) => new Set([...previous, ...ids]))
    void markRead(ids)
  }, [])

  const markAllAsRead = useCallback(() => markAsRead(items.filter((n) => n.unread).map((n) => n.id)), [items, markAsRead])

  return { state, retry, items, unreadCount, markAsRead, markAllAsRead }
}
