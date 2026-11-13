import { router } from 'expo-router';
import { CalendarClock, CircleX, History } from 'lucide-react-native';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, InfoBanner, InfoTile } from '@/components/ui';
import { formatDistance, formatMonth } from '@/lib/format';
import { colors, spacing, typography } from '@/theme';

import { TripHistorySkeleton } from '../components/TripHistorySkeleton';
import { TripListCard } from '../components/TripListCard';
import { TripTabs, type TripTab } from '../components/TripTabs';
import { useTripHistory, type TripHistoryData } from '../hooks/useTripHistory';
import { tripsTabTripHref } from '../routes';
import { groupTripHistory, monthSummary } from '../tripHistory';
import { isSameDay } from '../tripStatus';
import type { Trip } from '../types';

const openTrip = (trip: Trip) => router.push(tripsTabTripHref(trip.id));

function HistoryTab({ history, checkedAt }: TripHistoryData) {
  const summary = monthSummary(history, checkedAt);
  return (
    <>
      <View style={styles.tiles}>
        <InfoTile
          variant="outlined"
          label={formatMonth(checkedAt)}
          value={`${summary.tripCount} ${summary.tripCount === 1 ? 'trip' : 'trips'}`}
        />
        <InfoTile variant="outlined" label="Distance" value={formatDistance(summary.distanceKm)} />
        <InfoTile variant="outlined" label="Issues" value={String(summary.issueCount)} />
      </View>
      {history.length > 0 ? (
        <TripListCard groups={groupTripHistory(history, checkedAt)} now={checkedAt} onOpen={openTrip} />
      ) : (
        <EmptyState
          icon={History}
          title="No trips yet"
          description="Trips you complete, and trips the coordinator cancels, will be listed here."
        />
      )}
    </>
  );
}

function UpcomingTab({ upcoming, checkedAt }: TripHistoryData) {
  if (upcoming.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No upcoming trips"
        description="When the coordinator assigns you a trip, it will appear here."
      />
    );
  }
  const today = upcoming.filter((trip) => isSameDay(trip.scheduledStart, checkedAt));
  const later = upcoming.filter((trip) => !isSameDay(trip.scheduledStart, checkedAt));
  const groups = [
    { title: 'Today', trips: today },
    { title: 'Later', trips: later },
  ].filter((group) => group.trips.length > 0);
  return <TripListCard groups={groups} now={checkedAt} onOpen={openTrip} />;
}

/** Driver — Trip history (Figma 174:6524): the Trips tab, with Upcoming and History. */
export function TripHistoryScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TripTab>('History');
  const { data, isLoading, loadError, refreshError, isRefreshing, retry, refresh } = useTripHistory();

  function renderBody() {
    if (isLoading) return <TripHistorySkeleton />;
    if (!data) {
      return (
        <EmptyState
          icon={CircleX}
          tone="danger"
          title="Couldn’t load your trips"
          description={loadError ?? undefined}
          action={{ label: 'Retry', onPress: retry }}
        />
      );
    }
    return tab === 'History' ? <HistoryTab {...data} /> : <UpcomingTab {...data} />;
  }

  return (
    <View style={styles.screen}>
      {/* White strip behind the status bar, as in the frame. */}
      <View style={[styles.statusBar, { height: insets.top }]} />
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={colors.muted} colors={[colors.accent]} />
        }>
        <Text style={typography.screenTitle} accessibilityRole="header">
          My trips
        </Text>
        <TripTabs value={tab} onChange={setTab} />
        {refreshError ? <InfoBanner tone="danger" size="sm" title="Couldn’t refresh" message={refreshError} /> : null}
        {renderBody()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statusBar: {
    backgroundColor: colors.surface,
  },
  body: {
    gap: spacing.xl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
