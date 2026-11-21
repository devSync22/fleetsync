import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getTodayTrip, getTripHistory, getUpcomingTrips } from '../services/tripsApi';
import type { Trip } from '../types';

export type TripHistoryData = {
  /** Today's open trip (if any) and assigned trips on later days. */
  upcoming: Trip[];
  /** Completed and cancelled trips, newest first. */
  history: Trip[];
  checkedAt: Date;
};

async function loadTrips(): Promise<TripHistoryData> {
  const [today, later, history] = await Promise.all([getTodayTrip(), getUpcomingTrips(), getTripHistory()]);
  const todayOpen = today && today.status !== 'Completed' ? [today] : [];
  return { upcoming: [...todayOpen, ...later], history, checkedAt: new Date() };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Couldn’t load your trips.';
}

/**
 * Data for Driver — Trip history (same loading rules as Driver — Home):
 * - `retry()` after a failed first load shows the skeleton again.
 * - `refresh()` (pull-to-refresh) keeps the list on screen; if it fails, `refreshError` is set.
 * - Coming back to the tab (e.g. after completing a trip) reloads quietly.
 */
export function useTripHistory() {
  const [data, setData] = useState<TripHistoryData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [request, setRequest] = useState<{ kind: 'load' | 'refresh' }>({ kind: 'load' });

  useEffect(() => {
    let cancelled = false;
    loadTrips()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setLoadError(null);
        setRefreshError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (request.kind === 'refresh') setRefreshError(errorMessage(error));
        else setLoadError(errorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setIsRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [request]);

  const isFirstFocus = useRef(true);
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

  return { data, isLoading: !data && !loadError, loadError, refreshError, isRefreshing, retry, refresh };
}
