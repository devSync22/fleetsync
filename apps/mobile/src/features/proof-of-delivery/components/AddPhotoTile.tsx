import { Camera } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/theme';

type AddPhotoTileProps = {
  size: number;
  onPress: () => void;
};

/** Dashed tile after the photos — opens the camera / gallery choice. */
export function AddPhotoTile({ size, onPress }: AddPhotoTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add a delivery photo"
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { width: size, height: size }, pressed && styles.pressed]}>
      <Camera size={sizes.iconLg} color={colors.accent} />
      <Text style={typography.linkSmall}>Add photo</Text>
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
