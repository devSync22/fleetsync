import { StyleSheet, Text, View } from 'react-native';

import { Button, Card } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { spacing, typography } from '@/theme';

import { emitMockEvent, mockCoordinatorMessage } from '../mocks/notificationMocks';

const DELAY_MS = 5_000;

/**
 * DEV ONLY — remove before the PR (this file + its line in app/driver/(tabs)/profile.tsx).
 * Fires each notification type after 5 s, so there is time to lock the phone or leave the app.
 */
export function DevNotificationTester() {
  const { user } = useAuth();
  if (!__DEV__ || !user) return null;
  const userId = user.id;

  return (
    <Card>
      <Text style={typography.sectionLabel}>Dev · test notifications (5 s)</Text>
      <View style={styles.buttons}>
        <Button
          label="Trip assigned"
          variant="secondary"
          onPress={() => emitMockEvent({ kind: 'trip', type: 'trip_assigned', tripId: 'TRP-2208' }, DELAY_MS)}
        />
        <Button
          label="Chat message"
          variant="secondary"
          onPress={() => emitMockEvent({ kind: 'chat', message: mockCoordinatorMessage(userId) }, DELAY_MS)}
        />
        <Button
          label="Trip cancelled"
          variant="secondary"
          onPress={() => emitMockEvent({ kind: 'trip', type: 'trip_cancelled', tripId: 'TRP-2208' }, DELAY_MS)}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  buttons: {
    gap: spacing.md,
  },
});
