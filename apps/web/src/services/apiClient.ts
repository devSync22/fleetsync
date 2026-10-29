import axios, { isAxiosError } from 'axios'

/** Error shape every service call rejects with, so pages only handle one type. */
export class ApiError extends Error {
  readonly status: number | null

  constructor(message: string, status: number | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** The one axios instance for the app. Feature services import this — never `axios` directly. */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

let getAccessToken: () => string | null = () => null

/** Called by the auth layer once it exists, so requests carry the signed-in user's token. */
export function setAccessTokenGetter(getter: () => string | null) {
  getAccessToken = getter
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!isAxiosError(error)) {
      return Promise.reject(new ApiError('Something went wrong. Please try again.'))
    }
    if (!error.response) {
      return Promise.reject(new ApiError('Check your connection and try again.'))
    }
    // ASP.NET Core returns ProblemDetails: { title, detail, status }
    const data = error.response.data as { title?: string; detail?: string } | undefined
    const message = data?.detail ?? data?.title ?? 'Something went wrong. Please try again.'
    return Promise.reject(new ApiError(message, error.response.status))
  },
)
