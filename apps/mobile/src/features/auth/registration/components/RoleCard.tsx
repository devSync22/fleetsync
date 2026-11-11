import type { ImageSource } from 'expo-image'
import { Pressable, StyleSheet, Text } from 'react-native'

import { Icon } from '@/components/ui/Icon'
import { Colors, Fonts, Radius } from '@/constants/theme'

type RoleCardProps = {
  title: string
  description: string
  icon: ImageSource | number
  selected: boolean
  onPress: () => void
}

/**
 * One of the two "I am a" choice cards (Driver / Mechanic).
 * Selected = accent-soft fill, thicker accent border and accent icon/title.
 */
export function RoleCard({ title, description, icon, selected, onPress }: RoleCardProps) {
  return (
    <Pressable
      // Behaves like a radio button: only one card can be selected.
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}: ${description}`}
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <Icon source={icon} size={20} tintColor={selected ? Colors.accent : Colors.textMuted} />
      <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
  },
  // 1.5px border in the design; padding shrinks by the extra 0.5px so content doesn't shift.
  cardSelected: {
    borderWidth: 1.5,
    paddingHorizontal: 13.5,
    paddingVertical: 11.5,
    borderColor: Colors.accent,
    backgroundColor: Colors.accentSoft,
  },
  title: {
    fontFamily: Fonts.semibold,
    fontSize: 15,
    color: Colors.textDefault,
  },
  titleSelected: {
    color: Colors.accent,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
})
