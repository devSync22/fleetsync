import { Tabs } from 'expo-router/js-tabs';
import { Activity, House, MessageCircle, User } from 'lucide-react-native';

import { tabIcon, useTabBarOptions } from '@/hooks/useTabBarOptions';

/** Driver bottom tabs — Figma "Mobile tab bar" (Driver): Home, Trips, Chat, Profile. */
export default function DriverTabsLayout() {
  const screenOptions = useTabBarOptions();

  return (
    <Tabs screenOptions={screenOptions}>
      {/* Home tab is a stack: Home + trip screens, so the tab bar stays visible on them. */}
      <Tabs.Screen name="(home)" options={{ title: 'Home', tabBarIcon: tabIcon(House) }} />
      <Tabs.Screen name="trips" options={{ title: 'Trips', tabBarIcon: tabIcon(Activity) }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: tabIcon(MessageCircle) }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon(User) }} />
    </Tabs>
  );
}
