import type { NotificationTap } from './types';

/**
 * The last notification tap not opened yet. Taps arrive at the root (even when signed out); the signed-in
 * area takes them, so a tap made while signed out opens after Sign in.
 */
let pending: NotificationTap | null = null;
const listeners = new Set<() => void>();

export function setPendingTap(tap: NotificationTap) {
  pending = tap;
  listeners.forEach((listener) => listener());
}

export function takePendingTap(): NotificationTap | null {
  const tap = pending;
  pending = null;
  return tap;
}

export function onPendingTap(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
