import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, sizes, spacing, toneColors, typography, type Tone } from '@/theme';

type ActionTileProps = {
  label: string;
  icon: LucideIcon;
  /** Icon circle tone: accent (Add note), danger (Report issue), info (Chat). */
  tone: Tone;
  onPress: () => void;
};

/** One of the three square actions on Driver — Active trip. */
export function ActionTile({ label, icon: Icon, tone, onPress }: ActionTileProps) {
  const { strong, soft } = toneColors[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      <View style={[styles.circle, { backgroundColor: soft }]}>
        <Icon size={sizes.iconMd} color={strong} />
      </View>
      <Text style={typography.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
    borderRadius: radii.card,
    borderWidth: sizes.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    backgroundColor: colors.greySoft,
  },
  circle: {
    width: sizes.avatar,
    height: sizes.avatar,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
