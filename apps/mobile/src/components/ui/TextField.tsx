import { Eye, EyeOff } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'

import { Colors, Fonts, Radius } from '@/constants/theme'

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string
  /** Error state: red border. Pair with `helperText` to say what's wrong. */
  invalid?: boolean
  /** Small text under the input; shown in red when `invalid`. */
  helperText?: string
  /** Hide the visible label when a section title above already names the field; screen readers still read it. */
  hideLabel?: boolean
  /** JetBrains Mono for data values such as seal numbers and references. */
  mono?: boolean
}

/**
 * Labelled text input (Figma component "Input"). When focused it shows the
 * design's accent border with a soft accent ring around it.
 * Password fields (`secureTextEntry`) get a show/hide eye button.
 */
export function TextField({
  label,
  invalid = false,
  helperText,
  hideLabel = false,
  mono = false,
  onFocus,
  onBlur,
  secureTextEntry,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const EyeIcon = passwordVisible ? EyeOff : Eye

  return (
    <View style={styles.field}>
      {!hideLabel && <Text style={styles.label}>{label}</Text>}
      {/* The outer view draws the 3px focus ring; it has no visible border when not focused. */}
      <View style={[styles.ring, focused && !invalid && styles.ringFocused]}>
        <TextInput
          {...inputProps}
          secureTextEntry={secureTextEntry && !passwordVisible}
          accessibilityLabel={label}
          style={[
            styles.input,
            focused && styles.inputFocused,
            invalid && styles.inputInvalid,
            inputProps.multiline && styles.inputMultiline,
            mono && styles.inputMono,
            secureTextEntry && styles.inputWithToggle,
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
        {secureTextEntry && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
            onPress={() => setPasswordVisible((visible) => !visible)}
            style={styles.toggle}
          >
            <EyeIcon size={18} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>
      {helperText && (
        <Text style={[styles.helper, invalid && styles.helperInvalid]}>{helperText}</Text>
      )}
    </View>
  )
}

const RING_WIDTH = 3
const TOGGLE_SIZE = 44

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
  inputWithToggle: {
    paddingRight: TOGGLE_SIZE,
  },
  // 44px touch target over the right end of the input, centred on its 42px height.
  toggle: {
    position: 'absolute',
    right: 0,
    top: -1,
    width: TOGGLE_SIZE,
    height: TOGGLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputMono: {
    fontFamily: Fonts.mono,
  },
  inputMultiline: {
    height: 88,
    paddingVertical: 10,
    textAlignVertical: 'top',
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
