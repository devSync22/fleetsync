import { useSyncExternalStore } from 'react';

import { clearPodDraft, createPodDraft, getPodDraft, subscribeToPodDrafts, updatePodDraft } from '../podDraftStore';
import type { PodDraft } from '../types';

/**
 * The proof-of-delivery draft for one trip. Before the driver changes anything the draft isn't stored
 * yet (`hasDraft` is false) and starts with "Received by" filled with the trip's receiver.
 */
export function usePodDraft(tripId: string, receiverName = '') {
  const stored = useSyncExternalStore(subscribeToPodDrafts, () => getPodDraft(tripId));
  const draft = stored ?? createPodDraft(receiverName);

  function update(changes: Partial<PodDraft>) {
    updatePodDraft(tripId, changes, createPodDraft(receiverName));
  }

  function clear() {
    clearPodDraft(tripId);
  }

  return { draft, hasDraft: stored !== undefined, update, clear };
}
