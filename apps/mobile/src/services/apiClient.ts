import { create, isAxiosError, type InternalAxiosRequestConfig } from 'axios';

/** Error shape every service call rejects with, so screens only handle one type. */
export class ApiError extends Error {
  readonly status: number | null;
  /** The API's stable `errorCode` (e.g. "auth.invalid_credentials"), when it sent one. */
  readonly code: string | null;
  /** Extra ProblemDetails fields (e.g. `attemptsLeft`, `errors`). */
  readonly extensions: Record<string, unknown>;

  constructor(message: string, status: number | null = null, code: string | null = null, extensions: Record<string, unknown> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.extensions = extensions;
  }
}

/**
 * The one axios instance for the app. Feature services import this — never `axios` directly.
 * The base URL comes from `EXPO_PUBLIC_API_BASE_URL` (see `.env.example`), e.g. "http://192.168.1.10:5215/api".
 * On a phone running Expo Go, `localhost` is the phone itself — use your computer's LAN IP.
 *
 * `X-Client-Type: mobile` tells the API to return the refresh token in the JSON body
 * (browsers get it as an HttpOnly cookie instead).
 */
export const apiClient = create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json', 'X-Client-Type': 'mobile' },
});

let getAccessToken: () => string | null = () => null;

/** Called by the auth layer, so requests carry the signed-in user's token. */
export function setAccessTokenGetter(getter: () => string | null) {
  getAccessToken = getter;
}

/**
 * Refreshes the session when the API answers 401; resolves to the new access token,
 * or null when the session is over (the auth layer then signs the user out).
 */
type RefreshHandler = () => Promise<string | null>;
let refreshHandler: RefreshHandler | null = null;
let refreshInFlight: Promise<string | null> | null = null;

/** Set by AuthContext; `null` turns automatic refresh off. */
export function setRefreshHandler(handler: RefreshHandler | null) {
  refreshHandler = handler;
}

/**
 * Runs one refresh at a time: requests that fail together share it. This matters
 * because refresh tokens are single-use — a second refresh with the same token
 * would look like theft to the API and end the session.
 */
function runSingleRefresh(handler: RefreshHandler) {
  refreshInFlight ??= handler().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

/** Auth calls that must never trigger a refresh (they are the sign-in / refresh themselves). */
const NO_REFRESH_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout'];

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error)) {
      return Promise.reject(new ApiError('Something went wrong. Please try again.'));
    }
    if (!error.response) {
      return Promise.reject(new ApiError('Check your connection and try again.'));
    }

    // Access token expired: refresh once, then retry the original request with the new token.
    const config = error.config as RetriableConfig | undefined;
    const path = config?.url ?? '';
    if (
      error.response.status === 401 &&
      config &&
      !config._retried &&
      refreshHandler &&
      getAccessToken() &&
      !NO_REFRESH_PATHS.some((noRefresh) => path.endsWith(noRefresh))
    ) {
      config._retried = true;
      const token = await runSingleRefresh(refreshHandler);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        return apiClient.request(config);
      }
    }

    // ASP.NET Core returns ProblemDetails: { title, detail, status, errorCode, ...extensions }
    const data = (error.response.data ?? {}) as Record<string, unknown>;
    const detail = typeof data.detail === 'string' ? data.detail : undefined;
    const title = typeof data.title === 'string' ? data.title : undefined;
    const code = typeof data.errorCode === 'string' ? data.errorCode : null;
    const message = detail ?? title ?? 'Something went wrong. Please try again.';
    return Promise.reject(new ApiError(message, error.response.status, code, data));
  },
);
