import { useEffect, useState } from 'react';

import { useChat } from '../ChatProvider';
import { chatService } from '../services/chatService';
import type { Message } from '../types';
import { validateMessage } from '../validation';

export type ThreadState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'loaded'; threadId: string; messages: Message[] };

function upsert(messages: Message[], message: Message): Message[] {
  return messages.some((existing) => existing.id === message.id)
    ? messages.map((existing) => (existing.id === message.id ? message : existing))
    : [...messages, message];
}

/**
 * One 1-to-1 thread in a room: loads it, marks it read (clears its unread count), receives new
 * messages live, and sends with optimistic "sending" → sent / failed (with retry).
 */
export function useThread(roomId: string, participantId: string) {
  const { user, refresh } = useChat();
  const userId = user?.id;
  const [state, setState] = useState<ThreadState>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);

  const threadId = state.kind === 'loaded' ? state.threadId : null;

  useEffect(() => {
    let cancelled = false;
    chatService
      .getThread(roomId, participantId)
      .then((thread) => {
        if (cancelled) return;
        setState({ kind: 'loaded', ...thread });
        return chatService.markSeen(roomId, participantId).then(refresh);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({ kind: 'error', message: error instanceof Error ? error.message : 'Couldn’t load messages.' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [roomId, participantId, attempt, refresh]);

  // Live messages and status changes for this thread. Their messages are read straight away.
  useEffect(() => {
    if (!threadId) return undefined;
    return chatService.onMessage((message) => {
      if (message.threadId !== threadId) return;
      setState((current) => (current.kind === 'loaded' ? { ...current, messages: upsert(current.messages, message) } : current));
      if (message.senderId === participantId && message.status !== 'seen') {
        chatService.markSeen(roomId, participantId).catch(() => undefined);
      }
    });
  }, [threadId, roomId, participantId]);

  function update(message: Message) {
    setState((current) => (current.kind === 'loaded' ? { ...current, messages: upsert(current.messages, message) } : current));
  }

  function deliver(message: Message) {
    update({ ...message, status: 'sending' });
    chatService
      .sendMessage(roomId, participantId, message.text, message.id)
      .then(update)
      .catch(() => update({ ...message, status: 'failed' }))
      .finally(refresh);
  }

  /** Returns false when the text can't be sent (blank or too long). */
  function send(text: string): boolean {
    if (!threadId || !userId || validateMessage(text)) return false;
    deliver({
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      roomId,
      threadId,
      senderId: userId,
      text: text.trim(),
      sentAt: new Date().toISOString(),
      status: 'sending',
    });
    return true;
  }

  function retry() {
    setState({ kind: 'loading' });
    setAttempt((count) => count + 1);
  }

  return { state, send, resend: deliver, retry };
}
