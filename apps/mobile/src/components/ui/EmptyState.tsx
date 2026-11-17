import { Inbox, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, sizes, spacing, toneColors, typography, type Tone } from '@/theme';

import { Button } from './Button';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Icon circle tone: neutral for "no data", danger/accent/pending for system states. */
  tone?: Tone;
  action?: {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
  };
};

/** Empty / system state card (Style Guide → Empty state). */
export function EmptyState({ title, description, icon: Icon = Inbox, tone = 'neutral', action }: EmptyStateProps) {
  const circleColor = tone === 'neutral' ? colors.greySoft : toneColors[tone].soft;
  const iconColor = tone === 'neutral' ? colors.muted : toneColors[tone].strong;

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: circleColor }]}>
        <Icon size={sizes.iconXl} color={iconColor} />
      </View>
      <Text style={[typography.cardTitle, styles.center]}>{title}</Text>
      {description ? (
        <Text style={[typography.bodySmall, styles.description, styles.center]}>{description}</Text>
      ) : null}
      {action ? (
        <View style={styles.action}>
          <Button
            label={action.label}
            onPress={action.onPress}
            variant={action.variant ?? 'primary'}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.huge,
    paddingVertical: spacing.giant,
    backgroundColor: colors.surface,
    borderWidth: sizes.hairline,
    borderColor: colors.border,
    borderRadius: radii.panel,
    alignSelf: 'stretch',
  },
  iconCircle: {
    width: sizes.emptyIconCircle,
    height: sizes.emptyIconCircle,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    textAlign: 'center',
  },
  description: {
    color: colors.muted,
  },
  action: {
    paddingTop: spacing.xs,
  },
});
