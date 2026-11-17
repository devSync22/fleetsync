import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, radii, sizes, spacing, typography } from '@/theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /**
   * filter = Mechanic — Queue filters: selected is dark with a white label.
   * choice = pick one answer (Proof of delivery → Cargo received): selected is accent-soft with an accent border.
   */
  variant?: 'filter' | 'choice';
};

export function Chip({ label, selected = false, onPress, variant = 'filter' }: ChipProps) {
  const isChoice = variant === 'choice';

  return (
    <Pressable
      accessibilityRole={isChoice ? 'radio' : 'button'}
      accessibilityState={isChoice ? { checked: selected } : { selected }}
      onPress={onPress}
      hitSlop={{ top: 6, bottom: 6 }}
      style={({ pressed }) => [
        styles.chip,
        isChoice ? styles.choice : null,
        isChoice
          ? selected
            ? styles.choiceSelected
            : styles.unselected
          : selected
            ? styles.selected
            : styles.unselected,
        pressed && styles.pressed,
      ]}>
      <Text
        style={[
          typography.chip,
          isChoice
            ? selected
              ? styles.choiceSelectedLabel
              : styles.choiceLabel
            : { color: selected ? colors.surface : colors.text },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: sizes.hairline,
  },
  choice: {
    paddingVertical: 9,
  },
  selected: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  unselected: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
  },
  choiceSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    borderWidth: sizes.selectedBorder,
  },
  choiceLabel: {
    fontFamily: fonts.regular,
    color: colors.text,
  },
  choiceSelectedLabel: {
    fontFamily: fonts.semiBold,
    color: colors.accent,
  },
  pressed: {
    opacity: 0.85,
  },
});
