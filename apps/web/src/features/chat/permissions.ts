import type { ChatRole } from './types'

/**
 * Who may message whom — from the use case diagram, same rules as the mobile chat (chat/permissions.ts).
 * The coordinator talks to everyone on the order; everyone else talks only to the coordinator.
 */
const allowed: Record<ChatRole, readonly ChatRole[]> = {
  coordinator: ['customer', 'driver', 'mechanic'],
  customer: ['coordinator'],
  driver: ['coordinator'],
  mechanic: ['coordinator'],
}

export function canMessage(currentUserRole: ChatRole, participantRole: ChatRole) {
  return allowed[currentUserRole].includes(participantRole)
}
