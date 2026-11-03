import { useState } from 'react';

import { requestPasswordReset } from '../services/authApi';
import { validateEmail } from '../validation';
import { useCountdown } from './useCountdown';

/** Wait before the link can be sent again ("Send again in 0:45"). */
export const RESEND_DELAY_SECONDS = 45;

/** "Forgot your password?": send the reset link, then allow a resend after the countdown. */
export function useForgotPassword(initialEmail: string) {
  const [email, setEmailValue] = useState(initialEmail);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  /** True once a link was sent: shows the "Check your email" banner. */
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const countdown = useCountdown(RESEND_DELAY_SECONDS);

  const emailError = submitted ? validateEmail(email) : undefined;

  function setEmail(value: string) {
    setEmailValue(value);
    setSendError(null);
  }

  async function send() {
    setSubmitted(true);
    if (sending || countdown.running || validateEmail(email)) return;

    setSending(true);
    setSendError(null);
    try {
      await requestPasswordReset(email.trim());
      // Same result whether or not the account exists.
      setSent(true);
      countdown.start();
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return {
    email,
    setEmail,
    emailError,
    sending,
    sent,
    sendError,
    /** Seconds until "Send again" is allowed. */
    resendIn: countdown.remaining,
    send,
  };
}
