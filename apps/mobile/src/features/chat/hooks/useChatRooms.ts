import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useChat } from '../ChatProvider';
import type { ChatRoom } from '../types';

function matches(room: ChatRoom, query: string) {
  const text = `${room.orderId} ${room.tripId} ${room.customerName} ${room.route} ${room.tripStatus}`.toLowerCase();
  return text.includes(query.trim().toLowerCase());
}

/** The room list with search (order ID, trip ID, customer, route, status). Refreshes when the screen is shown. */
export function useChatRooms() {
  const { rooms, retry, refresh } = useChat();
  const [query, setQuery] = useState('');

  useFocusEffect(useCallback(() => refresh(), [refresh]));

  const filtered = rooms.kind === 'loaded' ? rooms.rooms.filter((room) => matches(room, query)) : [];
  return { rooms, filtered, query, setQuery, retry };
}
