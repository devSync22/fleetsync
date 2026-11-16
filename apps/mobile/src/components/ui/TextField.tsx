import { useState } from 'react'
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'

import { Colors, Fonts, Radius } from '@/constants/theme'

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string
  /** Error state: red border. Pair with `helperText` to say what's wrong. */
  invalid?: boolean
  /** Small text under the input; shown in red when `invalid`. */
  helperText?: string
}

/**
 * Labelled text input (Figma component "Input"). When focused it shows the
 * design's accent border with a soft accent ring around it.
 */
export function TextField({
  label,
  invalid = false,
  helperText,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false)

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {/* The outer view draws the 3px focus ring; it has no visible border when not focused. */}
      <View style={[styles.ring, focused && !invalid && styles.ringFocused]}>
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          style={[
            styles.input,
            focused && styles.inputFocused,
            invalid && styles.inputInvalid,
          ]}
          placeholderTextColor={Colors.textFaint}
          onFocus={(event) => {
            setFocused(true)
            onFocus?.(event)
          }}
          onBlur={(event) => {
            setFocused(false)
            onBlur?.(event)
          }}
        />
      </View>
      {helperText && (
        <Text style={[styles.helper, invalid && styles.helperInvalid]}>{helperText}</Text>
      )}
    </View>
  )
}

const RING_WIDTH = 3

const styles = StyleSheet.create({
  field: {
    gap: 6,
    width: '100%',
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textDefault,
  },
  // Negative margin keeps the ring outside the input so the layout doesn't move on focus.
  ring: {
    margin: -RING_WIDTH,
    borderWidth: RING_WIDTH,
    borderColor: 'transparent',
    borderRadius: Radius.md + RING_WIDTH,
  },
  ringFocused: {
    borderColor: Colors.accentSoft,
  },
  input: {
    // Fixed height so the 1px → 2px border change on focus doesn't change the size.
    height: 42,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textDefault,
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: Colors.accent,
    paddingHorizontal: 11,
  },
  inputInvalid: {
    borderColor: Colors.danger,
  },
  helper: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textMuted,
  },
  helperInvalid: {
    color: Colors.danger,
  },
})
