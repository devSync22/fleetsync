import { validateHandedOverBy, validateSealNumber, validateStartOdometer } from './validation';

const LAST_KM = 84_210;

describe('validateStartOdometer', () => {
  it('asks for a reading when empty', () => {
    expect(validateStartOdometer('', LAST_KM)).toBe('Enter the starting odometer reading.');
  });

  it('rejects zero', () => {
    expect(validateStartOdometer('0', LAST_KM)).toBe('Enter the reading as a whole number of km.');
  });

  it('rejects a reading below the vehicle’s last recorded reading', () => {
    expect(validateStartOdometer('84209', LAST_KM)).toMatch(/^Must be at least .*last recorded reading\.$/);
  });

  it('accepts the same reading as the last one', () => {
    expect(validateStartOdometer('84210', LAST_KM)).toBeUndefined();
  });

  it('accepts a higher reading', () => {
    expect(validateStartOdometer('84250', LAST_KM)).toBeUndefined();
  });
});

describe('validateHandedOverBy', () => {
  it('is required', () => {
    expect(validateHandedOverBy('   ')).toBe('Enter who handed over the cargo.');
  });

  it('needs at least two characters', () => {
    expect(validateHandedOverBy('A')).toBe('Enter their full name.');
  });

  it('accepts a name', () => {
    expect(validateHandedOverBy('Sunil Fernando')).toBeUndefined();
  });
});

describe('validateSealNumber', () => {
  it('is optional', () => {
    expect(validateSealNumber('')).toBeUndefined();
  });

  it('accepts letters, digits and dashes', () => {
    expect(validateSealNumber('SL-20441')).toBeUndefined();
  });

  it('rejects other characters', () => {
    expect(validateSealNumber('SL 20441!')).toBe('Use letters, numbers and dashes only.');
  });
});
