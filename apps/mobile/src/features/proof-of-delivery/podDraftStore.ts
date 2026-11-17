import type { PodDraft } from './types';

/**
 * In-memory drafts, one per trip, so the driver can leave Proof of delivery and come back
 * without losing anything. Cleared after a successful submission.
 */
const drafts = new Map<string, PodDraft>();
const listeners = new Set<() => void>();

export function createPodDraft(recipientName: string): PodDraft {
  return {
    recipientName,
    cargoCondition: 'All received',
    photos: [],
    signature: null,
    notes: '',
  };
}

export function getPodDraft(tripId: string): PodDraft | undefined {
  return drafts.get(tripId);
}

/** Merges `changes` into the trip's draft, creating it from `fallback` the first time. */
export function updatePodDraft(tripId: string, changes: Partial<PodDraft>, fallback: PodDraft) {
  drafts.set(tripId, { ...(drafts.get(tripId) ?? fallback), ...changes });
  listeners.forEach((listener) => listener());
}

export function clearPodDraft(tripId: string) {
  drafts.delete(tripId);
  listeners.forEach((listener) => listener());
}

export function subscribeToPodDrafts(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
