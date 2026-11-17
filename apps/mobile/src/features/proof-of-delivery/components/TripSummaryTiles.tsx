import { StyleSheet, View } from 'react-native';

import { InfoTile } from '@/components/ui';
import type { Trip } from '@/features/trips';
import { formatTime } from '@/lib/format';
import { spacing } from '@/theme';

type TripSummaryTilesProps = {
  trip: Trip;
  now: Date;
};

/** Started · Now · Notes · Issues tiles on Driver — Complete trip. */
export function TripSummaryTiles({ trip, now }: TripSummaryTilesProps) {
  return (
    <View style={styles.row}>
      <InfoTile variant="outlined" mono label="Started" value={trip.startedAt ? formatTime(trip.startedAt) : '—'} />
      <InfoTile variant="outlined" mono label="Now" value={formatTime(now)} />
      <InfoTile variant="outlined" mono label="Notes" value={String(trip.noteCount)} />
      <InfoTile variant="outlined" mono label="Issues" value={String(trip.issueCount)} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
