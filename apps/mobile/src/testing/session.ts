import * as SecureStore from 'expo-secure-store';

import { setMockSignedInEmail } from '@/features/auth/mocks/authApiMock';
import { mockAccounts } from '@/features/auth/mocks/authMocks';
import type { AuthUser } from '@/features/auth/types';

/** Mock emails: Kasun (driver) and Ishara (mechanic). */
export const DRIVER_EMAIL = 'kasun.j@fleetms.lk';
export const MECHANIC_EMAIL = 'ishara.b@fleetms.lk';

/**
 * Tests only: saves a session for a mock account the way "Keep me signed in" does, so `<AuthProvider>`
 * starts signed in. Uses the mocked expo-secure-store from jest.setup.ts.
 */
export async function saveSessionFor(email: string): Promise<AuthUser> {
  const account = mockAccounts.find((candidate) => candidate.user.email === email);
  if (!account) throw new Error(`No mock account for ${email}`);
  await SecureStore.setItemAsync('fleetsync.auth.token', `test.${account.user.id}`);
  await SecureStore.setItemAsync('fleetsync.auth.refreshToken', `refresh.${account.user.id}`);
  // The mock change password acts for this user (the real API reads it from the access token).
  setMockSignedInEmail(email);
  await SecureStore.setItemAsync('fleetsync.auth.user', JSON.stringify(account.user));
  return account.user;
}
