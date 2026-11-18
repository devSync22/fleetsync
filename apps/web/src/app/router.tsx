import { createBrowserRouter, Navigate } from 'react-router'
import { CustomerRegistrationPage } from '@/features/auth/pages/CustomerRegistrationPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SetNewPasswordPage } from '@/features/auth/pages/SetNewPasswordPage'
import { SignedInPage } from '@/features/auth/pages/SignedInPage'
import { StaffApplicationPage } from '@/features/auth/pages/StaffApplicationPage'
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage'
import { AdminDashboardPage } from '@/features/admin-dashboard/pages/AdminDashboardPage'
import { CreateUserPage } from '@/features/admin-users/pages/CreateUserPage'
import { UserAccountsPage } from '@/features/admin-users/pages/UserAccountsPage'
import { ApplicationReviewPage } from '@/features/applications/pages/ApplicationReviewPage'
import { ApplicationsPage } from '@/features/applications/pages/ApplicationsPage'
import { AddVehiclePage } from '@/features/vehicles/pages/AddVehiclePage'
import { EditVehiclePage } from '@/features/vehicles/pages/EditVehiclePage'
import { VehiclesPage } from '@/features/vehicles/pages/VehiclesPage'
import { AvailabilityPage } from '@/features/availability/pages/AvailabilityPage'
import { ChatPage } from '@/features/chat/pages/ChatPage'
import { CoordinatorDashboardPage } from '@/features/coordinator-dashboard/pages/CoordinatorDashboardPage'
import { CustomerDashboardPage } from '@/features/customer-dashboard/pages/CustomerDashboardPage'
import { CustomerOrderDetailsPage } from '@/features/customer-orders/pages/CustomerOrderDetailsPage'
import { FareQuotationPage } from '@/features/customer-orders/pages/FareQuotationPage'
import { MyOrdersPage } from '@/features/customer-orders/pages/MyOrdersPage'
import { NewOrderPage } from '@/features/customer-orders/pages/NewOrderPage'
import { MailPage } from '@/features/mail/pages/MailPage'
import { OrderReviewPage } from '@/features/orders/pages/OrderReviewPage'
import { QuotationSentPage } from '@/features/orders/pages/QuotationSentPage'
import { SubmittedOrdersPage } from '@/features/orders/pages/SubmittedOrdersPage'
import { PaymentHistoryPage } from '@/features/payments/pages/PaymentHistoryPage'
import { PaymentPage } from '@/features/payments/pages/PaymentPage'
import { PaymentResultPage } from '@/features/payments/pages/PaymentResultPage'
import { ProfileSettingsPage } from '@/features/profile/pages/ProfileSettingsPage'
import { ReportsPage } from '@/features/reports/pages/ReportsPage'
import { CreateTripPage } from '@/features/trips/pages/CreateTripPage'
import { TripCancelledPage } from '@/features/trips/pages/TripCancelledPage'
import { TripCreatedPage } from '@/features/trips/pages/TripCreatedPage'
import { TripDetailsPage } from '@/features/trips/pages/TripDetailsPage'
import { TripsPage } from '@/features/trips/pages/TripsPage'
import { NotFoundPage } from './NotFoundPage'
import { RedirectTo } from './RedirectTo'
import { AdminLayout } from './layouts/AdminLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { CoordinatorLayout } from './layouts/CoordinatorLayout'
import { CustomerLayout } from './layouts/CustomerLayout'
import { RequireAuth } from './layouts/RequireAuth'

/**
 * All routes, grouped per role area (/auth/*, /coordinator/*, /customer/*, /admin/*; /owner/*
 * gets its own group and layout as its screens are built).
 * The role areas are not behind RequireAuth yet: their screens still run on mock data.
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
      // Temporary landing page after sign-in, until each role is sent to its own home.
      { path: '/', element: <SignedInPage /> },
    ],
  },
  {
    path: '/coordinator',
    element: <CoordinatorLayout />,
    children: [
      { index: true, element: <CoordinatorDashboardPage /> },
      { path: 'orders', element: <SubmittedOrdersPage /> },
      { path: 'orders/:orderId', element: <OrderReviewPage /> },
      { path: 'orders/:orderId/quotation-sent', element: <QuotationSentPage /> },
      { path: 'trips', element: <TripsPage /> },
      { path: 'trips/new', element: <CreateTripPage /> },
      // One route for details and the Cancel trip dialog, so opening the dialog doesn't reload the page.
      { path: 'trips/:tripId/cancel?', element: <TripDetailsPage /> },
      { path: 'trips/:tripId/cancelled', element: <TripCancelledPage /> },
      { path: 'trips/:tripId/created', element: <TripCreatedPage /> },
      { path: 'availability', element: <AvailabilityPage /> },
      { path: 'chat/:orderId?', element: <ChatPage /> },
      { path: 'mail', element: <MailPage /> },
      { path: 'reports', element: <ReportsPage /> },
      // One route for both tabs so switching between them keeps the loaded profile.
      { path: 'profile/security?', element: <ProfileSettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/customer',
    element: <CustomerLayout />,
    children: [
      { index: true, element: <CustomerDashboardPage /> },
      { path: 'orders', element: <MyOrdersPage /> },
      { path: 'new-order', element: <NewOrderPage /> },
      { path: 'orders/:orderId', element: <CustomerOrderDetailsPage /> },
      { path: 'orders/:orderId/pay', element: <PaymentPage /> },
      { path: 'quotations/:orderId', element: <FareQuotationPage /> },
      { path: 'payments', element: <PaymentHistoryPage /> },
      { path: 'payments/:paymentId', element: <PaymentResultPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      // Tabs (?tab=drivers) and the open profile (?user=USR-0142) are query values on one route.
      { path: 'users', element: <UserAccountsPage /> },
      { path: 'users/new', element: <CreateUserPage /> },
      { path: 'applications', element: <ApplicationsPage /> },
      { path: 'applications/:applicationId', element: <ApplicationReviewPage /> },
      { path: 'vehicles', element: <VehiclesPage /> },
      { path: 'vehicles/new', element: <AddVehiclePage /> },
      { path: 'vehicles/:plate/edit', element: <EditVehiclePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // Short links used in emails (verify / reset) and old bookmarks.
  { path: '/login', element: <RedirectTo path="/auth/login" /> },
  { path: '/verify-email', element: <RedirectTo path="/auth/verify-email" /> },
  { path: '/reset-password', element: <RedirectTo path="/auth/reset-password" /> },
  { path: '*', element: <NotFoundPage /> },
])
