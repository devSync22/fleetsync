import { router } from 'expo-router';
import { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import type { PickedPhoto } from '@/hooks/usePhotoPicker';

import { parseTypedDate, validateRenewal } from '../licence';
import { submitLicenceRenewal } from '../services/profileService';

/** "Upload renewed licence" form: front + back photos and the new expiry date (DD/MM/YYYY). */
export function useRenewLicence(currentExpiresOn: string) {
  const userId = useAuth().user?.id ?? '';
  const [photos, setPhotosState] = useState<PickedPhoto[]>([]);
  const [expiry, setExpiryState] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const errors = submitted ? validateRenewal(photos, expiry, currentExpiresOn) : {};

  function setPhotos(next: PickedPhoto[]) {
    setPhotosState(next);
    setSubmitError(null);
  }

  function setExpiry(next: string) {
    setExpiryState(next);
    setSubmitError(null);
  }

  async function submit() {
    setSubmitted(true);
    const current = validateRenewal(photos, expiry, currentExpiresOn);
    const newExpiresOn = parseTypedDate(expiry);
    if (submitting || current.photos || current.expiry || !newExpiresOn) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitLicenceRenewal(userId, { photos, newExpiresOn });
      // Profile reloads on focus and shows the "sent for review" state.
      router.back();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return { photos, setPhotos, expiry, setExpiry, errors, submitting, submitError, submit };
}
