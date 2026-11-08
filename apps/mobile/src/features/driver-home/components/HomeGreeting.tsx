import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { spacing, typography } from '@/theme';

import { firstName, greetingFor } from '../greeting';

type HomeGreetingProps = {
  /** Signed-in driver's full name — "Kasun Jayasinghe". */
  name: string;
  /** "DRV-014". */
  staffId: string;
  now: Date;
};

/** "Good morning, Kasun" / "Monday, 19 Oct · DRV-014" with the driver's initials. */
export function HomeGreeting({ name, staffId, now }: HomeGreetingProps) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={typography.screenTitle} accessibilityRole="header" numberOfLines={1}>
          {greetingFor(now)}, {firstName(name)}
        </Text>
        <Text style={typography.meta}>
          {formatDate(now)} · {staffId}
        </Text>
      </View>
      <Avatar name={name} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
});
