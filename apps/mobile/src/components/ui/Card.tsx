import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, sizes, spacing } from '@/theme';

type CardProps = {
  children: ReactNode;
  /** Makes the whole card tappable (e.g. a queue job that opens its details). */
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** White card with a border, as used for trips and queue jobs in the mobile frames. */
export function Card({ children, onPress, accessibilityLabel, style }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: sizes.hairline,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: spacing.xxl,
    gap: spacing.xl,
  },
  pressed: {
    backgroundColor: colors.greySoft,
  },
});
