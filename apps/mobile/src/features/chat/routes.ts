import type { StaffRole } from '@/features/auth/types';

/** Route objects for the chat screens, so other features (trip screens) don't hard-code the paths. */

export function chatListHref(role: StaffRole) {
  return role === 'driver' ? ('/driver/chat' as const) : ('/mechanic/chat' as const);
}

/** An order's chat room, optionally opened on one participant's thread. */
export function chatRoomHref(role: StaffRole, orderId: string, participantId?: string) {
  const params = participantId ? { roomId: orderId, with: participantId } : { roomId: orderId };
  return role === 'driver'
    ? ({ pathname: '/driver/chat/[roomId]', params } as const)
    : ({ pathname: '/mechanic/chat/[roomId]', params } as const);
}
