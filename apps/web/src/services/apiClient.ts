import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

/**
 * The one axios instance for the whole app. Every feature's `services/*Api.ts`
 * file calls the API through it; nothing else imports axios.
 *
 * - Base URL from VITE_API_BASE_URL ("/api" in development, through the Vite proxy).
 * - `withCredentials` so the browser sends the HttpOnly refresh cookie (path /api/auth).
 * - Adds the in-memory access token as a Bearer header.
 * - On a 401, refreshes the session once and retries the request.
 * - Turns every failure into an `ApiError` with the backend's `errorCode`.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  withCredentials: true,
})

// ---- Access token -----------------------------------------------------------

// Kept in memory only (never localStorage), so a script injected into the page can't read it later.
let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// ---- Session refresh --------------------------------------------------------

/** Called on a 401 to get a fresh access token; registered by AuthContext. Returns null when signed out. */
type RefreshHandler = () => Promise<string | null>

let refreshHandler: RefreshHandler | null = null
let refreshInFlight: Promise<string | null> | null = null

export function setRefreshHandler(handler: RefreshHandler | null) {
  refreshHandler = handler
}

/**
 * Runs `refresh` at most once at a time: concurrent callers share the same
 * promise. The backend rotates refresh tokens and treats a reused one as
 * stolen (ending the session), so two parallel refreshes must never happen.
 */
export function runSingleRefresh(refresh: () => Promise<string | null>): Promise<string | null> {
  refreshInFlight ??= refresh().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

/** Endpoints where a 401 is an answer (wrong password, expired session), not a reason to refresh. */
const NO_RETRY_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout']

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const config = error.config as RetriableConfig | undefined
      const isAuthEndpoint = NO_RETRY_PATHS.some((path) => config?.url?.startsWith(path))

      if (error.response?.status === 401 && config && !config._retried && !isAuthEndpoint && refreshHandler) {
        config._retried = true
        const token = await runSingleRefresh(refreshHandler)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          return apiClient(config)
        }
      }
    }

    throw toApiError(error)
  },
)

// ---- Errors -------------------------------------------------------------------

/** RFC 9457 ProblemDetails as the FleetSync API sends it. */
type ProblemDetails = {
  title?: string
  detail?: string
  status?: number
  errorCode?: string
  traceId?: string
  /** Field errors from validation (`validation_failed`), keyed by camelCase field name. */
  errors?: Record<string, string[]>
  [extension: string]: unknown
}

/**
 * A failed API call. `errorCode` is the backend's stable code (e.g.
 * "auth.invalid_credentials"); screens switch on it rather than on text.
 * Network failures have status 0 and errorCode "network_error".
 */
export class ApiError extends Error {
  readonly status: number
  readonly errorCode: string
  readonly title: string
  readonly detail: string
  readonly fieldErrors: Record<string, string[]>
  readonly extensions: Record<string, unknown>

  constructor(status: number, problem: ProblemDetails) {
    super(problem.detail ?? problem.title ?? 'Request failed')
    this.name = 'ApiError'
    this.status = status
    this.errorCode = problem.errorCode ?? (status === 0 ? 'network_error' : 'unknown_error')
    this.title = problem.title ?? 'Something went wrong'
    this.detail = problem.detail ?? 'Please try again.'
    this.fieldErrors = problem.errors ?? {}
    this.extensions = problem
  }

  /** The first message for a field, e.g. `fieldError('email')`. */
  fieldError(field: string): string | undefined {
    return this.fieldErrors[field]?.[0]
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof AxiosError) {
    if (!error.response) {
      return new ApiError(0, {
        title: 'Can’t reach FleetSync',
        detail: 'Check your internet connection and try again.',
      })
    }

    const data = error.response.data
    const problem: ProblemDetails = typeof data === 'object' && data !== null ? (data as ProblemDetails) : {}
    return new ApiError(error.response.status, problem)
  }

  return new ApiError(0, { title: 'Something went wrong', detail: 'Please try again.' })
}
