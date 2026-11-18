import { ApiError } from '@/services/apiClient';

import { LOCKOUT_MINUTES, MAX_SIGN_IN_ATTEMPTS } from '../constants';
import {
  APPROVED_BY,
  APPROVED_DEPOT,
  FIRST_REQUEST_NUMBER,
  NEXT_STAFF_IDS,
  REQUEST_ID_PREFIX,
  STAFF_EMAIL_DOMAIN,
  mockAccounts,
  mockApproval,
  mockResetTokens,
} from './authMocks';
import type {
  AccountApproval,
  AccountRequest,
  AccountRequestForm,
  ActivateAccountInput,
  AuthUser,
  Session,
  SignInCredentials,
} from '../types';

/**
 * TEST DOUBLE for `services/authApi.ts`: the same exported functions, backed by in-memory mock
 * accounts instead of the API. Jest tests swap it in with
 * `jest.mock('@/features/auth/services/authApi', () => jest.requireActual('@/features/auth/mocks/authApiMock'))`.
 * The app itself always uses the real service.
 */

/** Wrong email or password. `attemptsLeft` drives the "2 attempts left" helper. */
export class InvalidCredentialsError extends ApiError {
  readonly attemptsLeft: number | null;

  constructor(attemptsLeft: number) {
    super('Incorrect email or password', 401, 'auth.invalid_credentials');
    this.name = 'InvalidCredentialsError';
    this.attemptsLeft = attemptsLeft;
  }
}

/** Too many failed attempts. */
export class AccountLockedError extends ApiError {
  constructor() {
    super(`Too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.`, 423, 'auth.locked_out');
    this.name = 'AccountLockedError';
  }
}

/** The reset link is invalid, expired (30 minutes) or already used. */
export class ResetLinkExpiredError extends ApiError {
  constructor() {
    super('This reset link has expired or was already used. Reset links work for 30 minutes.', 400, 'auth.invalid_token');
    this.name = 'ResetLinkExpiredError';
  }
}

/** The new password is the same as the current one ("Not the same as your last password"). */
export class SamePasswordError extends ApiError {
  constructor() {
    super('Choose a password that’s different from your last one.', 400, 'auth.password_reused');
    this.name = 'SamePasswordError';
  }
}

/** Change password: the current password is wrong. */
export class WrongCurrentPasswordError extends ApiError {
  constructor() {
    super('Your current password is incorrect.', 400, 'auth.wrong_current_password');
    this.name = 'WrongCurrentPasswordError';
  }
}

const MOCK_LATENCY_MS = 700;

function delay(ms = MOCK_LATENCY_MS) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function createToken(user: AuthUser) {
  return `mock.${user.id}.${Date.now()}`;
}

// In-memory mock state (resets when the app reloads).
const failedAttempts = new Map<string, number>();
const lockedUntil = new Map<string, number>();
const submittedRequests = new Map<string, AccountRequest>();
let nextRequestNumber = FIRST_REQUEST_NUMBER;
/** Signed-in user for the mock change password (the real API reads it from the access token). */
let mockSignedInEmail: string | null = null;
const initialAccounts = mockAccounts.map((account) => ({ ...account }));

/** Tests only: puts the in-memory mock state back to how the app starts. */
export function resetAuthMocks() {
  failedAttempts.clear();
  lockedUntil.clear();
  submittedRequests.clear();
  nextRequestNumber = FIRST_REQUEST_NUMBER;
  mockSignedInEmail = null;
  mockAccounts.splice(0, mockAccounts.length, ...initialAccounts.map((account) => ({ ...account })));
}

export async function signIn(credentials: SignInCredentials, _keepSignedIn = false): Promise<Session> {
  await delay();
  const email = credentials.email.trim().toLowerCase();

  const lockEnd = lockedUntil.get(email);
  if (lockEnd && lockEnd > Date.now()) {
    throw new AccountLockedError();
  }

  const account = mockAccounts.find((candidate) => candidate.user.email === email);
  if (!account || account.password !== credentials.password) {
    const attempts = (failedAttempts.get(email) ?? 0) + 1;
    if (attempts >= MAX_SIGN_IN_ATTEMPTS) {
      failedAttempts.delete(email);
      lockedUntil.set(email, Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      throw new AccountLockedError();
    }
    failedAttempts.set(email, attempts);
    throw new InvalidCredentialsError(MAX_SIGN_IN_ATTEMPTS - attempts);
  }

  failedAttempts.delete(email);
  lockedUntil.delete(email);
  mockSignedInEmail = email;
  return { token: createToken(account.user), refreshToken: `refresh.${account.user.id}`, user: account.user };
}

/** Mock refresh: any refresh token for a mock account gives a new session. */
export async function refreshSession(refreshToken: string): Promise<Session> {
  const account = mockAccounts.find((candidate) => refreshToken === `refresh.${candidate.user.id}`);
  if (!account) throw new ApiError('Your session has ended. Please sign in again.', 401, 'auth.invalid_refresh_token');
  return { token: createToken(account.user), refreshToken, user: account.user };
}

/** Mock sign-out: nothing to end on a server. */
export async function signOut(_refreshToken: string | null): Promise<void> {}

export async function requestAccount(form: AccountRequestForm): Promise<AccountRequest> {
  await delay();
  if (!form.role) {
    throw new ApiError('Choose Driver or Mechanic.', 400);
  }

  const requestId = `${REQUEST_ID_PREFIX}${String(nextRequestNumber).padStart(4, '0')}`;
  nextRequestNumber += 1;

  const request: AccountRequest = {
    requestId,
    role: form.role,
    fullName: form.fullName.trim().replace(/\s+/g, ' '),
    sentAt: new Date().toISOString(),
  };
  submittedRequests.set(requestId, request);
  return request;
}

/** "Tharindu Wijesinghe" → "tharindu.w@fms.lk", as in the "Account approved" frame. */
function staffEmail(fullName: string) {
  const [first = '', ...rest] = fullName.toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter(Boolean);
  const lastInitial = rest.at(-1)?.[0];
  return `${first}${lastInitial ? `.${lastInitial}` : ''}@${STAFF_EMAIL_DOMAIN}`;
}

/**
 * The approval behind the link in the approval email. In the mock, a request sent in this
 * session is approved straight away; otherwise the approval from the Figma frame is returned.
 */
export async function getAccountApproval(requestId: string | undefined): Promise<AccountApproval> {
  await delay(400);
  const request = requestId ? submittedRequests.get(requestId) : undefined;
  if (!request) {
    return mockApproval;
  }

  const now = new Date().toISOString();
  return {
    requestId: request.requestId,
    role: request.role,
    fullName: request.fullName,
    staffId: NEXT_STAFF_IDS[request.role],
    depot: APPROVED_DEPOT,
    signInEmail: staffEmail(request.fullName),
    approvedBy: APPROVED_BY,
    sentAt: request.sentAt,
    reviewedAt: now,
    approvedAt: now,
  };
}

/** Sets the first password for an approved account and signs the new user in. */
export async function activateAccount({ requestId, password }: ActivateAccountInput): Promise<Session> {
  const approval = await getAccountApproval(requestId);
  await delay();

  const user: AuthUser = {
    id: `usr-${approval.staffId.toLowerCase()}`,
    name: approval.fullName,
    role: approval.role,
    staffId: approval.staffId,
    email: approval.signInEmail,
    depot: approval.depot,
  };

  // Let the new account sign in again later in this session.
  const existing = mockAccounts.find((account) => account.user.email === user.email);
  if (existing) {
    existing.password = password;
  } else {
    mockAccounts.push({ user, password });
  }

  return { token: createToken(user), refreshToken: `refresh.${user.id}`, user };
}

/**
 * Sends a reset link to `email`. Resolves the same way whether or not an account exists,
 * so the screen can't reveal which emails are registered.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await delay();
  // Mock: nothing is sent. The real API emails a link to `email` if the account exists.
  void email;
}

/** Sets a new password using the token from the reset link. */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await delay();
  const email = mockResetTokens[token];
  const account = email ? mockAccounts.find((candidate) => candidate.user.email === email) : undefined;
  if (!account) {
    throw new ResetLinkExpiredError();
  }
  if (account.password === newPassword) {
    throw new SamePasswordError();
  }
  account.password = newPassword;
  // Mock: the demo token stays valid so the flow can be tested again.
}

/** Tests only: who `changePassword` acts for. */
export function setMockSignedInEmail(email: string | null) {
  mockSignedInEmail = email;
}

/** Change password while signed in. Mock: checks and updates the in-memory account, returns a new session. */
export async function changePassword(currentPassword: string, newPassword: string, _keepSignedIn: boolean): Promise<Session> {
  await delay();
  const account = mockAccounts.find((candidate) => candidate.user.email === mockSignedInEmail);
  if (!account || account.password !== currentPassword) {
    throw new WrongCurrentPasswordError();
  }
  if (account.password === newPassword) {
    throw new SamePasswordError();
  }
  account.password = newPassword;
  return { token: createToken(account.user), refreshToken: `refresh.${account.user.id}`, user: account.user };
}
