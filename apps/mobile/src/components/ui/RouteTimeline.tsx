import { MapPin } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, sizes, spacing, typography } from '@/theme';

export type RouteTimelineStop = {
  /** Small label above the place — "Pickup", "Destination". */
  label: string;
  /** Place — "Colombo Pharma, Colombo 10". */
  name: string;
  /** Right-hand time in mono — "09:30", "by 12:00". */
  time?: string;
};

type RouteTimelineProps = {
  stops: readonly RouteTimelineStop[];
};

const CONNECTOR_HEIGHT = 22;

/**
 * Stops joined by a vertical line, each with a pin, label, place and time
 * (Driver — Home trip card; reused by the trip flow screens). Stops and times only — never a map.
 */
export function RouteTimeline({ stops }: RouteTimelineProps) {
  return (
    <View>
      {stops.map((stop, index) => {
        const isLast = index === stops.length - 1;
        return (
          <View
            key={`${stop.label}-${index}`}
            style={styles.row}
            accessible
            accessibilityLabel={[stop.label, stop.name, stop.time].filter(Boolean).join(', ')}>
            <View style={styles.marker}>
              <MapPin size={sizes.iconMd} color={colors.accent} />
              {isLast ? null : <View style={styles.connector} />}
            </View>
            <View style={styles.text}>
              <Text style={typography.micro}>{stop.label}</Text>
              <Text style={typography.bodyStrong} numberOfLines={2}>
                {stop.name}
              </Text>
            </View>
            {stop.time ? <Text style={typography.mono}>{stop.time}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  marker: {
    alignItems: 'center',
  },
  connector: {
    width: sizes.focusBorder,
    height: CONNECTOR_HEIGHT,
    backgroundColor: colors.border,
  },
  text: {
    flex: 1,
    gap: 1,
  },
});
