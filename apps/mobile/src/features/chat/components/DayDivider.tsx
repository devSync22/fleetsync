import { StyleSheet, Text, View } from 'react-native';

import { colors, sizes, spacing, typography } from '@/theme';

/** "—— Today ——" between days in a thread (as in Coordinator — Chat). */
export function DayDivider({ label }: { label: string }) {
  return (
    <View style={styles.row} accessibilityRole="header">
      <View style={styles.line} />
      <Text style={typography.micro}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  line: {
    flex: 1,
    height: sizes.hairline,
    backgroundColor: colors.border,
  },
});
