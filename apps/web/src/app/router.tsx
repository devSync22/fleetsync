import { createBrowserRouter, Navigate } from 'react-router'
import { CoordinatorDashboardPage } from '@/features/coordinator-dashboard/pages/CoordinatorDashboardPage'
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
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
