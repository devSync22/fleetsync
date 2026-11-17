import type { NotificationsService } from '../types';

import { expoNotificationsService } from './expoNotificationsService';

/** The notification system used by the app. Remote push (KAN-349) replaces the event source, not this. */
export const notificationsService: NotificationsService = expoNotificationsService;
