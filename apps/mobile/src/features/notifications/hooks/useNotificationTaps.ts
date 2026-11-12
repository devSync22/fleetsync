import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useAuth } from '@/contexts/AuthContext';

import { setPendingTap } from '../pendingTap';
import { notificationsService } from '../services/notificationsService';

/**
 * Listens for notification taps for the whole app (root layout). The tap is kept until the signed-in area
 * opens it; when signed out, the user is sent to Sign in first.
 */
export function useNotificationTaps() {
  const { user, isLoading } = useAuth();
  const signedOutRef = useRef(false);

  useEffect(() => {
    // While the saved session loads, `index` decides where to go; navigating now would race it.
    signedOutRef.current = !isLoading && !user;
  }, [user, isLoading]);

  useEffect(
    () =>
      notificationsService.onNotificationTapped((tap) => {
        setPendingTap(tap);
        if (signedOutRef.current) router.navigate('/sign-in');
      }),
    [],
  );
}
