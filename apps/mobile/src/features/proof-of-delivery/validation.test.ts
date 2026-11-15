import { createPodDraft } from './podDraftStore';
import { isPodDetailsValid, validateEndOdometer, validateRecipientName } from './validation';

const START_KM = 84_215;

describe('validateEndOdometer', () => {
  it('asks for a reading when empty', () => {
    expect(validateEndOdometer('', START_KM)).toBe('Enter the ending odometer reading.');
  });

  it('rejects the same reading as when the trip started', () => {
    expect(validateEndOdometer('84215', START_KM)).toMatch(/^Must be more than .*when the trip started\.$/);
  });

  it('rejects a lower reading than when the trip started', () => {
    expect(validateEndOdometer('84000', START_KM)).toMatch(/^Must be more than/);
  });

  it('accepts a reading higher than the start', () => {
    expect(validateEndOdometer('84251', START_KM)).toBeUndefined();
  });

  it('accepts any whole reading when the start reading is unknown', () => {
    expect(validateEndOdometer('100', undefined)).toBeUndefined();
  });
});

describe('Proof of delivery required fields', () => {
  it('needs the receiver’s name', () => {
    expect(validateRecipientName('')).toBe('Enter the name of the person who received the cargo.');
    expect(isPodDetailsValid(createPodDraft(''))).toBe(false);
  });

  it('needs at least two characters in the name', () => {
    expect(isPodDetailsValid(createPodDraft('P'))).toBe(false);
  });

  it('is valid with a name; photos, signature and notes are optional', () => {
    expect(isPodDetailsValid(createPodDraft('Pradeep Kumara'))).toBe(true);
  });
});
