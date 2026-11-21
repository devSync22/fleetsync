import { Camera } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/theme';

type AddPhotoTileProps = {
  /** "Add photo", "Take photo". */
  label: string;
  size: number;
  onPress: () => void;
};

/** Dashed tile after the photos — opens the camera / gallery choice. */
export function AddPhotoTile({ label, size, onPress }: AddPhotoTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { width: size, height: size }, pressed && styles.pressed]}>
      <Camera size={sizes.iconLg} color={colors.accent} />
      <Text style={typography.linkSmall}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radii.tile,
    borderWidth: sizes.selectedBorder,
    borderStyle: 'dashed',
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  pressed: {
    backgroundColor: colors.greySoft,
  },
});
