import { ApiError } from '@/services/apiClient'
import { MOCK_TODAY, myOrdersMock, type MyOrderRecord } from '../mocks/myOrdersMock'
import { myOrdersTabs } from '../myOrdersTabs'
import type { CustomerOrderRow, MyOrdersPeriod, MyOrdersQuery, MyOrdersResult, MyOrdersTab } from '../types'

/*
 * Mocked until the customer order endpoints exist:
 *   getMyOrders → apiClient.get<MyOrdersResult>('/customer/orders', { params: query })
 *
 * The mock filters, counts and paginates the way the endpoint will, so the page only reads
 * the result. In dev, add `mock=empty` or `mock=error` to the URL query.
 */

const MOCK_LATENCY_MS = 400
export const MY_ORDERS_PAGE_SIZE = 7

async function mockRequest() {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))
  const scenario = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('mock') : null
  if (scenario === 'error') {
    throw new ApiError('Check your connection and try again. If it keeps happening, contact support.')
  }
  return scenario
}

/** Earliest `placedOn` (YYYY-MM-DD) included in the period, or null for all time. */
function periodStart(period: MyOrdersPeriod): string | null {
  const start = new Date(`${MOCK_TODAY}T00:00:00`)
  switch (period) {
    case 'last-30-days':
      start.setDate(start.getDate() - 30)
      break
    case 'last-3-months':
      start.setMonth(start.getMonth() - 3)
      break
    case 'last-12-months':
      start.setFullYear(start.getFullYear() - 1)
      break
    case 'all-time':
      return null
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`
}

/** Matches the order number or either city on the route, ignoring case. */
function matchesSearch(order: CustomerOrderRow, search: string) {
  const needle = search.trim().toLowerCase()
  return !needle || order.orderId.toLowerCase().includes(needle) || order.route.toLowerCase().includes(needle)
}

/** Drops the mock-only `placedOn` so the page gets exactly what the endpoint will return. */
const toRow = (order: MyOrderRecord): CustomerOrderRow => ({
  orderId: order.orderId,
  placedLabel: order.placedLabel,
  route: order.route,
  cargo: order.cargo,
  pickupLabel: order.pickupLabel,
  amount: order.amount,
  status: order.status,
})

export async function getMyOrders(query: MyOrdersQuery): Promise<MyOrdersResult> {
  const scenario = await mockRequest()
  const source = scenario === 'empty' ? [] : myOrdersMock

  const from = periodStart(query.period)
  const matching = source.filter((o) => (!from || o.placedOn >= from) && matchesSearch(o, query.search))

  const tabCounts = Object.fromEntries(
    myOrdersTabs.map((tab) => [tab.id, matching.filter((o) => tab.statuses === 'any' || tab.statuses.includes(o.status)).length]),
  ) as Record<MyOrdersTab, number>

  const activeTab = myOrdersTabs.find((tab) => tab.id === query.tab) ?? myOrdersTabs[0]
  const inTab = matching.filter((o) => activeTab.statuses === 'any' || activeTab.statuses.includes(o.status))

  const pageCount = Math.max(1, Math.ceil(inTab.length / MY_ORDERS_PAGE_SIZE))
  const page = Math.min(Math.max(1, Math.trunc(query.page) || 1), pageCount)
  const items = inTab.slice((page - 1) * MY_ORDERS_PAGE_SIZE, page * MY_ORDERS_PAGE_SIZE).map(toRow)

  return { items, total: inTab.length, page, pageCount, tabCounts }
}
