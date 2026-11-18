import { mockRequest } from '@/services/mockRequest'
import { adminDashboardMock } from '../mocks/adminDashboardMock'
import type { AdminDashboard } from '../types'

/*
 * Mocked until the dashboard endpoint exists. The real call will be
 *   getAdminDashboard → apiClient.get<AdminDashboard>('/admin/dashboard')
 * In dev, add `?mock=error` to preview the error state and `?mock=empty` for a quiet day (nothing waiting).
 */
export async function getAdminDashboard(): Promise<AdminDashboard> {
  const scenario = await mockRequest()
  if (scenario === 'empty') {
    return { ...adminDashboardMock, pendingApplications: [], changeRequests: [], recentAudit: [], auditEventsToday: 0 }
  }
  return adminDashboardMock
}
