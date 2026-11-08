import { StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/ui';
import { formatWeight } from '@/lib/format';
import { colors, radii, spacing, typography } from '@/theme';

import type { Trip } from '../types';

import { SectionCard } from './SectionCard';

/** CARGO: load, the vehicle assigned to this trip, handling badges and the coordinator's note. */
export function CargoCard({ trip }: { trip: Trip }) {
  const { cargo, vehicle, coordinatorNote } = trip;

  return (
    <SectionCard title="Cargo">
      <Text style={typography.bodyMedium}>
        {cargo.description} · {formatWeight(cargo.weightTonnes)}
      </Text>
      <Text style={typography.caption}>
        Vehicle: {vehicle.plate} · {vehicle.model} · {formatWeight(vehicle.capacityTonnes)}
      </Text>
      {cargo.handling.length > 0 ? (
        <View style={styles.badges}>
          {cargo.handling.map((instruction) => (
            // Handling instructions aren't statuses, so the tone is set here (info, as in the frame).
            <StatusBadge key={instruction} label={instruction} tone="info" />
          ))}
        </View>
      ) : null}
      {coordinatorNote ? (
        <View style={styles.note}>
          <Text style={typography.micro}>
            Note from {coordinatorNote.authorName} ({coordinatorNote.authorRole})
          </Text>
          <Text style={[typography.bodySmall, styles.noteText]}>{coordinatorNote.text}</Text>
        </View>
      ) : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  note: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.ml,
    borderRadius: radii.tile,
    backgroundColor: colors.background,
  },
  noteText: {
    lineHeight: 19,
  },
});
