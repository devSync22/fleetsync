import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'

import { Colors, Fonts, Radius } from '@/constants/theme'

type ButtonProps = {
  label: string
  onPress: () => void
  /** `primary` = dark filled (default), `secondary` = white with a grey border. */
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  /** Shows a spinner instead of the label and blocks presses. */
  loading?: boolean
}

/** Full-width button (Figma component "Button", mobile size: 13px vertical padding). */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  const isPrimary = variant === 'primary'
  const inactive = disabled || loading

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        // Visual feedback while pressed, and a faded look when disabled.
        pressed && styles.pressed,
        inactive && styles.inactive,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? Colors.surface : Colors.textDefault} />
      ) : (
        <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelSecondary]}>
          {label}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 46,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: Radius.md,
  },
  primary: {
    backgroundColor: Colors.textDefault,
  },
  secondary: {
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.surface,
  },
  pressed: {
    opacity: 0.85,
  },
  inactive: {
    opacity: 0.5,
  },
  label: {
    fontFamily: Fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  labelPrimary: {
    color: Colors.surface,
  },
  labelSecondary: {
    color: Colors.textDefault,
  },
})
