import { Stack } from 'expo-router';

import { ChatProvider } from '@/features/chat';

/** Driver area: the bottom tabs. Trip screens live inside the Home tab's stack — see (tabs)/(home)/_layout.tsx. */
export default function DriverLayout() {
  // Chat stays connected while the user is in this area, so the Chat tab badge updates on every tab.
  return (
    <ChatProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ChatProvider>
  );
}
