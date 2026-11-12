/** Public entry for the notifications feature. Routes and other features import from `@/features/notifications` only. */
export { NotificationsProvider, useNotifications } from './NotificationsProvider';
export { useNotificationTaps } from './hooks/useNotificationTaps';
export { NotificationSettingsCard } from './components/NotificationSettingsCard';
export { notificationsService } from './services/notificationsService';
export type { AppNotification, NotificationPrefs, NotificationsService, NotificationType } from './types';
