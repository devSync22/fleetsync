import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { createContext, use, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import type { AuthUser } from '@/features/auth/types';
import { chatRoomHref, chatService, isThreadVisible, useChat, type ChatRoom, type Message } from '@/features/chat';
import { getTrip, tripHref } from '@/features/trips';

import {
  chatMessageNotification,
  tripAssignedNotification,
  tripCancelledNotification,
  tripUpdatedNotification,
} from './content';
import { startMockEvents, type MockEvent } from './mocks/notificationMocks';
import { onPendingTap, takePendingTap } from './pendingTap';
import { notificationsService } from './services/notificationsService';
import type { AppNotification, NotificationPermission, NotificationPrefs, NotificationTap } from './types';

const DEFAULT_PREFS: NotificationPrefs = { tripUpdates: true, chatMessages: true };
const prefsKey = (userId: string) => `fleetsync.notifications.prefs.${userId}`;

type NotificationsContextValue = {
  /** Null while checking. */
  permission: NotificationPermission | null;
  prefs: NotificationPrefs;
  setPref: (key: keyof NotificationPrefs, value: boolean) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

async function readPrefs(userId: string): Promise<NotificationPrefs> {
  try {
    const raw = await SecureStore.getItemAsync(prefsKey(userId));
    const saved = raw ? (JSON.parse(raw) as Partial<NotificationPrefs>) : {};
    return {
      tripUpdates: typeof saved.tripUpdates === 'boolean' ? saved.tripUpdates : true,
      chatMessages: typeof saved.chatMessages === 'boolean' ? saved.chatMessages : true,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function openTap(tap: NotificationTap, user: AuthUser) {
  // A tap on someone else's notification (another user signed in since) opens nothing.
  if (tap.userId !== user.id) return;
  const { tripId, roomId, participantId } = tap.data;
  if (tap.type === 'chat_message') {
    if (roomId) router.navigate(chatRoomHref(user.role, roomId, participantId));
    return;
  }
  // Trip screens are driver-only.
  if (user.role !== 'driver') return;
  if (tap.type === 'trip_cancelled') router.navigate('/driver/home');
  else if (tripId) router.navigate(tripHref(tripId));
}

/**
 * Notifications for the signed-in driver or mechanic: asks permission after sign-in, shows trip and chat
 * notifications they may see (respecting their Profile switches), opens taps, and stops on sign-out.
 * Wraps the driver and mechanic areas, inside ChatProvider.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { rooms } = useChat();
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  // Read by the long-lived listeners below.
  const prefsRef = useRef(prefs);
  const roomsRef = useRef<ChatRoom[]>([]);

  useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);
  useEffect(() => {
    if (rooms.kind === 'loaded') roomsRef.current = rooms.rooms;
  }, [rooms]);

  const userId = user?.id;

  // Permission after sign-in, preferences, and the device registration (mock token until KAN-349).
  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    readPrefs(userId).then((saved) => {
      if (!cancelled) setPrefs(saved);
    });
    notificationsService.requestPermission().then((status) => {
      if (cancelled) return;
      setPermission(status);
      if (status === 'granted') notificationsService.registerDevice(userId).catch(() => undefined);
    });
    // Coming back from the phone's settings: the banner follows the new permission.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') notificationsService.getPermissionStatus().then((status) => !cancelled && setPermission(status));
    });
    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, [userId]);

  // Event sources → notifications. Signing out unmounts this: everything stops and is cleared.
  useEffect(() => {
    if (!user) return undefined;
    const me = user;
    const seen = new Set<string>();

    function show(notification: AppNotification) {
      const allowed = notification.type === 'chat_message' ? prefsRef.current.chatMessages : prefsRef.current.tripUpdates;
      if (!allowed) return;
      notificationsService.showNotification(notification).catch(() => undefined);
    }

    function onChatMessage(message: Message) {
      if (message.kind === 'event' || message.senderId === me.id || message.status !== 'sent' || seen.has(message.id)) return;
      seen.add(message.id);
      // Same rules as chat: only people in the user's rooms that `canMessage` allows (already filtered there).
      const room = roomsRef.current.find((candidate) => candidate.id === message.roomId);
      const sender = room?.participants.find((participant) => participant.id === message.senderId);
      if (!sender) return;
      if (AppState.currentState === 'active' && isThreadVisible(message.roomId, message.senderId)) return;
      show(chatMessageNotification(me.id, message, sender.name));
    }

    function onTripEvent(event: MockEvent) {
      // Trip screens are driver-only.
      if (me.role !== 'driver') return;
      const build = { trip_assigned: tripAssignedNotification, trip_cancelled: tripCancelledNotification, trip_updated: tripUpdatedNotification }[event.type];
      getTrip(event.tripId)
        .then((trip) => show(build(me.id, trip)))
        .catch(() => undefined);
    }

    const stopMocks = startMockEvents(me.role, onTripEvent);
    const unsubscribeChat = chatService.onMessage(onChatMessage);
    return () => {
      stopMocks();
      unsubscribeChat();
      notificationsService.clearAll().catch(() => undefined);
    };
  }, [user]);

  // Opens a tapped notification — also one tapped while signed out, once this user signs in.
  useEffect(() => {
    if (!user) return undefined;
    const open = () => {
      const tap = takePendingTap();
      if (tap) openTap(tap, user);
    };
    open();
    return onPendingTap(open);
  }, [user]);

  function setPref(key: keyof NotificationPrefs, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    // Storage unavailable: the switch still works until the app closes.
    if (userId) SecureStore.setItemAsync(prefsKey(userId), JSON.stringify(next)).catch(() => undefined);
  }

  return <NotificationsContext value={{ permission, prefs, setPref }}>{children}</NotificationsContext>;
}

export function useNotifications(): NotificationsContextValue {
  const context = use(NotificationsContext);
  if (!context) throw new Error('useNotifications must be used inside <NotificationsProvider>.');
  return context;
}
