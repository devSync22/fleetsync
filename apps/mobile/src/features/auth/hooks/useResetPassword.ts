import { router } from 'expo-router';
import { useState } from 'react';

import {
  getPasswordChecks,
  getPasswordStrength,
  validateNewPassword,
  type NewPasswordValues,
} from '@/lib/password';

import { ResetLinkExpiredError, SamePasswordError, resetPassword } from '../services/authApi';
import { hasErrors } from '../validation';

/** Sign-in shows "Password updated. Sign in with your new password." when it gets this notice. */
export const PASSWORD_UPDATED_NOTICE = 'password-updated';

/** "Set a new password" from the emailed reset link. */
export function useResetPassword(token: string | undefined) {
  const [values, setValues] = useState<NewPasswordValues>({ password: '', confirmPassword: '' });
  /** Passwords the server refused as "same as your last password". */
  const [previousPasswords, setPreviousPasswords] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [linkExpired, setLinkExpired] = useState(!token);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const policy = { previousPasswords };
  const errors = submitted ? validateNewPassword(values, policy) : {};

  function setField(field: keyof NewPasswordValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setSubmitError(null);
  }

  async function submit() {
    setSubmitted(true);
    if (!token || submitting || hasErrors(validateNewPassword(values, policy))) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await resetPassword(token, values.password);
      router.dismissTo({ pathname: '/sign-in', params: { notice: PASSWORD_UPDATED_NOTICE } });
    } catch (error) {
      if (error instanceof ResetLinkExpiredError) {
        setLinkExpired(true);
      } else if (error instanceof SamePasswordError) {
        // Turns the "Not the same as your last password" rule red until the password changes.
        setPreviousPasswords((current) => [...current, values.password]);
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
    linkExpired,
    submitting,
    submitError,
    submit,
  };
}
