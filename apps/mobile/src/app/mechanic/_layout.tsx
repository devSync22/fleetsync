import { Stack } from 'expo-router';

import { ChatProvider } from '@/features/chat';
import { NotificationsProvider } from '@/features/notifications';

/** Mechanic area: the tabs, plus detail screens (resolve issue, record maintenance…) added in later branches. */
export default function MechanicLayout() {
  // Chat stays connected while the user is in this area, so the Chat tab badge updates on every tab.
  return (
    <ChatProvider>
      {/* Unmounts on sign-out, which stops and clears this user's notifications. */}
      <NotificationsProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </NotificationsProvider>
    </ChatProvider>
  );
}
