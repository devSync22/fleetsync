import { StyleSheet, View } from 'react-native';

import { formatTime } from '@/lib/format';
import { colors, sizes } from '@/theme';

import type { Trip } from '../types';

import { SectionCard } from './SectionCard';
import { StopDetail } from './StopDetail';

/** ROUTE: pickup and destination with times and contacts. Stops only — no map. */
export function RouteCard({ trip }: { trip: Trip }) {
  return (
    <SectionCard title="Route">
      <StopDetail label={`Pickup · ${formatTime(trip.scheduledStart)}`} stop={trip.pickup} />
      <View style={styles.divider} />
      <StopDetail label={`Destination · by ${formatTime(trip.deliverBy)}`} stop={trip.destination} />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: sizes.hairline,
    backgroundColor: colors.border,
  },
});
