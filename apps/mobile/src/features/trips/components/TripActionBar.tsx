import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { colors, sizes, spacing, typography } from '@/theme';

type TripActionBarProps = {
  onStart: () => void;
};

/** Bottom action bar on Trip details, above the home indicator. */
export function TripActionBar({ onStart }: TripActionBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.lg }]}>
      <Button label="Start trip" onPress={onStart} />
      <Text style={[typography.caption, styles.hint]}>You will enter the starting odometer reading next.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.surface,
    borderTopWidth: sizes.hairline,
    borderTopColor: colors.border,
  },
  hint: {
    textAlign: 'center',
  },
});
