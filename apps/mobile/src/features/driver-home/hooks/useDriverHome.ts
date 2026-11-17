import { useEffect, useState } from 'react';

import { getTodayTrip, getUpcomingTrips, getWeeklyStats, type Trip, type WeeklyStats } from '@/features/trips';

export type DriverHomeData = {
  todayTrip: Trip | null;
  upcomingTrips: Trip[];
  stats: WeeklyStats;
  /** When the data was loaded — used for the greeting, the date line and the late-start check. */
  checkedAt: Date;
};

type LoadKind = 'load' | 'refresh';

async function loadDriverHome(): Promise<DriverHomeData> {
  const [todayTrip, upcomingTrips, stats] = await Promise.all([getTodayTrip(), getUpcomingTrips(), getWeeklyStats()]);
  return { todayTrip, upcomingTrips, stats, checkedAt: new Date() };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Couldn’t load your trips.';
}

/**
 * Data for Driver — Home: today's trip, upcoming trips and this week's stats.
 * - `retry()` after a failed first load shows the skeleton again.
 * - `refresh()` (pull-to-refresh) keeps the current data on screen; if it fails, `refreshError` is set.
 */
export function useDriverHome() {
  const [data, setData] = useState<DriverHomeData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // A new object starts a load; `kind` decides whether a failure replaces the screen or shows a banner.
  const [request, setRequest] = useState<{ kind: LoadKind }>({ kind: 'load' });

  useEffect(() => {
    let cancelled = false;
    loadDriverHome()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setLoadError(null);
        setRefreshError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (request.kind === 'refresh') {
          setRefreshError(errorMessage(error));
        } else {
          setLoadError(errorMessage(error));
        }
      })
      .finally(() => {
        if (!cancelled) setIsRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [request]);

  function retry() {
    setLoadError(null);
    setRequest({ kind: 'load' });
  }

  function refresh() {
    setIsRefreshing(true);
    setRequest({ kind: data ? 'refresh' : 'load' });
  }

  return {
    data,
    isLoading: !data && !loadError,
    loadError,
    refreshError,
    isRefreshing,
    retry,
    refresh,
  };
}
