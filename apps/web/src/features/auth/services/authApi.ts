import { apiClient } from '@/services/apiClient'
import type { AuthSession } from '@/services/sessionApi'
import type {
  CustomerRegistrationRequest,
  LoginRequest,
  RegistrationSubmittedResponse,
  ResetPasswordLookupResponse,
  StaffApplicationRequest,
} from '../types'

/**
 * Auth API calls for the sign-in and sign-up screens. Every function throws an
 * `ApiError` (from apiClient) whose `errorCode` the pages switch on.
 */

/** Sign in. The refresh token comes back as an HttpOnly cookie; the access token in the body. */
export async function login(request: LoginRequest): Promise<AuthSession> {
  const { data } = await apiClient.post<AuthSession>('/auth/login', request)
  return data
}

/** Customer registration: creates an application that a Fleet Administrator approves after email verification. */
export async function registerCustomer(request: CustomerRegistrationRequest): Promise<RegistrationSubmittedResponse> {
  const { data } = await apiClient.post<RegistrationSubmittedResponse>('/auth/register/customer', request)
  return data
}

/** Confirms the email address with the token from the emailed link. */
export async function verifyEmail(token: string): Promise<void> {
  await apiClient.post('/auth/verify-email', { token })
}

/** Sends a fresh verification link. Always succeeds, whether or not the email is known. */
export async function resendVerification(email: string): Promise<void> {
  await apiClient.post('/auth/verify-email/resend', { email })
}

/** Staff application with documents, sent as multipart/form-data. */
export async function submitStaffApplication(request: StaffApplicationRequest): Promise<RegistrationSubmittedResponse> {
  const form = new FormData()
  if (request.applicationFormCode) form.append('applicationFormCode', request.applicationFormCode)
  form.append('fullName', request.fullName)
  form.append('nic', request.nic)
  form.append('email', request.email)
  form.append('mobile', request.mobile)
  form.append('role', request.role)
  if (request.licenceNumber) form.append('licenceNumber', request.licenceNumber)
  if (request.licenceClass) form.append('licenceClass', request.licenceClass)
  // One "documents" part per file, as the API expects.
  for (const file of request.documents) form.append('documents', file, file.name)

  const { data } = await apiClient.post<RegistrationSubmittedResponse>('/auth/staff-applications', form)
  return data
}

/** Emails a password reset link. Always succeeds, whether or not the email has an account. */
export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email })
}

/** Checks a reset link and returns the account's email ("For <email>"). */
export async function lookupPasswordReset(token: string): Promise<ResetPasswordLookupResponse> {
  const { data } = await apiClient.post<ResetPasswordLookupResponse>('/auth/reset-password/lookup', { token })
  return data
}

/** Sets the new password; the server ends every other session. */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiClient.post('/auth/reset-password', { token, newPassword })
}
