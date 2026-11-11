import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Icon } from '@/components/ui/Icon'
import { Colors, Fonts } from '@/constants/theme'

type AppBarProps = {
  title: string
  subtitle?: string
  onBack: () => void
}

/** Top bar with a back arrow, title and subtitle (Figma "App bar", node 195:6808). */
export function AppBar({ title, subtitle, onBack }: AppBarProps) {
  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack}
        // The icon is 22px; enlarge the touch area to the recommended ~44px.
        hitSlop={11}
      >
        <Icon source={require('@/assets/icons/back.svg')} size={22} />
      </Pressable>
      <View style={styles.titles}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titles: {
    flex: 1,
    gap: 1,
  },
  title: {
    fontFamily: Fonts.semibold,
    fontSize: 16,
    color: Colors.textDefault,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
})
