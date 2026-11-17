import { Linking, StyleSheet, Switch, Text, View } from 'react-native';

import { Button, InfoBanner } from '@/components/ui';
import { colors, radii, sizes, spacing, typography } from '@/theme';

import { useNotifications } from '../NotificationsProvider';
import type { NotificationPrefs } from '../types';

const ROWS: { key: keyof NotificationPrefs; title: string; caption: string }[] = [
  { key: 'tripUpdates', title: 'Trip updates', caption: 'New, changed and cancelled trips' },
  { key: 'chatMessages', title: 'Chat messages', caption: 'New messages in your trip chats' },
];

/**
 * Profile → Notifications. Not in the Profile frames (219:6777), so kept minimal: two switches, and a
 * banner with a settings button when the phone blocks notifications. Styled like the Profile cards
 * (uppercase label, full-width rows with dividers).
 */
export function NotificationSettingsCard() {
  const { permission, prefs, setPref } = useNotifications();

  function openSettings() {
    Linking.openSettings().catch(() => undefined);
  }

  return (
    <View style={styles.card}>
      <Text style={[typography.sectionLabel, styles.header]} accessibilityRole="header">
        Notifications
      </Text>
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
      {ROWS.map((row, index) => (
        <View key={row.key} style={[styles.row, index < ROWS.length - 1 && styles.divider]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: sizes.hairline,
    borderColor: colors.border,
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  blocked: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.ml,
  },
  divider: {
    borderBottomWidth: sizes.hairline,
    borderBottomColor: colors.border,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
});
