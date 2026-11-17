import { CircleX, Lock, MessageCircle } from 'lucide-react-native';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui';
import { colors, sizes, spacing, typography } from '@/theme';

import { dayLabel } from '../chatDates';
import { useThread } from '../hooks/useThread';
import type { Message, Participant } from '../types';

import { Composer } from './Composer';
import { DayDivider } from './DayDivider';
import { MessageBubble } from './MessageBubble';
import { ThreadNotice } from './ThreadNotice';

type ThreadViewProps = {
  roomId: string;
  participant: Participant;
  currentUserId: string;
  /** Completed or Cancelled trip: history only, no composer. */
  readOnlyReason: string | null;
};

type Row = { key: string; day: string } | { key: string; message: Message };

/** Messages with a day divider before each new day, newest first (the list is inverted). */
function toRows(messages: Message[], now: Date): Row[] {
  const rows: Row[] = [];
  let lastDay = '';
  for (const message of messages) {
    const day = dayLabel(message.sentAt, now);
    if (day !== lastDay) {
      rows.push({ key: `day-${message.id}`, day });
      lastDay = day;
    }
    rows.push({ key: message.id, message });
  }
  return rows.reverse();
}

/** One 1-to-1 thread: messages, then the composer (or the read-only note). */
export function ThreadView({ roomId, participant, currentUserId, readOnlyReason }: ThreadViewProps) {
  const { state, send, resend, retry } = useThread(roomId, participant.id);
  const firstName = participant.name.split(' ')[0];

  function renderBody() {
    if (state.kind === 'loading') {
      return (
        <View style={styles.center}>
          <ActivityIndicator color={colors.muted} accessibilityLabel="Loading messages" />
        </View>
      );
    }
    if (state.kind === 'error') {
      return (
        <View style={styles.padded}>
          <EmptyState
            icon={CircleX}
            tone="danger"
            title="Couldn’t load messages"
            description={state.message}
            action={{ label: 'Retry', onPress: retry }}
          />
        </View>
      );
    }
    if (state.messages.length === 0) {
      return (
        <View style={styles.padded}>
          <EmptyState
            icon={MessageCircle}
            title="No messages yet"
            description={readOnlyReason ? `You didn’t message ${firstName} on this trip.` : `Say hello to ${firstName}.`}
          />
        </View>
      );
    }
    return (
      <FlatList
        inverted
        data={toRows(state.messages, new Date())}
        keyExtractor={(row) => row.key}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        renderItem={({ item }) => {
          if ('day' in item) return <DayDivider label={item.day} />;
          const { message } = item;
          if (message.kind === 'event') return <ThreadNotice text={message.text} />;
          return (
            <MessageBubble message={message} mine={message.senderId === currentUserId} onRetry={() => resend(message)} />
          );
        }}
      />
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.flex}>{renderBody()}</View>
      {readOnlyReason ? (
        <View style={styles.readOnly}>
          <Lock size={sizes.iconXs} color={colors.muted} />
          <Text style={[typography.caption, styles.flex]}>{readOnlyReason}</Text>
        </View>
      ) : (
        <Composer placeholder={`Message ${firstName}…`} onSend={send} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  padded: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  list: {
    gap: spacing.ml,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  readOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    backgroundColor: colors.greySoft,
    borderTopWidth: sizes.hairline,
    borderTopColor: colors.border,
  },
});
