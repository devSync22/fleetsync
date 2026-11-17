import { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Colors, Fonts, Radius } from '@/constants/theme'

import { Icon } from './Icon'

type SelectOption<T extends string> = {
  value: T
  label: string
}

type SelectFieldProps<T extends string> = {
  label: string
  options: SelectOption<T>[]
  /** Selected value, or undefined when nothing has been chosen yet. */
  value: T | undefined
  onChange: (value: T) => void
  /** Shown in grey while nothing is selected. */
  placeholder?: string
  invalid?: boolean
  helperText?: string
}

/**
 * Dropdown (Figma component "Select"). React Native has no built-in select,
 * so tapping the box opens a bottom sheet listing the options.
 */
export function SelectField<T extends string>({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select',
  invalid = false,
  helperText,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
        accessibilityHint="Opens a list of options"
        onPress={() => setOpen(true)}
        style={[styles.box, invalid && styles.boxInvalid]}
      >
        <Text style={[styles.value, !selected && styles.placeholder]} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <Icon source={require('@/assets/icons/chevron-down.svg')} size={16} />
      </Pressable>

      {helperText && (
        <Text style={[styles.helper, invalid && styles.helperInvalid]}>{helperText}</Text>
      )}

      {/* Bottom sheet with the options; tapping the dimmed backdrop closes it. */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Close" />
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <Text style={styles.sheetTitle}>{label}</Text>
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
              >
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            )
          })}
        </SafeAreaView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textDefault,
  },
  // Same 42px height as TextField so the licence row lines up.
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 42,
    paddingLeft: 12,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
  boxInvalid: {
    borderColor: Colors.danger,
  },
  value: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textDefault,
  },
  placeholder: {
    color: Colors.textFaint,
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
  },
  sheet: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: Colors.surface,
  },
  sheetTitle: {
    marginBottom: 8,
    fontFamily: Fonts.semibold,
    fontSize: 16,
    color: Colors.textDefault,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: Radius.md,
  },
  optionPressed: {
    backgroundColor: Colors.background,
  },
  optionLabel: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.textDefault,
  },
  optionLabelSelected: {
    fontFamily: Fonts.semibold,
    color: Colors.accent,
  },
})
