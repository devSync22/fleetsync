import type { ReactNode } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Colors, ScreenPadding } from '@/constants/theme'

type ScreenProps = {
  children: ReactNode
  /** Fixed content above the scrolling body, e.g. an app bar with a back button. */
  header?: ReactNode
  /** Extra styles for the scrolling body (gap, padding, centring…). */
  contentStyle?: StyleProp<ViewStyle>
}

/**
 * Base layout for every screen: respects the notch/home indicator, keeps
 * inputs visible above the keyboard, and scrolls when content is taller
 * than the phone. The body stretches to full height (`flexGrow: 1`) so a
 * spacer view can push content to the bottom, like in the designs.
 */
export function Screen({ children, header, contentStyle }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {header}
      {/* iOS needs padding behaviour to lift the content above the keyboard; Android resizes itself. */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, contentStyle]}
          // Lets taps on buttons work while the keyboard is open.
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: ScreenPadding,
    paddingVertical: 24,
  },
})
