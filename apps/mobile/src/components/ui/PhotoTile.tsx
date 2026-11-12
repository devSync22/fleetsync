import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/theme';

type PhotoTileProps = {
  uri: string;
  /** Label in the bottom-left corner — "Photo 1 · 11:14". */
  label: string;
  size: number;
  onPress: () => void;
};

/** A photo with its label in the bottom-left corner. Tapping it offers to remove it. */
export function PhotoTile({ uri, label, size, onPress }: PhotoTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. Double tap to remove.`}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { width: size, height: size }, pressed && styles.pressed]}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={styles.label}>
        <Text style={typography.photoLabel}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: spacing.md,
    overflow: 'hidden',
    borderRadius: radii.tile,
    borderWidth: sizes.hairline,
    borderColor: colors.border,
    backgroundColor: colors.greySoft,
  },
  label: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.badge,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.85,
  },
});
