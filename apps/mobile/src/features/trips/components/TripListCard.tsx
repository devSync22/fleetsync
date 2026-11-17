import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/theme';

import type { TripGroup } from '../tripHistory';
import type { Trip } from '../types';
import { TripHistoryRow } from './TripHistoryRow';

type TripListCardProps = {
  groups: TripGroup[];
  now: Date;
  onOpen: (trip: Trip) => void;
};

/** "History list" card: section labels (TODAY, THIS WEEK…) with their trip rows. */
export function TripListCard({ groups, now, onOpen }: TripListCardProps) {
  return (
    <View style={styles.card}>
      {groups.map((group, groupIndex) => (
        <Fragment key={group.title}>
          <Text style={[typography.sectionLabel, styles.label]} accessibilityRole="header">
            {group.title}
          </Text>
          {group.trips.map((trip, index) => (
            <TripHistoryRow
              key={trip.id}
              trip={trip}
              now={now}
              isLast={groupIndex === groups.length - 1 && index === group.trips.length - 1}
              onPress={() => onOpen(trip)}
            />
          ))}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: sizes.hairline,
    borderColor: colors.border,
    borderRadius: radii.card,
  },
  label: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.ml,
    paddingBottom: spacing.sm,
  },
});
