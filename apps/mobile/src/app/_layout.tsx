import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useNotificationTaps } from '@/features/notifications';
import { colors } from '@/theme';

// Keep the native splash screen up until fonts and the saved session are ready (module scope, don't await).
SplashScreen.preventAutoHideAsync();

/**
 * Route protection: signed out → (auth), driver → driver tabs, mechanic → mechanic tabs.
 * When the user signs in or out the guards change and Expo Router moves to the first allowed
 * screen (`index`), which redirects to the right area.
 */
function RootNavigator() {
  const { user, isLoading } = useAuth();
  useNotificationTaps();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={user?.role === 'driver'}>
        <Stack.Screen name="driver" />
      </Stack.Protected>
      <Stack.Protected guard={user?.role === 'mechanic'}>
        <Stack.Screen name="(mechanic)" />
        <Stack.Screen name="mechanic" />
      </Stack.Protected>
      <Stack.Screen name="chat" />
      <Stack.Screen name="documents" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}

export default function RootLayout() {
  // Keys become the fontFamily names used in `src/theme/typography.ts`.
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
