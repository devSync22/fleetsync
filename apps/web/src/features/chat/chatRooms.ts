import type { ChatRoom } from './types'

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

/** "Today", "Yesterday" or "12 Oct". */
export function dayLabel(iso: string) {
  const date = new Date(iso)
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/** "08:44". */
export function timeLabel(iso: string) {
  return new Date(iso).toTimeString().slice(0, 5)
}

/** Room-list time: the time for today, otherwise the day. */
export function activityLabel(iso: string) {
  const day = dayLabel(iso)
  return day === 'Today' ? timeLabel(iso) : day
}

/** "Nuwan: Small queue at the weighbridge…" / "You: Please keep the boxes upright." */
export function previewOf(room: ChatRoom, viewerId: string) {
  const last = room.lastMessage
  if (!last) return 'No messages yet'
  const sender = last.senderId === viewerId ? 'You' : last.senderName.split(' ')[0]
  return `${sender}: ${last.text}`
}

export function matchesRoom(room: ChatRoom, query: string) {
  const needle = query.trim().toLowerCase()
  return (
    !needle ||
    [room.orderId, room.tripId ?? '', room.customerName, room.route].some((f) => f.toLowerCase().includes(needle))
  )
}
