import { StyleSheet, View } from 'react-native';

import { InfoTile } from '@/components/ui';
import type { HomeStats } from '../hooks/useDriverHome';
import { formatDistance } from '@/lib/format';
import { spacing } from '@/theme';

/** This week / Distance / Issues reported tiles at the bottom of Driver — Home. */
export function WeeklyStatsRow({ stats }: { stats: HomeStats }) {
  return (
    <View style={styles.row}>
      <InfoTile
        variant="outlined"
        label="This week"
        value={`${stats.tripCount} ${stats.tripCount === 1 ? 'trip' : 'trips'}`}
      />
      <InfoTile variant="outlined" label="Distance" value={formatDistance(stats.distanceKm)} />
      <InfoTile variant="outlined" label="Issues reported" value={String(stats.issuesReported)} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
