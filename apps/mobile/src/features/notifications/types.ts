export type NotificationType = 'trip_assigned' | 'chat_message' | 'trip_cancelled' | 'trip_updated';

export type NotificationData = {
  tripId?: string;
  orderId?: string;
  roomId?: string;
  threadId?: string;
  /** Chat only: the sender, so a tap opens their thread (`?with=`). */
  participantId?: string;
};

export type AppNotification = {
  id: string;
  type: NotificationType;
  /** Who it is for: a tap after sign-out only opens it for the same user. */
  userId: string;
  title: string;
  body: string;
  data: NotificationData;
  /** ISO date-time. */
  createdAt: string;
};

/** What a notification tap carries back into the app. */
export type NotificationTap = Pick<AppNotification, 'id' | 'type' | 'userId' | 'data'>;

export type NotificationPermission = 'granted' | 'denied' | 'undetermined';

/** On/off switches on Profile, stored on the device per user. */
export type NotificationPrefs = {
  tripUpdates: boolean;
  chatMessages: boolean;
};

/**
 * The notification system. Screens only use this interface, so remote push (KAN-349) can replace the
 * local notifications by changing `services/notificationsService.ts`.
 */
export interface NotificationsService {
  requestPermission(): Promise<NotificationPermission>;
  getPermissionStatus(): Promise<NotificationPermission>;
  /** Registers this phone for push. Mock: returns a fake token. */
  registerDevice(userId: string): Promise<string>;
  showNotification(notification: AppNotification): Promise<void>;
  /** Taps on a notification, including the one that cold-started the app. Returns an unsubscribe function. */
  onNotificationTapped(listener: (tap: NotificationTap) => void): () => void;
  /** Removes shown and pending notifications (sign-out). */
  clearAll(): Promise<void>;
}
