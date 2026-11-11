import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter'
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'

import { Colors } from '@/constants/theme'

// Keep the splash screen visible until the fonts are ready (must run at module scope).
SplashScreen.preventAutoHideAsync()

/**
 * Root layout: loads fonts, then renders a header-less Stack. Each screen
 * draws its own top area (e.g. the "Request an account" app bar) as in Figma.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_500Medium,
  })

  useEffect(() => {
    // Hide the splash once fonts load — or fail, so the app still opens with system fonts.
    if (fontsLoaded || fontError) SplashScreen.hideAsync()
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) return null

  return (
    <>
      {/* Dark status bar icons on the white screens. */}
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.surface },
        }}
      />
    </>
  )
}
