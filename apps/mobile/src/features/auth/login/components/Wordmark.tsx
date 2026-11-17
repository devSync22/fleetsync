import { StyleSheet, Text, View } from 'react-native'

import { Icon } from '@/components/ui/Icon'
import { Colors, Fonts } from '@/constants/theme'

/** Logo + "FleetSync" + "For drivers and mechanics" at the top of the sign-in screen. */
export function Wordmark() {
  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="FleetSync, for drivers and mechanics">
      <Icon source={require('@/assets/icons/logo-icon.svg')} size={44} />
      <View style={styles.text}>
        <Text style={styles.name}>
          Fleet<Text style={styles.accent}>Sync</Text>
        </Text>
        <Text style={styles.tagline}>For drivers and mechanics</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    gap: 1,
  },
  name: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.textDefault,
  },
  // Darker green than the web brand colour so "Sync" stays readable on white.
  accent: {
    color: Colors.brandGreenDark,
  },
  tagline: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
})
