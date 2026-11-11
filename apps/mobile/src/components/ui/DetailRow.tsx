import { StyleSheet, Text, View } from 'react-native'

import { Colors, Fonts } from '@/constants/theme'

type DetailRowProps = {
  label: string
  value: string
  /** Monospace value for IDs and codes (e.g. "APP-2026-0118"). */
  monospace?: boolean
}

/**
 * One "label ……… value" line in a summary card
 * (e.g. "Role ……… Driver" on Request sent / Account approved).
 */
export function DetailRow({ label, value, monospace = false }: DetailRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, monospace && styles.mono]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  // The label takes the free space; long values wrap instead of overlapping it.
  label: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textMuted,
  },
  value: {
    flexShrink: 1,
    fontFamily: Fonts.medium,
    fontSize: 13,
    textAlign: 'right',
    color: Colors.textDefault,
  },
  mono: {
    fontFamily: Fonts.mono,
  },
})
