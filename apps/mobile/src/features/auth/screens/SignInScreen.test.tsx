import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { DRIVER_EMAIL, MECHANIC_EMAIL } from '@/testing/session';

import { MOCK_PASSWORD } from '../mocks/authMocks';
import { resetAuthMocks } from '../services/authApi';

// Real navigation over the real `src/app` routes: the root layout's guards decide where a user lands.
jest.unmock('expo-router');
jest.mock('expo-font', () => ({ ...jest.requireActual('expo-font'), useFonts: () => [true, null] }));

async function renderSignIn() {
  const app = await renderRouter('src/app', { initialUrl: '/' });
  await screen.findByLabelText('Email address');
  return app;
}

async function signIn(email: string, password: string) {
  await fireEvent.changeText(screen.getByLabelText('Email address'), email);
  await fireEvent.changeText(screen.getByLabelText('Password'), password);
  // The press waits for the mock service's delay, so move the (fake) clock past it.
  const pressed = fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
  await jest.advanceTimersByTimeAsync(1000);
  await pressed;
}

// renderRouter switches Jest to fake timers itself.
beforeEach(() => resetAuthMocks());
afterEach(() => jest.useRealTimers());

describe('Sign in', () => {
  it('opens on Sign in when signed out', async () => {
    const app = await renderSignIn();
    expect(app.getPathname()).toBe('/sign-in');
  });

  it('takes a driver to the driver tabs', async () => {
    const app = await renderSignIn();
    await signIn(DRIVER_EMAIL, MOCK_PASSWORD);

    expect(await screen.findByText(/^Good (morning|afternoon|evening), Kasun$/)).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/driver/home');
  });

  it('takes a mechanic to the mechanic tabs', async () => {
    const app = await renderSignIn();
    await signIn(MECHANIC_EMAIL, MOCK_PASSWORD);

    expect(await screen.findByText('Maintenance queue')).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/mechanic/queue');
  });

  it('shows an error and stays on Sign in for a wrong password', async () => {
    const app = await renderSignIn();
    await signIn(DRIVER_EMAIL, 'WrongPass1');

    expect(await screen.findByText('Incorrect email or password')).toBeOnTheScreen();
    expect(screen.getByText(/attempts left$/)).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/sign-in');
  });
});
