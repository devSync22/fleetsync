import { router } from 'expo-router';

import type { AuthUser } from '@/features/auth/types';

import { openTap } from './NotificationsProvider';
import type { NotificationTap, NotificationType } from './types';

const driver: AuthUser = {
  id: 'usr-drv-014',
  name: 'Kasun Jayasinghe',
  role: 'driver',
  staffId: 'DRV-014',
  email: 'kasun.j@fleetms.lk',
  depot: 'Colombo depot',
};
const mechanic: AuthUser = { ...driver, id: 'usr-mec-012', name: 'Ishara Bandara', role: 'mechanic', staffId: 'MEC-012' };

const tripData = { tripId: 'TRP-2208', orderId: 'ORD-1053' };
const chatData = { roomId: 'ORD-1053', orderId: 'ORD-1053', threadId: 't-1', participantId: 'usr-crd-003' };

function tap(type: NotificationType, user: AuthUser, data: NotificationTap['data'] = tripData): NotificationTap {
  return { id: 'ntf-1', type, userId: user.id, data };
}

describe('notification tap routing (driver)', () => {
  it('opens the trip for "trip assigned"', () => {
    openTap(tap('trip_assigned', driver), driver);
    expect(router.navigate).toHaveBeenCalledWith({ pathname: '/driver/trip/[tripId]', params: { tripId: 'TRP-2208' } });
  });

  it('opens the trip for "trip updated"', () => {
    openTap(tap('trip_updated', driver), driver);
    expect(router.navigate).toHaveBeenCalledWith({ pathname: '/driver/trip/[tripId]', params: { tripId: 'TRP-2208' } });
  });

  it('opens Home for "trip cancelled"', () => {
    openTap(tap('trip_cancelled', driver), driver);
    expect(router.navigate).toHaveBeenCalledWith('/driver/home');
  });

  it('opens the sender’s thread in the chat room for a chat message', () => {
    openTap(tap('chat_message', driver, chatData), driver);
    expect(router.navigate).toHaveBeenCalledWith({
      pathname: '/driver/chat/[roomId]',
      params: { roomId: 'ORD-1053', with: 'usr-crd-003' },
    });
  });
});

describe('notification tap routing (mechanic)', () => {
  it('opens the mechanic chat room for a chat message', () => {
    openTap(tap('chat_message', mechanic, chatData), mechanic);
    expect(router.navigate).toHaveBeenCalledWith({
      pathname: '/mechanic/chat/[roomId]',
      params: { roomId: 'ORD-1053', with: 'usr-crd-003' },
    });
  });

  it.each<NotificationType>(['trip_assigned', 'trip_updated', 'trip_cancelled'])(
    'opens nothing for %s (trip screens are driver-only)',
    (type) => {
      openTap(tap(type, mechanic), mechanic);
      expect(router.navigate).not.toHaveBeenCalled();
    },
  );
});

describe('notification tap safety', () => {
  it('opens nothing when the tap was for a different user', () => {
    openTap(tap('trip_assigned', mechanic), driver);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('opens nothing for a chat message without a room', () => {
    openTap(tap('chat_message', driver, {}), driver);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
