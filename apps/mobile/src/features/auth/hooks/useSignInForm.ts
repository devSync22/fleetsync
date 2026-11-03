import { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';

import { LOCKOUT_MINUTES, MAX_SIGN_IN_ATTEMPTS } from '../constants';
import { AccountLockedError, InvalidCredentialsError } from '../services/authApi';
import type { SignInCredentials } from '../types';
import { hasErrors, validateSignIn } from '../validation';

export type FormBanner = {
  title: string;
  message: string;
};

/** Sign-in form state, validation and submit. Navigation happens in the root layout's route guards. */
export function useSignInForm() {
  const { signIn } = useAuth();
  const [values, setValues] = useState<SignInCredentials>({ email: '', password: '' });
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<FormBanner | null>(null);
  /** "2 attempts left" under the password after a wrong password. */
  const [passwordHint, setPasswordHint] = useState<string | undefined>();

  const errors = submitted ? validateSignIn(values) : {};

  function setField(field: keyof SignInCredentials, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setBanner(null);
    setPasswordHint(undefined);
  }

  async function submit() {
    setSubmitted(true);
    if (submitting || hasErrors(validateSignIn(values))) return;

    setSubmitting(true);
    setBanner(null);
    setPasswordHint(undefined);
    try {
      await signIn({ email: values.email.trim(), password: values.password }, { keepSignedIn });
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        setBanner({
          title: 'Incorrect email or password',
          message: `Check your details and try again. After ${MAX_SIGN_IN_ATTEMPTS} failed attempts the account is locked for ${LOCKOUT_MINUTES} minutes.`,
        });
        setPasswordHint(`${error.attemptsLeft} ${error.attemptsLeft === 1 ? 'attempt' : 'attempts'} left`);
      } else if (error instanceof AccountLockedError) {
        setBanner({ title: 'Account locked', message: error.message });
      } else {
        setBanner({
          title: 'Couldn’t sign in',
          message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        });
      }
      setSubmitting(false);
    }
    // On success the route guard swaps the screen, so `submitting` stays true until unmount.
  }

  return {
    values,
    setField,
    keepSignedIn,
    setKeepSignedIn,
    errors: { ...errors, password: errors.password ?? passwordHint },
    passwordInvalid: Boolean(errors.password ?? passwordHint),
    banner,
    submitting,
    submit,
  };
}
