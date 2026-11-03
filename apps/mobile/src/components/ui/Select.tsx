import { Check, ChevronDown, CircleX } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, sizes, spacing, typography } from '@/theme';

export type SelectOption<T extends string> = {
  label: string;
  value: T;
};

type SelectProps<T extends string> = {
  label: string;
  value: T | null;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  /** Validation error: colours the border and shows the message with an icon. */
  error?: string;
};

/**
 * Select field (Style Guide → Select): looks like a text field with a chevron and opens
 * a bottom sheet with the options.
 */
export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Choose',
  error,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.container}>
      <Text style={typography.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? 'not chosen'}`}
        accessibilityHint="Opens a list of options"
        onPress={() => setOpen(true)}
        style={[styles.field, error ? styles.fieldError : null]}>
        <Text style={[typography.body, styles.value, !selected && styles.placeholder]} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={sizes.iconSm} color={colors.muted} />
      </Pressable>
      {error ? (
        <View style={styles.message}>
          <CircleX size={sizes.iconXs} color={colors.danger} />
          <Text style={[typography.caption, styles.messageText]}>{error}</Text>
        </View>
      ) : null}

      <Modal visible={open} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <Pressable style={styles.backdrop} accessibilityLabel="Close" onPress={() => setOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
            <Text style={[typography.headerTitle, styles.sheetTitle]} accessibilityRole="header">
              {label}
            </Text>
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}>
                  <Text style={isSelected ? typography.bodyStrong : typography.body}>{option.label}</Text>
                  {isSelected ? <Check size={sizes.iconMd} color={colors.accent} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    alignSelf: 'stretch',
  },
  field: {
    minHeight: sizes.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: sizes.hairline,
    borderColor: colors.line,
    borderRadius: radii.control,
    paddingLeft: spacing.lg,
    paddingRight: spacing.ml,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  value: {
    flex: 1,
    lineHeight: undefined,
  },
  placeholder: {
    color: colors.muted,
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  messageText: {
    flexShrink: 1,
  },
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.text,
    opacity: 0.4,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
  },
  sheetTitle: {
    paddingBottom: spacing.md,
  },
  option: {
    minHeight: sizes.touchTarget + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: sizes.hairline,
    borderBottomColor: colors.border,
  },
  optionPressed: {
    backgroundColor: colors.greySoft,
  },
});
