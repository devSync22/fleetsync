import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import type { NotificationPermission, NotificationsService, NotificationTap, NotificationType } from '../types';

/**
 * Local notifications with expo-notifications — they work in Expo Go. Remote push (KAN-349) needs a
 * development build; it only has to deliver the same `data` payload so taps keep working.
 */

const CHANNEL_ID = 'default';
const TYPES: readonly NotificationType[] = ['trip_assigned', 'chat_message', 'trip_cancelled', 'trip_updated'];
const DATA_KEYS = ['tripId', 'orderId', 'roomId', 'threadId', 'participantId'] as const;

// Show notifications while the app is open too (e.g. a chat reply while on the Home tab).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    // Android hides the drop-down banner when sound is off.
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function toPermission(response: Notifications.NotificationPermissionsStatus): NotificationPermission {
  if (response.granted) return 'granted';
  return response.status === 'undetermined' ? 'undetermined' : 'denied';
}

// Android 13+ only shows the permission prompt once a channel exists.
async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Trips and chat',
    importance: AndroidImportance.HIGH,
  });
}

/** Reads a tap's payload. It will come from the push server later, so every field is checked. */
function parseTap(response: Notifications.NotificationResponse): NotificationTap | null {
  const raw = response.notification.request.content.data as Record<string, unknown> | null;
  if (!raw || typeof raw.userId !== 'string' || !TYPES.includes(raw.type as NotificationType)) return null;
  const data: NotificationTap['data'] = {};
  for (const key of DATA_KEYS) {
    if (typeof raw[key] === 'string') data[key] = raw[key];
  }
  return { id: response.notification.request.identifier, type: raw.type as NotificationType, userId: raw.userId, data };
}

export const expoNotificationsService: NotificationsService = {
  async getPermissionStatus() {
    try {
      return toPermission(await Notifications.getPermissionsAsync());
    } catch {
      return 'denied';
    }
  },

  async requestPermission() {
    try {
      await ensureChannel();
      const current = await Notifications.getPermissionsAsync();
      if (current.granted || !current.canAskAgain) return toPermission(current);
      return toPermission(await Notifications.requestPermissionsAsync());
    } catch {
      return 'denied';
    }
  },

  async registerDevice(userId) {
    // shortcut: fake token until KAN-349; real push needs getExpoPushTokenAsync in a development build.
    return `ExponentPushToken[mock-${userId}]`;
  },

  async showNotification(notification) {
    await Notifications.scheduleNotificationAsync({
      identifier: notification.id,
      content: {
        title: notification.title,
        body: notification.body,
        data: { ...notification.data, type: notification.type, userId: notification.userId },
      },
      trigger: null,
    });
  },

  onNotificationTapped(listener) {
    const handled = new Set<string>();
    const handle = (response: Notifications.NotificationResponse) => {
      if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
      const tap = parseTap(response);
      if (!tap || handled.has(tap.id)) return;
      handled.add(tap.id);
      // So a reload doesn't open the same tap again.
      Notifications.clearLastNotificationResponse();
      listener(tap);
    };
    // The tap that opened the app from closed.
    const last = Notifications.getLastNotificationResponse();
    if (last) handle(last);
    const subscription = Notifications.addNotificationResponseReceivedListener(handle);
    return () => subscription.remove();
  },

  async clearAll() {
    await Promise.all([Notifications.cancelAllScheduledNotificationsAsync(), Notifications.dismissAllNotificationsAsync()]);
  },
};
