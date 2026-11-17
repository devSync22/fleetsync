import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getInitials } from '@/components/ui';
import { colors, radii, sizes, spacing, typography } from '@/theme';

import type { Participant } from '../types';

type ParticipantChipProps = {
  participant: Participant;
  selected: boolean;
  unreadCount: number;
  onPress: () => void;
};

/** A person in the room (Driver — Chat: "Nimal · Coordinator"). Selected = the open thread. */
export function ParticipantChip({ participant, selected, unreadCount, onPress }: ParticipantChipProps) {
  const firstName = participant.name.split(' ')[0];

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={`${participant.name}, ${participant.subtitle}${unreadCount ? `, ${unreadCount} unread` : ''}`}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}>
      <View style={[styles.avatar, selected && styles.avatarSelected]}>
        <Text style={[typography.avatarTiny, selected && styles.accent]}>{getInitials(participant.name)}</Text>
      </View>
      <View style={styles.text}>
        <Text style={[typography.bodySmallStrong, selected && styles.accent]} numberOfLines={1}>
          {firstName}
        </Text>
        <Text style={typography.micro} numberOfLines={1}>
          {participant.subtitle}
        </Text>
      </View>
      {unreadCount > 0 && !selected ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: sizes.touchTarget,
    paddingLeft: spacing.md,
    paddingRight: spacing.lg,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: sizes.hairline,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  selected: {
    borderWidth: sizes.selectedBorder,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  avatar: {
    width: sizes.chipAvatar,
    height: sizes.chipAvatar,
    borderRadius: radii.pill,
    backgroundColor: colors.greySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelected: {
    backgroundColor: colors.surface,
  },
  accent: {
    color: colors.accent,
  },
  text: {
    flex: 1,
  },
  dot: {
    width: spacing.md,
    height: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
});
