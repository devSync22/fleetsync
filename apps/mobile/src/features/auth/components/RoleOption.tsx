import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSizes, radii, sizes, spacing, typography } from '@/theme';

type RoleOptionProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  invalid?: boolean;
  onPress: () => void;
};

/** One of the two "I am a" cards on Request account (Driver / Mechanic). */
export function RoleOption({ title, description, icon: Icon, selected, invalid = false, onPress }: RoleOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${title}, ${description}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected ? styles.selected : invalid ? styles.invalid : styles.unselected,
        pressed && !selected && styles.pressed,
      ]}>
      <Icon size={20} color={selected ? colors.accent : colors.text} />
      <Text style={[typography.bodyStrong, styles.title, selected && styles.selectedTitle]}>{title}</Text>
      <Text style={typography.caption}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radii.panel,
  },
  selected: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  unselected: {
    backgroundColor: colors.surface,
    borderWidth: sizes.hairline,
    borderColor: colors.line,
  },
  invalid: {
    backgroundColor: colors.surface,
    borderWidth: sizes.hairline,
    borderColor: colors.danger,
  },
  pressed: {
    backgroundColor: colors.greySoft,
  },
  title: {
    fontSize: fontSizes.option,
  },
  selectedTitle: {
    color: colors.accent,
  },
});
