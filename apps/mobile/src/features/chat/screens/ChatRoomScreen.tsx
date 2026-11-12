import { router, useLocalSearchParams } from 'expo-router';
import { CircleX, SearchX } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui';
import { colors, sizes, spacing } from '@/theme';

import { useChat } from '../ChatProvider';
import { ParticipantChip } from '../components/ParticipantChip';
import { RoomHeader } from '../components/RoomHeader';
import { ThreadView } from '../components/ThreadView';
import { isRoomReadOnly } from '../permissions';
import { chatListHref } from '../routes';
import type { ChatRoom } from '../types';

function readOnlyReason(room: ChatRoom) {
  if (!isRoomReadOnly(room.tripStatus)) return null;
  const state = room.tripStatus === 'Cancelled' ? 'cancelled' : 'completed';
  return `This trip is ${state}. Chat is read-only.`;
}

/**
 * Driver — Chat (Figma 174:6708) / Mechanic — Chat (180:7023): the order's trip room, the people the user
 * may message, and the 1-to-1 thread with the selected person. `?with=` picks the starting person.
 */
export function ChatRoomScreen() {
  const { roomId, with: withId } = useLocalSearchParams<{ roomId: string; with?: string }>();
  const insets = useSafeAreaInsets();
  const { user, rooms, retry } = useChat();
  const [pickedId, setPickedId] = useState<string | undefined>(withId);
  // A new `?with=` (e.g. another Message button on Trip details) selects that person.
  const [lastWithId, setLastWithId] = useState(withId);
  if (withId !== lastWithId) {
    setLastWithId(withId);
    setPickedId(withId);
  }

  const backToList = () => user && router.navigate(chatListHref(user.role));
  const room = rooms.kind === 'loaded' ? rooms.rooms.find((candidate) => candidate.id === roomId) : undefined;
  const selected = room?.participants.find((p) => p.id === pickedId) ?? room?.participants[0];

  function renderBody() {
    if (rooms.kind === 'loading') {
      return (
        <View style={styles.center}>
          <ActivityIndicator color={colors.muted} accessibilityLabel="Loading chat" />
        </View>
      );
    }
    if (rooms.kind === 'error') {
      return (
        <View style={styles.padded}>
          <EmptyState
            icon={CircleX}
            tone="danger"
            title="Couldn’t load this chat"
            description={rooms.message}
            action={{ label: 'Retry', onPress: retry }}
          />
        </View>
      );
    }
    if (!room || !selected || !user) {
      return (
        <View style={styles.padded}>
          <EmptyState
            icon={SearchX}
            title="Chat room not found"
            description="This order’s room doesn’t exist or you are not on its trip."
            action={{ label: 'All chats', variant: 'secondary', onPress: backToList }}
          />
        </View>
      );
    }

    return (
      <>
        <View style={styles.room}>
          <RoomHeader title={`${room.tripId} · ${room.customerName}`} onBack={backToList} />
          <View style={styles.chips} accessibilityRole="tablist">
            {room.participants.map((participant) => (
              <ParticipantChip
                key={participant.id}
                participant={participant}
                selected={participant.id === selected.id}
                unreadCount={room.threadUnread[participant.id] ?? 0}
                onPress={() => setPickedId(participant.id)}
              />
            ))}
          </View>
        </View>
        <ThreadView
          key={selected.id}
          roomId={room.id}
          participant={selected}
          currentUserId={user.id}
          readOnlyReason={readOnlyReason(room)}
        />
      </>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* White strip behind the status bar, as in the frame. */}
      <View style={[styles.statusBar, { height: insets.top }]} />
      {renderBody()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statusBar: {
    backgroundColor: colors.surface,
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
  room: {
    gap: spacing.ml,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: sizes.hairline,
    borderBottomColor: colors.border,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
