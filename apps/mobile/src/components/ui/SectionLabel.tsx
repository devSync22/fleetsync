import { StyleSheet, Text } from 'react-native'

import { Colors, Fonts } from '@/constants/theme'

/** Small uppercase group heading, e.g. "I AM A", "YOUR DETAILS", "DOCUMENTS". */
export function SectionLabel({ children }: { children: string }) {
  return (
    <Text style={styles.label} accessibilityRole="header">
      {children.toUpperCase()}
    </Text>
  )
}

const styles = StyleSheet.create({
  label: {
    fontFamily: Fonts.semibold,
    fontSize: 11,
    letterSpacing: 0.66,
    color: Colors.textMuted,
  },
})
