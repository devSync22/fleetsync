import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, sizes, typography } from '@/theme';

type AvatarProps = {
  /** Full name; initials are taken from the first and last word ("Kasun Jayasinghe" → "KJ"). */
  name: string;
  /** Use when only a first name is known but the design shows two letters (e.g. "KJ"). */
  initials?: string;
  size?: number;
  /**
   * accent = the signed-in user (Driver — Home header);
   * neutral = other people in a list (Trip details → "People on this trip").
   */
  tone?: 'accent' | 'neutral';
};

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = words[0][0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** Round initials avatar (Driver — Home, Mechanic — Queue, Trip details people list). */
export function Avatar({ name, initials, size = sizes.avatar, tone = 'accent' }: AvatarProps) {
  const isNeutral = tone === 'neutral';
  const textStyle =
    size < sizes.avatar ? typography.avatarSmall : size >= sizes.avatarLarge ? typography.avatarLarge : typography.avatar;

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={name}
      style={[styles.avatar, isNeutral && styles.neutral, { width: size, height: size }]}>
      <Text style={[textStyle, isNeutral && styles.neutralText]}>{initials ?? getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  neutral: {
    backgroundColor: colors.greySoft,
  },
  neutralText: {
    color: colors.muted,
  },
});
