import { router } from 'expo-router';
import { CircleX, MessageCircle, SearchX } from 'lucide-react-native';
import { FlatList, StyleSheet, View } from 'react-native';

import { EmptyState, ScreenHeader, Skeleton, TextField } from '@/components/ui';
import { colors, radii, spacing } from '@/theme';

import { useChat } from '../ChatProvider';
import { RoomCard } from '../components/RoomCard';
import { useChatRooms } from '../hooks/useChatRooms';
import { chatRoomHref } from '../routes';

const SKELETON_CARDS = 3;
const SKELETON_HEIGHT = 112;

/** Chat tab: the order rooms for the trips the driver or mechanic is assigned to. */
export function ChatRoomsScreen() {
  const { user } = useChat();
  const { rooms, filtered, query, setQuery, retry } = useChatRooms();
  const now = new Date();

  function renderEmpty() {
    if (rooms.kind === 'loading') {
      return (
        <View style={styles.gap} accessibilityLabel="Loading chats">
          {Array.from({ length: SKELETON_CARDS }, (_, index) => (
            <Skeleton key={index} height={SKELETON_HEIGHT} radius={radii.card} />
          ))}
        </View>
      );
    }
    if (rooms.kind === 'error') {
      return (
        <EmptyState
          icon={CircleX}
          tone="danger"
          title="Couldn’t load your chats"
          description={rooms.message}
          action={{ label: 'Retry', onPress: retry }}
        />
      );
    }
    if (rooms.rooms.length === 0) {
      return (
        <EmptyState icon={MessageCircle} title="No chats yet" description="Chats appear when a trip is assigned to you." />
      );
    }
    return <EmptyState icon={SearchX} title="No matching chats" description="Try an order ID, trip ID or place name." />;
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Chat" subtitle="One room per order" />
      <FlatList
        data={filtered}
        keyExtractor={(room) => room.id}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          rooms.kind === 'loaded' && rooms.rooms.length > 0 ? (
            <TextField
              label="Search chats"
              hideLabel
              value={query}
              onChangeText={setQuery}
              placeholder="Search order, trip or place"
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          ) : undefined
        }
        ListEmptyComponent={renderEmpty()}
        renderItem={({ item }) =>
          user ? (
            <RoomCard
              room={item}
              currentUserId={user.id}
              now={now}
              onPress={() => router.push(chatRoomHref(user.role, item.id))}
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  gap: {
    gap: spacing.lg,
  },
});
