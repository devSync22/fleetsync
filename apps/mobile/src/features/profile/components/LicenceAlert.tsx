import { TriangleAlert } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { formatFullDate } from '@/lib/format';
import { colors, radii, sizes, spacing, typography } from '@/theme';

import { daysUntil, parseIsoDate } from '../licence';

function titleFor(days: number) {
  if (days < 0) return 'Your licence has expired';
  if (days === 0) return 'Your licence expires today';
  return `Your licence expires in ${days} ${days === 1 ? 'day' : 'days'}`;
}

/** Amber "Your licence expires in 24 days" banner (Driver — Profile (Licence expiring)). */
export function LicenceAlert({ expiresOn, onUpload }: { expiresOn: string; onUpload: () => void }) {
  const days = daysUntil(expiresOn);
  const verb = days < 0 ? 'expired' : 'expires';

  return (
    <View style={styles.alert} accessibilityRole="alert">
      <View style={styles.row}>
        <TriangleAlert size={sizes.iconMd + 2} color={colors.pending} />
        <View style={styles.text}>
          <Text style={styles.title}>{titleFor(days)}</Text>
          <Text style={styles.message}>
            It {verb} on {formatFullDate(parseIsoDate(expiresOn))}. Upload photos of your renewed licence so you keep
            getting trips.
          </Text>
        </View>
      </View>
      <Button label="Upload renewed licence" onPress={onUpload} />
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    borderRadius: radii.card,
    backgroundColor: colors.pendingSoft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.ml,
  },
  text: {
    flex: 1,
    gap: 3,
  },
  title: {
    ...typography.stopTitle,
    color: colors.pending,
  },
  message: {
    ...typography.bodySmall,
    lineHeight: 18,
    color: colors.pending,
  },
});
