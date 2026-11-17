import { MapPin, Phone } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card, IconButton } from '@/components/ui';
import { formatTime } from '@/lib/format';
import { colors, sizes, spacing, typography } from '@/theme';

import { callContact } from '../callContact';
import type { Trip } from '../types';

type ActiveStopCardProps = {
  trip: Trip;
  /** Pickup while heading to it, destination after the cargo is picked up. */
  stop: 'pickup' | 'destination';
  disabled?: boolean;
};

/** "PICK UP FROM" / "HEADING TO" card with the stop, its time and contact, and a call button. No map. */
export function ActiveStopCard({ trip, stop, disabled }: ActiveStopCardProps) {
  const isPickup = stop === 'pickup';
  const place = isPickup ? trip.pickup : trip.destination;
  const title = isPickup ? place.name : `${place.shortName}, ${place.area}`;
  const detail = isPickup
    ? `Pickup ${formatTime(trip.scheduledStart)} · ${place.contactName}`
    : `Deliver by ${formatTime(trip.deliverBy)} · ${place.contactName}`;

  return (
    <Card style={styles.card}>
      <MapPin size={sizes.iconLg} color={colors.accent} />
      <View style={styles.text}>
        <Text style={typography.sectionLabel}>{isPickup ? 'Pick up from' : 'Heading to'}</Text>
        <Text style={typography.stopTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={typography.caption} numberOfLines={1}>
          {detail}
        </Text>
      </View>
      <IconButton
        icon={Phone}
        size={sizes.avatar}
        accessibilityLabel={`Call ${place.contactName}`}
        onPress={() => callContact(place.contactPhone)}
        disabled={disabled}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xl,
  },
  text: {
    flex: 1,
    gap: 1,
  },
});
