import type { PickedPhoto } from '@/hooks/usePhotoPicker';

import { daysUntil, isLicenceExpiring, LICENCE_WARNING_DAYS, parseTypedDate, validateRenewal } from './licence';

const now = new Date(2026, 10, 16, 8, 0); // Mon 16 Nov 2026, 08:00
const photo = { uri: 'file:///licence.jpg' } as PickedPhoto;
const bothSides = [photo, photo];
const CURRENT_EXPIRY = '2026-11-30';

describe('licence expiry window', () => {
  it('counts whole days from today', () => {
    expect(daysUntil('2026-11-16', now)).toBe(0);
    expect(daysUntil('2026-11-17', now)).toBe(1);
    expect(daysUntil('2026-11-15', now)).toBe(-1);
  });

  it(`warns exactly ${LICENCE_WARNING_DAYS} days before expiry`, () => {
    expect(isLicenceExpiring('2026-12-16', now)).toBe(true);
  });

  it('does not warn 31 days before expiry', () => {
    expect(isLicenceExpiring('2026-12-17', now)).toBe(false);
  });

  it('warns when the licence has already expired', () => {
    expect(isLicenceExpiring('2026-11-01', now)).toBe(true);
  });
});

describe('parseTypedDate', () => {
  it('turns DD/MM/YYYY into an ISO date', () => {
    expect(parseTypedDate('18/11/2034')).toBe('2034-11-18');
  });

  it('rejects dates that do not exist', () => {
    expect(parseTypedDate('31/02/2030')).toBeNull();
  });

  it('rejects other formats', () => {
    expect(parseTypedDate('2034-11-18')).toBeNull();
    expect(parseTypedDate('18/11/34')).toBeNull();
  });
});

describe('validateRenewal (renewal date and photos)', () => {
  it('needs photos of the front and back', () => {
    expect(validateRenewal([photo], '18/11/2034', CURRENT_EXPIRY, now).photos).toBe(
      'Add photos of the front and back of your licence',
    );
  });

  it('needs an expiry date', () => {
    expect(validateRenewal(bothSides, ' ', CURRENT_EXPIRY, now).expiry).toBe('Enter the expiry date from your new licence');
  });

  it('rejects a date that is not real', () => {
    expect(validateRenewal(bothSides, '31/02/2034', CURRENT_EXPIRY, now).expiry).toBe(
      'Enter a real date as DD/MM/YYYY, e.g. 18/11/2034',
    );
  });

  it('rejects today or a past date', () => {
    expect(validateRenewal(bothSides, '16/11/2026', CURRENT_EXPIRY, now).expiry).toBe('The expiry date must be in the future');
  });

  it('rejects a date not later than the current expiry', () => {
    expect(validateRenewal(bothSides, '30/11/2026', CURRENT_EXPIRY, now).expiry).toMatch(/^Must be later than your current expiry/);
  });

  it('accepts two photos and a later expiry date', () => {
    expect(validateRenewal(bothSides, '18/11/2034', CURRENT_EXPIRY, now)).toEqual({ photos: undefined, expiry: undefined });
  });
});
