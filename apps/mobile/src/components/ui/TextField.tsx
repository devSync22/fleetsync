import { CircleCheck, CircleX } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/theme';

type TextFieldProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  label: string;
  /** Hint shown under the field when there is no error or success message. */
  helper?: string;
  /** Validation error: colours the border and shows the message with an icon. */
  error?: string;
  /** Validation success: colours the border and shows the message with an icon. */
  success?: string;
  /** Use JetBrains Mono for data values (odometer, references, plates). */
  mono?: boolean;
};

/** Label above, field, then helper or validation message below (Style Guide → Form fields). */
export function TextField({
  label,
  helper,
  error,
  success,
  mono = false,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  const message = error ?? success ?? helper;
  const MessageIcon = error ? CircleX : success ? CircleCheck : null;
  const iconColor = error ? colors.danger : colors.success;

  return (
    <View style={styles.container}>
      <Text style={typography.label}>{label}</Text>
      <View
        style={[
          styles.field,
          focused && styles.focused,
          !focused && error ? styles.error : null,
          !focused && !error && success ? styles.success : null,
        ]}>
        <TextInput
          {...inputProps}
          accessibilityLabel={inputProps.accessibilityLabel ?? label}
          placeholderTextColor={colors.muted}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[styles.input, mono ? typography.monoInput : typography.body]}
        />
      </View>
      {message ? (
        <View style={styles.message}>
          {MessageIcon ? <MessageIcon size={sizes.iconXs} color={iconColor} /> : null}
          <Text style={[typography.caption, styles.messageText]}>{message}</Text>
        </View>
      ) : null}
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
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: sizes.hairline,
    borderColor: colors.border,
    borderRadius: radii.control,
    paddingHorizontal: spacing.lg,
  },
  focused: {
    borderWidth: sizes.focusBorder,
    borderColor: colors.accent,
    paddingHorizontal: spacing.lg - 1,
    boxShadow: `0px 0px 0px 3px ${colors.accentSoft}`,
  },
  error: {
    borderColor: colors.danger,
  },
  success: {
    borderColor: colors.success,
  },
  input: {
    paddingVertical: spacing.ml,
    // Line height on a single-line TextInput clips text on Android; padding sets the height instead.
    lineHeight: undefined,
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  messageText: {
    flexShrink: 1,
  },
});
