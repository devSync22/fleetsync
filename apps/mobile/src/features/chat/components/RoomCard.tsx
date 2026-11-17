import { StyleSheet, Text, View } from 'react-native';

import { Card, StatusBadge } from '@/components/ui';
import { tripBadgeLabel } from '@/features/trips';
import { colors, radii, sizes, spacing, typography } from '@/theme';

import { roomTimeLabel } from '../chatDates';
import type { ChatRoom } from '../types';

type RoomCardProps = {
  room: ChatRoom;
  currentUserId: string;
  now: Date;
  onPress: () => void;
};

/** "You: …" for my messages, "Nimal: …" for theirs, plain text for trip events. */
function lastMessagePreview(room: ChatRoom, currentUserId: string) {
  const message = room.lastMessage;
  if (!message) return 'No messages yet';
  if (message.kind === 'event') return message.text;
  if (message.senderId === currentUserId) return `You: ${message.text}`;
  const sender = room.participants.find((participant) => participant.id === message.senderId);
  return sender ? `${sender.name.split(' ')[0]}: ${message.text}` : message.text;
}

/** One order's chat room in the list (layout from Coordinator — Chat "Order rooms", fitted to mobile). */
export function RoomCard({ room, currentUserId, now, onPress }: RoomCardProps) {
  const unread = room.unreadCount > 0;
  const label = `${room.orderId}, ${room.tripId}, ${room.customerName}${unread ? `, ${room.unreadCount} unread` : ''}`;

  return (
    <Card onPress={onPress} accessibilityLabel={label} style={styles.card}>
      <View style={styles.row}>
        <Text style={[typography.mono, styles.flex]} numberOfLines={1}>
          {room.orderId}
          <Text style={styles.muted}> · {room.tripId}</Text>
        </Text>
        {room.lastMessage ? <Text style={typography.micro}>{roomTimeLabel(room.lastMessage.sentAt, now)}</Text> : null}
      </View>
      <View style={styles.row}>
        <Text style={[typography.bodyStrong, styles.flex]} numberOfLines={1}>
          {room.customerName}
        </Text>
        <StatusBadge label={tripBadgeLabel(room.tripStatus)} />
      </View>
      <Text style={typography.caption} numberOfLines={1}>
        {room.route}
      </Text>
      <View style={styles.row}>
        <Text style={[typography.bodySmall, styles.flex, !unread && styles.muted]} numberOfLines={1}>
          {lastMessagePreview(room, currentUserId)}
        </Text>
        {unread ? (
          <View style={styles.count}>
            <Text style={[typography.badge, styles.countText]}>{room.unreadCount}</Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  muted: {
    color: colors.muted,
  },
  count: {
    minWidth: sizes.countPill,
    height: sizes.countPill,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: colors.surface,
  },
});
