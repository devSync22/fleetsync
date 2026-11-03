import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, sizes, typography } from '@/theme';

type AvatarProps = {
  /** Full name; initials are taken from the first and last word ("Kasun Jayasinghe" → "KJ"). */
  name: string;
  /** Use when only a first name is known but the design shows two letters (e.g. "KJ"). */
  initials?: string;
  size?: number;
};

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = words[0][0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** Round initials avatar with the accent-soft background (Driver — Home, Mechanic — Queue). */
export function Avatar({ name, initials, size = sizes.avatar }: AvatarProps) {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={name}
      style={[styles.avatar, { width: size, height: size }]}>
      <Text style={typography.avatar}>{initials ?? getInitials(name)}</Text>
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
});
