import { StyleSheet, Text, View } from 'react-native';

import { radii, spacing, toneColors, typography, type Tone } from '@/theme';

import { getStatusTone } from './statusTones';

type StatusBadgeProps = {
  /** Status text, e.g. "Assigned". Its tone comes from `statusTones.ts`. */
  label: string;
  /** Override the tone only when the label is not a domain status. */
  tone?: Tone;
};

/** Soft tinted badge with the label in the strong tone colour (no dot). */
export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const { strong, soft } = toneColors[tone ?? getStatusTone(label)];

  return (
    <View style={[styles.badge, { backgroundColor: soft }]}>
      <Text style={[typography.badge, { color: strong }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.ml,
    paddingVertical: 3,
    borderRadius: radii.badge,
  },
});
