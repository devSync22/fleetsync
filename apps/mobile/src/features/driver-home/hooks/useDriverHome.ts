import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { getTodayTrip, getUpcomingTrips, getWeeklyStats, type Trip, type WeeklyStats } from '@/features/trips';
import { getIssuesForDriver } from '@/features/vehicle-issues';

export type HomeStats = WeeklyStats & { issuesReported: number };

export type DriverHomeData = {
  todayTrip: Trip | null;
  upcomingTrips: Trip[];
  stats: HomeStats;
  /** When the data was loaded — used for the greeting, the date line and the late-start check. */
  checkedAt: Date;
};

type LoadKind = 'load' | 'refresh';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

async function loadDriverHome(driverId: string): Promise<DriverHomeData> {
  const [todayTrip, upcomingTrips, weekly, issues] = await Promise.all([
    getTodayTrip(),
    getUpcomingTrips(),
    getWeeklyStats(),
    getIssuesForDriver(driverId),
  ]);
  const checkedAt = new Date();
  // "This week" = the last 7 days, the same window Trip history uses.
  const issuesReported = issues.filter((issue) => checkedAt.getTime() - new Date(issue.createdAt).getTime() <= WEEK_MS).length;
  return { todayTrip, upcomingTrips, stats: { ...weekly, issuesReported }, checkedAt };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Couldn’t load your trips.';
}

/**
 * Data for Driver — Home: today's trip, upcoming trips and this week's stats.
 * - `retry()` after a failed first load shows the skeleton again.
 * - `refresh()` (pull-to-refresh) keeps the current data on screen; if it fails, `refreshError` is set.
 * - Coming back to Home (e.g. after completing a trip) reloads quietly, like a refresh without the spinner.
 */
export function useDriverHome() {
  const driverId = useAuth().user?.id ?? '';
  const [data, setData] = useState<DriverHomeData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // A new object starts a load; `kind` decides whether a failure replaces the screen or shows a banner.
  const [request, setRequest] = useState<{ kind: LoadKind }>({ kind: 'load' });

  useEffect(() => {
    let cancelled = false;
    loadDriverHome(driverId)
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
  }, [request, driverId]);

  const isFirstFocus = useRef(true);
  // Read in the focus callback; a ref keeps the callback stable so it only runs on focus.
  const hasData = useRef(false);
  useEffect(() => {
    hasData.current = data !== null;
  }, [data]);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      setRequest({ kind: hasData.current ? 'refresh' : 'load' });
    }, []),
  );

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
