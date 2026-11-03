import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/theme';

type ButtonVariant = 'primary' | 'secondary';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  /** primary = dark, the one main action per view; secondary = white with border. */
  variant?: ButtonVariant;
  icon?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
  /** Full width by default (mobile rule). Set false for inline buttons, e.g. inside EmptyState. */
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const inactive = disabled || loading;
  const labelColor = disabled ? colors.faint : isPrimary ? colors.surface : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        disabled && styles.disabled,
        fullWidth ? styles.fullWidth : styles.inline,
        pressed && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <View style={styles.content}>
          {Icon ? <Icon size={sizes.iconSm} color={labelColor} /> : null}
          <Text style={[typography.button, { color: labelColor }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: sizes.button,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.text,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: sizes.hairline,
    borderColor: colors.line,
  },
  disabled: {
    backgroundColor: colors.greySoft,
    borderColor: colors.greySoft,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  inline: {
    alignSelf: 'center',
    minHeight: sizes.touchTarget,
  },
  pressed: {
    opacity: 0.85,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
