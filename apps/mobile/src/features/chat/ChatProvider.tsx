import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';

import { useAuth } from '@/contexts/AuthContext';

import { chatService } from './services/chatService';
import type { ChatRoom, ChatUser } from './types';

export type RoomsState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'loaded'; rooms: ChatRoom[] };

type ChatContextValue = {
  user: ChatUser | null;
  rooms: RoomsState;
  /** Total unread messages — the Chat tab badge. */
  unreadCount: number;
  /** Shows the loading state and loads again (error state "Retry"). */
  retry: () => void;
  /** Reloads in the background; a failure keeps the current rooms. */
  refresh: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Couldn’t load your chats.';
}

/**
 * Connects to chat for the signed-in driver or mechanic and keeps their rooms (unread counts, last
 * message) up to date while the app is open. Wraps the driver and mechanic tabs.
 */
export function ChatProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  const userId = authUser?.id;
  const role = authUser?.role;
  const user = userId && role ? { id: userId, role } : null;

  const [rooms, setRooms] = useState<RoomsState>({ kind: 'loading' });
  const [connected, setConnected] = useState(false);
  const [connectAttempt, setConnectAttempt] = useState(0);
  // A new object starts a load; `quiet` loads keep the current rooms on failure.
  const [request, setRequest] = useState({ quiet: false });

  useEffect(() => {
    if (!userId || !role) return undefined;
    let cancelled = false;
    chatService
      .connect({ id: userId, role })
      .then(() => {
        if (!cancelled) setConnected(true);
      })
      .catch((error: unknown) => {
        if (!cancelled) setRooms({ kind: 'error', message: errorMessage(error) });
      });
    // Any new message or status change updates unread counts and last messages.
    const unsubscribe = chatService.onMessage(() => setRequest({ quiet: true }));
    return () => {
      cancelled = true;
      unsubscribe();
      setConnected(false);
      setRooms({ kind: 'loading' });
      chatService.disconnect();
    };
  }, [userId, role, connectAttempt]);

  useEffect(() => {
    if (!connected) return undefined;
    let cancelled = false;
    chatService
      .getRooms()
      .then((loaded) => {
        if (!cancelled) setRooms({ kind: 'loaded', rooms: loaded });
      })
      .catch((error: unknown) => {
        if (!cancelled && !request.quiet) setRooms({ kind: 'error', message: errorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [connected, request]);

  const unreadCount = rooms.kind === 'loaded' ? rooms.rooms.reduce((sum, room) => sum + room.unreadCount, 0) : 0;

  const retry = useCallback(() => {
    setRooms({ kind: 'loading' });
    if (connected) setRequest({ quiet: false });
    else setConnectAttempt((count) => count + 1);
  }, [connected]);
  const refresh = useCallback(() => setRequest({ quiet: true }), []);

  const value: ChatContextValue = { user, rooms, unreadCount, retry, refresh };

  return <ChatContext value={value}>{children}</ChatContext>;
}

export function useChat(): ChatContextValue {
  const context = use(ChatContext);
  if (!context) throw new Error('useChat must be used inside <ChatProvider>.');
  return context;
}
