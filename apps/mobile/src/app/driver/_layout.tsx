import { Stack } from 'expo-router';

import { ChatProvider } from '@/features/chat';
import { NotificationsProvider } from '@/features/notifications';

/** Driver area: the bottom tabs. Trip screens live inside the Home tab's stack — see (tabs)/(home)/_layout.tsx. */
export default function DriverLayout() {
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
