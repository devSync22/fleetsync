import { router, useLocalSearchParams } from 'expo-router';
import { CircleX, SearchX } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState, ScreenHeader, StatusBadge } from '@/components/ui';
import { formatDate, formatDistance, formatTime } from '@/lib/format';
import { colors, spacing } from '@/theme';

import { CargoCard } from '../components/CargoCard';
import { PeopleCard } from '../components/PeopleCard';
import { RouteCard } from '../components/RouteCard';
import { TripActionBar } from '../components/TripActionBar';
import { TripDetailsSkeleton } from '../components/TripDetailsSkeleton';
import { useTrip } from '../hooks/useTrip';
import { tripStartHref } from '../routes';
import { canStartTrip, isSameDay } from '../tripTime';
import type { Trip } from '../types';

/** "Today · 09:30 – 12:00 · 38 km", or "Wed 22 Oct · 07:00 – 10:30 · 94 km" for a later day. */
function tripSubtitle(trip: Trip, now: Date) {
  const day = isSameDay(trip.scheduledStart, now) ? 'Today' : formatDate(trip.scheduledStart, 'short');
  return `${day} · ${formatTime(trip.scheduledStart)} – ${formatTime(trip.deliverBy)} · ${formatDistance(trip.distanceKm)}`;
}

/** Driver — Trip details (Figma 169:6500). Opened from Home: "View trip details" or an upcoming trip. */
export function TripDetailsScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { state, retry } = useTrip(tripId);

  if (state.kind !== 'loaded') {
    return (
      <View style={styles.screen}>
        <ScreenHeader title={tripId ?? 'Trip'} monoTitle />
        <ScrollView contentContainerStyle={styles.body}>
          {state.kind === 'loading' ? <TripDetailsSkeleton /> : null}
          {state.kind === 'notFound' ? (
            <EmptyState
              icon={SearchX}
              title="Trip not found"
              description="This trip doesn’t exist or isn’t assigned to you any more."
              action={{ label: 'Back to Home', variant: 'secondary', onPress: () => router.navigate('/driver/home') }}
            />
          ) : null}
          {state.kind === 'error' ? (
            <EmptyState
              icon={CircleX}
              tone="danger"
              title="Couldn’t load this trip"
              description={state.message}
              action={{ label: 'Retry', onPress: retry }}
            />
          ) : null}
        </ScrollView>
      </View>
    );
  }

  const { trip, checkedAt } = state;
  const showStart = canStartTrip(trip, checkedAt);

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={trip.id}
        monoTitle
        subtitle={tripSubtitle(trip, checkedAt)}
        right={<StatusBadge label={trip.status} />}
      />
      <ScrollView contentContainerStyle={styles.body}>
        <RouteCard trip={trip} />
        <CargoCard trip={trip} />
        <PeopleCard trip={trip} />
      </ScrollView>
      {showStart ? <TripActionBar onStart={() => router.push(tripStartHref(trip.id))} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
});
