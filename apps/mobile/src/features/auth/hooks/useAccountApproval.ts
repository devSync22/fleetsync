import { useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { getPasswordChecks, validateNewPassword, type NewPasswordValues } from '@/lib/password';

import { activateAccount, getAccountApproval } from '../services/authApi';
import type { AccountApproval } from '../types';
import { hasErrors } from '../validation';

/** Loads the approved request and handles "Create your password" → "Activate account and sign in". */
export function useAccountApproval(requestId: string | undefined) {
  const { startSession } = useAuth();
  const [approval, setApproval] = useState<AccountApproval | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [values, setValues] = useState<NewPasswordValues>({ password: '', confirmPassword: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAccountApproval(requestId)
      .then((result) => {
        if (!cancelled) setApproval(result);
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Couldn’t load your account.');
      });
    return () => {
      cancelled = true;
    };
  }, [requestId, reloadKey]);

  function retry() {
    setLoadError(null);
    setReloadKey((key) => key + 1);
  }

  const errors = submitted ? validateNewPassword(values) : {};

  function setField(field: keyof NewPasswordValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setSubmitError(null);
  }

  async function activate() {
    setSubmitted(true);
    if (!approval || submitting || hasErrors(validateNewPassword(values))) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const session = await activateAccount({ requestId: approval.requestId, password: values.password });
      await startSession(session, { keepSignedIn: true });
      // The route guard now opens the driver or mechanic tabs.
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return {
    approval,
    isLoading: !approval && !loadError,
    loadError,
    retry,
    values,
    setField,
    errors,
    // New account: no previous password, so no "not the same as last" rule.
    passwordChecks: getPasswordChecks(values.password),
    submitting,
    submitError,
    activate,
  };
}
