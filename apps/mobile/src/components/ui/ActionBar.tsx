import { StyleSheet, Text, View } from 'react-native';

import { colors, sizes, spacing, typography } from '@/theme';

import { Button } from './Button';

type ActionBarProps = {
  label: string;
  onPress: () => void;
  /** Muted line under the button — what happens next. */
  hint?: string;
  disabled?: boolean;
  loading?: boolean;
};

/**
 * White bottom bar with the screen's one primary action (trip flow frames). It sits directly above the
 * bottom tab bar, which already covers the home indicator, so no extra safe-area padding here.
 */
export function ActionBar({ label, onPress, hint, disabled, loading }: ActionBarProps) {
  return (
    <View style={styles.bar}>
      <Button label={label} onPress={onPress} disabled={disabled} loading={loading} />
      {hint ? <Text style={[typography.caption, styles.hint]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.surface,
    borderTopWidth: sizes.hairline,
    borderTopColor: colors.border,
  },
  hint: {
    textAlign: 'center',
  },
});
