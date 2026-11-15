import { fireEvent, renderRouter, screen, testRouter } from 'expo-router/testing-library';

import { MOCK_PASSWORD } from '@/features/auth/mocks/authMocks';
import { resetAuthMocks } from '@/features/auth/services/authApi';
import { DRIVER_EMAIL, saveSessionFor } from '@/testing/session';

// Real navigation over the real `src/app` routes, so "back to Profile with the banner" is the app's own route.
jest.unmock('expo-router');
jest.mock('expo-font', () => ({ ...jest.requireActual('expo-font'), useFonts: () => [true, null] }));

/** Kasun signed in, on Profile, then opens Change password. */
async function openChangePassword() {
  await saveSessionFor(DRIVER_EMAIL);
  const app = await renderRouter('src/app', { initialUrl: '/driver/profile' });
  await screen.findByRole('header', { name: 'Profile' });
  await testRouter.push('/driver/profile/change-password');
  await screen.findByLabelText('Current password');
  return app;
}

async function submit(current: string, password: string) {
  await fireEvent.changeText(screen.getByLabelText('Current password'), current);
  await fireEvent.changeText(screen.getByLabelText('New password'), password);
  await fireEvent.changeText(screen.getByLabelText('Confirm new password'), password);
  // The press waits for the mock service's delay; renderRouter uses fake timers, so move the clock past it.
  const pressed = fireEvent.press(screen.getByRole('button', { name: 'Update password' }));
  await jest.advanceTimersByTimeAsync(1000);
  await pressed;
}

beforeEach(() => resetAuthMocks());
afterEach(() => jest.useRealTimers());

describe('Change password', () => {
  it('shows an error and stays on the screen for a wrong current password', async () => {
    const app = await openChangePassword();
    await submit('NotMyPass1', 'NewFleet22');

    expect(await screen.findByText('Your current password is incorrect.')).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/driver/profile/change-password');
  });

  it('returns to Profile with the "Password updated" banner on success', async () => {
    const app = await openChangePassword();
    await submit(MOCK_PASSWORD, 'NewFleet22');

    expect(await screen.findByText('Password updated')).toBeOnTheScreen();
    expect(screen.getByText('You are still signed in on this phone. Other devices were signed out.')).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/driver/profile');
  });
});
