import { createBrowserRouter, Navigate } from 'react-router'
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
import { CoordinatorLayout } from './layouts/CoordinatorLayout'
import { CustomerLayout } from './layouts/CustomerLayout'
import { NotFoundPage } from './NotFoundPage'

/** All routes, grouped per role. Add /admin, /customer, /owner and /auth when work on them starts. */
export const router = createBrowserRouter([
  // TODO: send users to their role's home once sign-in exists
  { path: '/', element: <Navigate to="/coordinator" replace /> },
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
      { path: 'chat', element: <ChatPage /> },
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
  { path: '*', element: <NotFoundPage /> },
])
