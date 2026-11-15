import { createBrowserRouter, Navigate } from 'react-router'
import { CustomerRegistrationPage } from '@/features/auth/pages/CustomerRegistrationPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SetNewPasswordPage } from '@/features/auth/pages/SetNewPasswordPage'
import { SignedInPage } from '@/features/auth/pages/SignedInPage'
import { StaffApplicationPage } from '@/features/auth/pages/StaffApplicationPage'
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage'
import { AuthLayout } from './layouts/AuthLayout'
import { RequireAuth } from './layouts/RequireAuth'
import { RedirectTo } from './RedirectTo'

/**
 * All routes, grouped per role area. Only /auth/* exists so far; each role
 * (/coordinator/*, /admin/*, /customer/*, /owner/*) gets its own group and
 * layout as its screens are built.
 */
export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <CustomerRegistrationPage /> },
      { path: 'request-staff-account', element: <StaffApplicationPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <SetNewPasswordPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      // Temporary landing page until the role dashboards exist.
      { path: '/', element: <SignedInPage /> },
    ],
  },
  { path: '/login', element: <RedirectTo path="/auth/login" /> },
  { path: '/verify-email', element: <RedirectTo path="/auth/verify-email" /> },
  { path: '/reset-password', element: <RedirectTo path="/auth/reset-password" /> },
  // Unknown paths go home (which sends signed-out users to sign in).
  { path: '*', element: <Navigate to="/" replace /> },
])
