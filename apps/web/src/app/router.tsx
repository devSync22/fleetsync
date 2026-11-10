import { createBrowserRouter, Navigate } from 'react-router'
import { AvailabilityPage } from '@/features/availability/pages/AvailabilityPage'
import { ChatPage } from '@/features/chat/pages/ChatPage'
import { CoordinatorDashboardPage } from '@/features/coordinator-dashboard/pages/CoordinatorDashboardPage'
import { SubmittedOrdersPage } from '@/features/orders/pages/SubmittedOrdersPage'
import { CreateTripPage } from '@/features/trips/pages/CreateTripPage'
import { TripCancelledPage } from '@/features/trips/pages/TripCancelledPage'
import { TripCreatedPage } from '@/features/trips/pages/TripCreatedPage'
import { TripDetailsPage } from '@/features/trips/pages/TripDetailsPage'
import { TripsPage } from '@/features/trips/pages/TripsPage'
import { CoordinatorLayout } from './layouts/CoordinatorLayout'
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
      { path: 'trips', element: <TripsPage /> },
      { path: 'trips/new', element: <CreateTripPage /> },
      // One route for details and the Cancel trip dialog, so opening the dialog doesn't reload the page.
      { path: 'trips/:tripId/cancel?', element: <TripDetailsPage /> },
      { path: 'trips/:tripId/cancelled', element: <TripCancelledPage /> },
      { path: 'trips/:tripId/created', element: <TripCreatedPage /> },
      { path: 'availability', element: <AvailabilityPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
