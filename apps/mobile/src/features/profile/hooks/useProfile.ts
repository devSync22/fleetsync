import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';

import { getProfile } from '../services/profileService';
import type { DriverProfile } from '../types';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

/**
 * The signed-in driver's profile. Loads every time the screen comes into focus, so Profile shows a
 * licence renewal sent from "Upload renewed licence" straight away.
 * - `loadError`: nothing to show yet → full error state with Retry.
 * - `refreshError`: a reload failed while older data is on screen → small banner.
 */
export function useProfile() {
  const userId = useAuth().user?.id ?? '';
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Each focus and each Retry bumps `loadCount`, which starts a load (0 = not focused yet).
  const [loadCount, setLoadCount] = useState(0);
  useFocusEffect(useCallback(() => setLoadCount((count) => count + 1), []));

  useEffect(() => {
    if (loadCount === 0) return;
    let cancelled = false;
    getProfile(userId)
      .then((result) => {
        if (cancelled) return;
        setProfile(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(errorMessage(cause));
      });
    return () => {
      cancelled = true;
    };
  }, [userId, loadCount]);

  function retry() {
    setError(null);
    setLoadCount((count) => count + 1);
  }

  return {
    profile,
    isLoading: !profile && !error,
    loadError: profile ? null : error,
    refreshError: profile ? error : null,
    retry,
  };
}
