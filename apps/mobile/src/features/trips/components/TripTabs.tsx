import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

export type TripTab = 'Upcoming' | 'History';

const TABS: TripTab[] = ['Upcoming', 'History'];

type TripTabsProps = {
  value: TripTab;
  onChange: (tab: TripTab) => void;
};

/** Upcoming / History switch on Driver — Trip history. */
export function TripTabs({ value, onChange }: TripTabsProps) {
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {TABS.map((tab) => {
        const selected = tab === value;
        return (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(tab)}
            style={[styles.tab, selected && styles.selected]}>
            <Text style={selected ? typography.bodySmallStrong : [typography.label, styles.unselectedLabel]}>{tab}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radii.tile,
    backgroundColor: colors.greySoft,
  },
  tab: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.control,
  },
  selected: {
    backgroundColor: colors.surface,
    boxShadow: `0px 1px 3px ${colors.line}`,
  },
  unselectedLabel: {
    color: colors.muted,
  },
});
