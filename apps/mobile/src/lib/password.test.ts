import { getPasswordChecks, getPasswordStrength, meetsPasswordPolicy, validateNewPassword } from './password';

const metRules = (password: string, previousPasswords?: string[]) =>
  getPasswordChecks(password, { previousPasswords })
    .filter((check) => check.met)
    .map((check) => check.id);

describe('password rules', () => {
  it('lists length, case and number rules in display order', () => {
    expect(getPasswordChecks('').map((check) => check.id)).toEqual(['length', 'case', 'number']);
  });

  it('needs at least 8 characters', () => {
    expect(metRules('Abcdef1')).not.toContain('length');
    expect(metRules('Abcdefg1')).toContain('length');
  });

  it('needs both an uppercase and a lowercase letter', () => {
    expect(metRules('abcdefg1')).not.toContain('case');
    expect(metRules('ABCDEFG1')).not.toContain('case');
    expect(metRules('Abcdefg1')).toContain('case');
  });

  it('needs a number', () => {
    expect(metRules('Abcdefgh')).not.toContain('number');
  });

  it('adds "Not the same as your last password" only when previous passwords are given', () => {
    expect(getPasswordChecks('FleetSync1').some((check) => check.id === 'notPrevious')).toBe(false);
    expect(metRules('FleetSync1', ['FleetSync1'])).not.toContain('notPrevious');
    expect(metRules('FleetSync2', ['FleetSync1'])).toContain('notPrevious');
  });

  it('meets the policy only when every rule is met', () => {
    expect(meetsPasswordPolicy('FleetSync1')).toBe(true);
    expect(meetsPasswordPolicy('fleetsync1')).toBe(false);
    expect(meetsPasswordPolicy('FleetSync1', { previousPasswords: ['FleetSync1'] })).toBe(false);
  });
});

describe('getPasswordStrength', () => {
  it.each([
    ['', 0, null, null],
    ['abc', 1, 'Weak password', 'danger'],
    ['abcdefgh', 1, 'Weak password', 'danger'],
    ['Abcdefgh', 2, 'Fair password', 'pending'],
    ['Abcdefg1', 3, 'Strong password', 'success'],
    ['Abcdefg1!', 4, 'Very strong password', 'success'],
    ['Abcdefghijk1', 4, 'Very strong password', 'success'],
  ])('"%s" scores %d', (password, score, label, tone) => {
    expect(getPasswordStrength(password)).toEqual({ score, label, tone });
  });
});

describe('validateNewPassword', () => {
  it('asks for both fields when empty', () => {
    expect(validateNewPassword({ password: '', confirmPassword: '' })).toEqual({
      password: 'Create a password',
      confirmPassword: 'Enter the password again',
    });
  });

  it('points to the rules when the password is too weak', () => {
    expect(validateNewPassword({ password: 'abc', confirmPassword: 'abc' }).password).toBe(
      'Your password must meet all the rules below',
    );
  });

  it('reports a mismatch', () => {
    expect(validateNewPassword({ password: 'FleetSync1', confirmPassword: 'FleetSync2' }).confirmPassword).toBe(
      'Passwords don’t match',
    );
  });

  it('has no errors for a valid, matching password', () => {
    expect(validateNewPassword({ password: 'FleetSync1', confirmPassword: 'FleetSync1' })).toEqual({
      password: undefined,
      confirmPassword: undefined,
    });
  });
});
