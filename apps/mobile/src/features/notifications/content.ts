import type { Trip } from '@/features/trips';
import { formatTime } from '@/lib/format';

import type { AppNotification } from './types';

/**
 * Notification text, as in Figma "Driver — New trip notification" (298:7543). The phone draws the app name,
 * icon and time; only the title and body come from here.
 * Not in the frame (written to match): trip cancelled and trip updated.
 */

const newId = () => `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const createdNow = (userId: string) => ({ id: newId(), userId, createdAt: new Date().toISOString() });
const destinationOf = (trip: Trip) => `${trip.destination.name}, ${trip.destination.area}`;
const coordinatorOf = (trip: Trip) => trip.people.find((person) => person.role === 'Coordinator')?.name ?? 'The coordinator';

/** "New trip assigned · TRP-2208" / "Colombo Pharma → City Hospital store, Negombo. Pickup 09:30 with WP LB-7702. Tap to open the trip." */
export function tripAssignedNotification(userId: string, trip: Trip): AppNotification {
  return {
    ...createdNow(userId),
    type: 'trip_assigned',
    title: `New trip assigned · ${trip.id}`,
    body: `${trip.pickup.shortName} → ${destinationOf(trip)}. Pickup ${formatTime(trip.scheduledStart)} with ${trip.vehicle.plate}. Tap to open the trip.`,
    data: { tripId: trip.id, orderId: trip.orderId },
  };
}

export function tripCancelledNotification(userId: string, trip: Trip): AppNotification {
  return {
    ...createdNow(userId),
    type: 'trip_cancelled',
    title: `Trip cancelled · ${trip.id}`,
    body: `${coordinatorOf(trip)} cancelled your trip to ${destinationOf(trip)}. Tap to go to Home.`,
    data: { tripId: trip.id, orderId: trip.orderId },
  };
}

export function tripUpdatedNotification(userId: string, trip: Trip): AppNotification {
  return {
    ...createdNow(userId),
    type: 'trip_updated',
    title: `Trip updated · ${trip.id}`,
    body: `${coordinatorOf(trip)} changed your trip to ${destinationOf(trip)}. Tap to open the trip.`,
    data: { tripId: trip.id, orderId: trip.orderId },
  };
}

/** "Message from Nimal Perera" / the message text. */
export function chatMessageNotification(
  userId: string,
  message: { roomId: string; threadId: string; senderId: string; text: string },
  senderName: string,
): AppNotification {
  return {
    ...createdNow(userId),
    type: 'chat_message',
    title: `Message from ${senderName}`,
    body: message.text,
    data: { roomId: message.roomId, orderId: message.roomId, threadId: message.threadId, participantId: message.senderId },
  };
}
