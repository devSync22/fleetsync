import { router } from 'expo-router';
import { CalendarCheck, CircleX } from 'lucide-react-native';
import { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, InfoBanner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { canStartTrip, isActiveTrip, isLateToStart, tripHref, tripStartHref, tripStepHref, type Trip } from '@/features/trips';
import { colors, spacing, typography } from '@/theme';

import { DriverHomeSkeleton } from '../components/DriverHomeSkeleton';
import { HomeGreeting } from '../components/HomeGreeting';
import { LateStartBanner } from '../components/LateStartBanner';
import { TodayTripCard } from '../components/TodayTripCard';
import { UpcomingTripCard } from '../components/UpcomingTripCard';
import { WeeklyStatsRow } from '../components/WeeklyStatsRow';
import { useDriverHome } from '../hooks/useDriverHome';

/** Whether Home has already checked for a trip to resume in this app session. */
let resumeChecked = false;

function primaryActionFor(trip: Trip, now: Date) {
  if (canStartTrip(trip, now)) return { label: 'Start trip', onPress: () => router.push(tripStartHref(trip.id)) };
  if (isActiveTrip(trip)) return { label: 'Continue trip', onPress: () => router.push(tripStepHref(trip)) };
  return undefined;
}

/** Driver — Home (Figma 167:6477): today's trip, upcoming trips and this week's numbers. */
export function DriverHomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data, isLoading, loadError, refreshError, isRefreshing, retry, refresh } = useDriverHome();

  // Resuming the app mid-trip: on the first load of the session, open the step the trip is at.
  const todayTrip = data?.todayTrip;
  useEffect(() => {
    if (resumeChecked || data === null) return;
    resumeChecked = true;
    if (todayTrip && isActiveTrip(todayTrip)) router.push(tripStepHref(todayTrip));
  }, [data, todayTrip]);

  function renderBody() {
    if (isLoading) {
      return <DriverHomeSkeleton />;
    }
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

    const { todayTrip, upcomingTrips, stats, checkedAt } = data;

    return (
      <>
        {user ? <HomeGreeting name={user.name} staffId={user.staffId} now={checkedAt} /> : null}

        {refreshError ? <InfoBanner tone="danger" size="sm" title="Couldn’t refresh" message={refreshError} /> : null}

        {todayTrip && isLateToStart(todayTrip, checkedAt) ? (
          <LateStartBanner scheduledStart={todayTrip.scheduledStart} />
        ) : null}

        <Text style={typography.sectionLabel} accessibilityRole="header">
          Today
        </Text>
        {todayTrip ? (
          <TodayTripCard
            trip={todayTrip}
            primaryAction={primaryActionFor(todayTrip, checkedAt)}
            onViewDetails={() => router.push(tripHref(todayTrip.id))}
          />
        ) : (
          <EmptyState
            icon={CalendarCheck}
            title="No trip today"
            description="When the coordinator assigns you a trip for today, it will appear here."
          />
        )}

        {upcomingTrips.length > 0 ? (
          <>
            <Text style={typography.sectionLabel} accessibilityRole="header">
              Upcoming
            </Text>
            {upcomingTrips.map((trip) => (
              <UpcomingTripCard key={trip.id} trip={trip} onPress={() => router.push(tripHref(trip.id))} />
            ))}
          </>
        ) : null}

        <WeeklyStatsRow stats={stats} />
      </>
    );
  }

  return (
    <View style={styles.screen}>
      {/* White strip behind the status bar, as in the frame. */}
      <View style={[styles.statusBar, { height: insets.top }]} />
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.muted}
            colors={[colors.accent]}
          />
        }>
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
    gap: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
});
