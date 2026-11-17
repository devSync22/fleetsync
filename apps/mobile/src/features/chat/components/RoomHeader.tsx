import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/theme';

type RoomHeaderProps = {
  /** "TRP-2208 · Colombo Pharma". */
  title: string;
  /** Back to the room list (the frame's back arrow and room switcher chevron). */
  onBack: () => void;
};

/** "Trip room" card at the top of Driver / Mechanic — Chat. */
export function RoomHeader({ title, onBack }: RoomHeaderProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Trip room ${title}. Back to all chat rooms`}
      onPress={onBack}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <ChevronLeft size={sizes.iconLg} color={colors.text} />
      <View style={styles.text}>
        <Text style={typography.micro}>Trip room</Text>
        <Text style={typography.bodyStrong} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <ChevronDown size={sizes.iconMd} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
    borderRadius: radii.tile,
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    flex: 1,
    gap: 1,
  },
});
