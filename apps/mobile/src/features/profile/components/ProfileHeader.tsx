import { StyleSheet, Text, View } from 'react-native';

import { Avatar, StatusBadge } from '@/components/ui';
import type { AuthUser } from '@/features/auth/types';
import { formatMonthYear } from '@/lib/format';
import { colors, radii, sizes, spacing, typography } from '@/theme';

import type { DriverProfile } from '../types';

const ROLE_LABELS = { driver: 'Driver', mechanic: 'Mechanic' } as const;

/** Avatar, name, "Driver · DRV-014 · Colombo depot", status and "Since Mar 2023". */
export function ProfileHeader({ user, profile }: { user: AuthUser; profile: DriverProfile }) {
  return (
    <View style={styles.card}>
      <Avatar name={user.name} size={sizes.avatarLarge} />
      <View style={styles.text}>
        <Text style={typography.profileName}>{user.name}</Text>
        <Text style={typography.meta}>
          {/* Staff ID and depot are left out until the API provides them. */}
          {[ROLE_LABELS[user.role], user.staffId, user.depot].filter(Boolean).join(' · ')}
        </Text>
        <View style={styles.badges}>
          <StatusBadge label={profile.status} />
          <StatusBadge label={`Since ${formatMonthYear(profile.memberSince)}`} tone="neutral" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    padding: spacing.xxl,
    backgroundColor: colors.surface,
    borderWidth: sizes.hairline,
    borderColor: colors.border,
    borderRadius: radii.card,
  },
  text: {
    flex: 1,
    gap: 3,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
