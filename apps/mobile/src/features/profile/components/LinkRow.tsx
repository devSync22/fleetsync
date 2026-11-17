import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, sizes, spacing, typography } from '@/theme';

type LinkRowProps = {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  /**
   * accent = inline link ("Request a change");
   * navigation = dark label + chevron ("Change password").
   */
  variant?: 'accent' | 'navigation';
  /** Muted text before the chevron — "Changed today, 18:05". */
  meta?: string;
  divider?: boolean;
};

/** Tappable row inside a DetailsCard. */
export function LinkRow({ label, icon: Icon, onPress, variant = 'navigation', meta, divider = false }: LinkRowProps) {
  const isAccent = variant === 'accent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={meta ? `${label}, ${meta}` : label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, isAccent && styles.accentRow, divider && styles.divider, pressed && styles.pressed]}>
      <Icon size={sizes.iconSm} color={isAccent ? colors.accent : colors.text} />
      <Text style={isAccent ? styles.accentLabel : [typography.bodyMedium, styles.grow]}>{label}</Text>
      {meta ? <Text style={typography.caption}>{meta}</Text> : null}
      {isAccent ? null : <ChevronRight size={sizes.iconSm} color={colors.faint} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.ml,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.ml,
  },
  accentRow: {
    gap: spacing.sm,
  },
  divider: {
    borderBottomWidth: sizes.hairline,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.greySoft,
  },
  grow: {
    flex: 1,
  },
  accentLabel: {
    ...typography.bodyStrong,
    color: colors.accent,
  },
});
