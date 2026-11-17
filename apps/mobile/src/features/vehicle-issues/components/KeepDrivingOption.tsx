import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, sizes, spacing, toneColors, typography } from '@/theme';

type KeepDrivingOptionProps = {
  title: string;
  description: string;
  selected: boolean;
  /** Selected colour: pending for "Yes, carefully", danger for "No, I have stopped". */
  tone: 'pending' | 'danger';
  invalid: boolean;
  onPress: () => void;
};

/** One radio card under "Can you keep driving?". */
export function KeepDrivingOption({ title, description, selected, tone, invalid, onPress }: KeepDrivingOptionProps) {
  const { strong, soft } = toneColors[tone];

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${title}, ${description}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected
          ? { backgroundColor: soft, borderColor: strong, borderWidth: sizes.selectedBorder }
          : invalid
            ? styles.invalid
            : null,
        pressed && !selected && styles.pressed,
      ]}>
      <View style={[styles.radio, selected && { borderColor: strong }]}>
        {selected ? <View style={[styles.dot, { backgroundColor: strong }]} /> : null}
      </View>
      <View style={styles.text}>
        <Text style={[typography.bodyStrong, selected && { color: strong }]}>{title}</Text>
        <Text style={typography.caption}>{description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radii.panel,
    borderWidth: sizes.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  invalid: {
    borderColor: colors.danger,
  },
  pressed: {
    backgroundColor: colors.greySoft,
  },
  radio: {
    width: sizes.iconMd,
    height: sizes.iconMd,
    borderRadius: radii.pill,
    borderWidth: sizes.selectedBorder,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: sizes.progressDotCore,
    height: sizes.progressDotCore,
    borderRadius: radii.pill,
  },
  text: {
    flex: 1,
    gap: 1,
  },
});
