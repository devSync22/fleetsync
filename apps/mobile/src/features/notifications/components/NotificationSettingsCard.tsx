import { Linking, StyleSheet, Switch, Text, View } from 'react-native';

import { Button, Card, InfoBanner } from '@/components/ui';
import { colors, sizes, spacing, typography } from '@/theme';

import { useNotifications } from '../NotificationsProvider';
import type { NotificationPrefs } from '../types';

const ROWS: { key: keyof NotificationPrefs; title: string; caption: string }[] = [
  { key: 'tripUpdates', title: 'Trip updates', caption: 'New, changed and cancelled trips' },
  { key: 'chatMessages', title: 'Chat messages', caption: 'New messages in your trip chats' },
];

/**
 * Profile → Notifications. Not in the Profile frames (219:6777), so kept minimal: two switches, and a
 * banner with a settings button when the phone blocks notifications.
 */
export function NotificationSettingsCard() {
  const { permission, prefs, setPref } = useNotifications();

  function openSettings() {
    Linking.openSettings().catch(() => undefined);
  }

  return (
    <Card>
      <Text style={typography.sectionLabel}>Notifications</Text>
      {permission === 'denied' ? (
        <View style={styles.blocked}>
          <InfoBanner
            tone="pending"
            title="Notifications are off"
            message="Turn them on in your phone’s settings to hear about new trips and messages."
          />
          <Button label="Open settings" variant="secondary" onPress={openSettings} />
        </View>
      ) : null}
      {ROWS.map((row) => (
        <View key={row.key} style={styles.row}>
          <View style={styles.text}>
            <Text style={typography.bodyMedium}>{row.title}</Text>
            <Text style={typography.caption}>{row.caption}</Text>
          </View>
          <Switch
            value={prefs[row.key]}
            onValueChange={(value) => setPref(row.key, value)}
            accessibilityLabel={row.title}
            trackColor={{ false: colors.line, true: colors.accent }}
            thumbColor={colors.surface}
            ios_backgroundColor={colors.line}
          />
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  blocked: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    minHeight: sizes.touchTarget,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
});
