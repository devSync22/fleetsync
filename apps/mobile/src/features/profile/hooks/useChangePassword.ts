import { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { getPasswordChecks, getPasswordStrength, validateNewPassword } from '@/lib/password';
import { ApiError } from '@/services/apiClient';

type Values = { current: string; password: string; confirmPassword: string };
type Errors = Partial<Record<keyof Values, string>>;

/**
 * Change password for a signed-in driver or mechanic. `onUpdated` gets the time of the change;
 * each role's route decides where to go next.
 */
export function useChangePassword(onUpdated: (changedAt: string) => void) {
  const { changePassword } = useAuth();
  const [values, setValues] = useState<Values>({ current: '', password: '', confirmPassword: '' });
  /** Passwords the server refused as "same as your current one". */
  const [rejected, setRejected] = useState<string[]>([]);
  const [wrongCurrent, setWrongCurrent] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Adds the "Not the same as your last password" rule, checked against the current password too.
  const policy = { previousPasswords: values.current ? [values.current, ...rejected] : rejected };

  function validate(): Errors {
    return {
      current: !values.current ? 'Enter your current password' : (wrongCurrent ?? undefined),
      ...validateNewPassword(values, policy),
    };
  }

  const errors = submitted ? validate() : {};

  function setField(field: keyof Values, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    if (field === 'current') setWrongCurrent(null);
    setSubmitError(null);
  }

  async function submit() {
    setSubmitted(true);
    if (submitting || Object.values(validate()).some(Boolean)) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await changePassword(values.current, values.password);
      onUpdated(new Date().toISOString());
    } catch (error) {
      // Matched on the API's stable error codes (see /api/auth/change-password).
      if (error instanceof ApiError && error.code === 'auth.wrong_current_password') {
        setWrongCurrent(error.message);
      } else if (error instanceof ApiError && error.code === 'auth.password_reused') {
        setRejected((previous) => [...previous, values.password]);
      } else {
        setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      }
      setSubmitting(false);
    }
  }

  return {
    values,
    setField,
    errors,
    passwordChecks: getPasswordChecks(values.password, policy),
    strength: getPasswordStrength(values.password),
    submitting,
    submitError,
    submit,
  };
}
