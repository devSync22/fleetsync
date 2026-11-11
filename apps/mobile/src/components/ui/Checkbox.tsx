import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Colors, Fonts, Radius } from '@/constants/theme'

import { Icon } from './Icon'

type CheckboxProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  /** Label size: 13px next to other controls (sign-in), 14px on its own (request form). */
  size?: 'sm' | 'md'
  /** Red border on the box, e.g. when a required confirmation is missing. */
  invalid?: boolean
}

/** 18px checkbox with label; the whole row is tappable (Figma: accent fill + white check). */
export function Checkbox({ label, checked, onChange, size = 'sm', invalid = false }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={() => onChange(!checked)}
      style={styles.row}
      // Makes the small box easier to hit.
      hitSlop={6}
    >
      <View style={[styles.box, checked && styles.boxChecked, invalid && styles.boxInvalid]}>
        {checked && <Icon source={require('@/assets/icons/check-white.svg')} size={12} />}
      </View>
      <Text style={[styles.label, size === 'md' && styles.labelMd]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  boxChecked: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
  },
  boxInvalid: {
    borderColor: Colors.danger,
  },
  label: {
    flexShrink: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textDefault,
  },
  labelMd: {
    fontSize: 14,
  },
})
