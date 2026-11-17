import { StyleSheet, Text, View } from 'react-native';

import type { PasswordStrength } from '@/lib/password';
import { colors, fonts, spacing, toneColors, typography } from '@/theme';

const SEGMENTS = [1, 2, 3, 4] as const;

/** 4-segment strength bar + "Strong password" label (Figma "Auth — Set new password"). */
export function PasswordStrengthMeter({ strength }: { strength: PasswordStrength }) {
  const color = strength.tone ? toneColors[strength.tone].strong : colors.line;

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel={strength.label ?? 'Password strength: not set'}>
      <View style={styles.bar}>
        {SEGMENTS.map((segment) => (
          <View
            key={segment}
            style={[styles.segment, { backgroundColor: segment <= strength.score ? color : colors.line }]}
          />
        ))}
      </View>
      {strength.label ? <Text style={[typography.caption, styles.label, { color }]}>{strength.label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  bar: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    height: spacing.xs,
    borderRadius: spacing.xxs,
  },
  label: {
    fontFamily: fonts.medium,
  },
});
