/**
 * Password policy shared by Account approved, Reset password and (later) Change password.
 * Rules and wording from the Figma "Auth — Set new password" frame.
 */

export const PASSWORD_MIN_LENGTH = 8;

export type PasswordRuleId = 'length' | 'case' | 'number' | 'notPrevious';

export type PasswordCheck = {
  id: PasswordRuleId;
  label: string;
  met: boolean;
};

export type PasswordPolicyOptions = {
  /**
   * Passwords the new one must differ from. Pass this (even as an empty list) on screens that
   * replace an existing password: it adds the "Not the same as your last password" rule.
   * Reset password fills it with passwords the server rejected as "same as last";
   * Change password can also pass the current password.
   */
  previousPasswords?: readonly string[];
};

const hasUpperAndLower = (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value);
const hasNumber = (value: string) => /\d/.test(value);

/** Every rule with whether `password` meets it, in display order. */
export function getPasswordChecks(password: string, options: PasswordPolicyOptions = {}): PasswordCheck[] {
  const checks: PasswordCheck[] = [
    { id: 'length', label: `At least ${PASSWORD_MIN_LENGTH} characters`, met: password.length >= PASSWORD_MIN_LENGTH },
    { id: 'case', label: 'One uppercase and one lowercase letter', met: hasUpperAndLower(password) },
    { id: 'number', label: 'At least one number', met: hasNumber(password) },
  ];
  if (options.previousPasswords) {
    checks.push({
      id: 'notPrevious',
      label: 'Not the same as your last password',
      met: password.length > 0 && !options.previousPasswords.includes(password),
    });
  }
  return checks;
}

export function meetsPasswordPolicy(password: string, options: PasswordPolicyOptions = {}): boolean {
  return getPasswordChecks(password, options).every((check) => check.met);
}

export type PasswordStrengthTone = 'danger' | 'pending' | 'success';

export type PasswordStrength = {
  /** Filled segments of the 4-segment bar (0 = empty password). */
  score: 0 | 1 | 2 | 3 | 4;
  label: string | null;
  tone: PasswordStrengthTone | null;
};

/**
 * One point each for: 8+ characters, upper + lower case, a number, and 12+ characters or a symbol.
 * Three points is "Strong password" (as in the Figma frame), four is "Very strong password".
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: null, tone: null };
  }
  const points = [
    password.length >= PASSWORD_MIN_LENGTH,
    hasUpperAndLower(password),
    hasNumber(password),
    password.length >= 12 || /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const score = Math.max(1, points) as 1 | 2 | 3 | 4;

  switch (score) {
    case 1:
      return { score, label: 'Weak password', tone: 'danger' };
    case 2:
      return { score, label: 'Fair password', tone: 'pending' };
    case 3:
      return { score, label: 'Strong password', tone: 'success' };
    default:
      return { score, label: 'Very strong password', tone: 'success' };
  }
}

export type NewPasswordValues = {
  password: string;
  confirmPassword: string;
};

export type NewPasswordErrors = Partial<Record<keyof NewPasswordValues, string>>;

/** Inline errors for a "new password + confirm" pair. */
export function validateNewPassword(
  values: NewPasswordValues,
  options: PasswordPolicyOptions = {},
): NewPasswordErrors {
  return {
    password: !values.password
      ? 'Create a password'
      : !meetsPasswordPolicy(values.password, options)
        ? 'Your password must meet all the rules below'
        : undefined,
    confirmPassword: !values.confirmPassword
      ? 'Enter the password again'
      : values.confirmPassword !== values.password
        ? 'Passwords don’t match'
        : undefined,
  };
}
