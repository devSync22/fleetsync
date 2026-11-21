import { MapPin, Phone } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/ui';
import { colors, sizes, spacing, typography } from '@/theme';

import { callContact } from '../callContact';
import type { TripStop } from '../types';

type StopDetailProps = {
  /** "Pickup · 09:30", "Destination · by 12:00". */
  label: string;
  stop: TripStop;
};

/** One stop on Trip details: label + time, place, address, contact, and a call button. */
export function StopDetail({ label, stop }: StopDetailProps) {
  return (
    <View style={styles.row}>
      <MapPin size={sizes.iconMd} color={colors.accent} />
      <View style={styles.text}>
        <Text style={typography.micro}>{label}</Text>
        <Text style={typography.bodyStrong}>{stop.name}</Text>
        <Text style={typography.captionLong}>{stop.address}</Text>
        <Text style={typography.captionStrong}>
          {stop.contactRole}: {stop.contactName}
        </Text>
      </View>
      <IconButton
        icon={Phone}
        accessibilityLabel={`Call ${stop.contactName}`}
        onPress={() => callContact(stop.contactPhone)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
});
