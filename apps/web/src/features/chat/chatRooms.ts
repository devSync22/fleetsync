import type { ChatMessage, ChatRole, ChatRoom } from './types'

function sortKey(message: ChatMessage) {
  return `${message.day === 'Today' ? 1 : 0}-${message.time}`
}

/** The most recent message in the room and who it was with. */
export function latestMessage(room: ChatRoom): { role: ChatRole; message: ChatMessage } | null {
  let latest: { role: ChatRole; message: ChatMessage } | null = null
  for (const person of room.people) {
    const last = room.messages[person.role]?.at(-1)
    if (last && (!latest || sortKey(last) > sortKey(latest.message))) latest = { role: person.role, message: last }
  }
  return latest
}

/** "Nuwan: Small queue at the weighbridge…" / "You: Please keep the boxes upright." */
export function previewOf(room: ChatRoom) {
  const latest = latestMessage(room)
  if (!latest) return 'No messages yet'
  const person = room.people.find((p) => p.role === latest.role)
  const sender = latest.message.from === 'me' ? 'You' : (person?.name.split(' ')[0] ?? '')
  return `${sender}: ${latest.message.text}`
}

/** Who to open by default: the person the coordinator last talked to in this room. */
export function defaultRole(room: ChatRoom): ChatRole {
  return latestMessage(room)?.role ?? room.people[0]?.role ?? 'customer'
}

export function matchesRoom(room: ChatRoom, query: string) {
  const needle = query.trim().toLowerCase()
  return !needle || [room.orderId, room.tripId ?? '', room.customerName].some((f) => f.toLowerCase().includes(needle))
}
