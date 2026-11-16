import { formatLKR } from '@/lib/utils'
import { ApiError } from '@/services/apiClient'
import { mockOrderStore, type MockCustomerOrder } from '@/services/mockOrderStore'
import type { ActiveTrip, CustomerDashboard, DashboardOrderStatus, QuotationBannerData, RecentPayment } from '../types'

/*
 * Mocked until the endpoint exists. Then the body becomes:
 *   const { data } = await apiClient.get<CustomerDashboard>('/customer/dashboard')
 *   return data
 *
 * The mock builds everything from the shared mock order store in one call, so the dashboard always
 * agrees with My orders, Fare quotation and Payments (accepting or paying updates it on the next visit).
 * In dev, add `?mock=empty` (a brand-new customer) or `?mock=error` to the URL.
 */

const MOCK_LATENCY_MS = 400
const LATEST_ORDERS = 4
const RECENT_PAYMENTS = 2
// TODO: read the signed-in customer from AuthContext once sign-in exists
const CUSTOMER = { firstName: 'Dilini', company: 'Lanka Tiles PLC' }

const OPEN_STATUSES: DashboardOrderStatus[] = ['pending-review', 'quoted', 'accepted', 'trip-scheduled', 'in-progress']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const pad = (n: number) => String(n).padStart(2, '0')

/** "20 Oct, 18:00" */
const shortLabel = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}, ${pad(d.getHours())}:${pad(d.getMinutes())}`

/** "15 Oct, 15:02", "15 Oct" or "Today, 08:15" → a date in `now`'s year; null for "—" and the like. */
function parseLabel(label: string | null, now: Date): Date | null {
  if (!label) return null
  const today = /^Today(?:, (\d{1,2}):(\d{2}))?/.exec(label)
  if (today) return new Date(now.getFullYear(), now.getMonth(), now.getDate(), Number(today[1] ?? 0), Number(today[2] ?? 0))
  const match = /^(\d{1,2}) (\w{3})(?:, (\d{1,2}):(\d{2}))?/.exec(label)
  const month = match ? MONTHS.indexOf(match[2]) : -1
  if (!match || month < 0) return null
  return new Date(now.getFullYear(), month, Number(match[1]), Number(match[3] ?? 0), Number(match[4] ?? 0))
}

const stepCaption = (order: MockCustomerOrder, id: string) => {
  const caption = order.steps.find((step) => step.id === id)?.caption
  return caption && caption !== '—' ? caption : null
}

/** "Tiles · 8 t" → "8 t · tiles" */
function cargoSummary(cargo: string) {
  const [type, weight] = cargo.split(' · ')
  return weight ? `${weight} · ${type.toLowerCase()}` : cargo
}

/** A quotation the customer can still accept or decline. */
const isWaiting = (order: MockCustomerOrder, now: Date) =>
  order.status === 'quoted' && order.quotation?.status === 'awaiting' && new Date(order.quotation.validUntil) > now

function toActiveTrip(order: MockCustomerOrder): ActiveTrip | null {
  const trip = order.trip
  if (!trip) return null
  const assigned = stepCaption(order, 'trip-scheduled')
  const started = stepCaption(order, 'in-progress')
  const completed = stepCaption(order, 'completed')
  return {
    orderId: order.orderId,
    tripId: trip.tripId,
    steps: [
      { label: 'Assigned', timeLabel: assigned ?? 'Not yet', done: assigned !== null },
      { label: 'Started by the driver', timeLabel: started ?? 'Not yet', done: started !== null },
      { label: 'Completed', timeLabel: completed ?? 'Not yet', done: completed !== null },
    ],
    route: order.route,
    vehicle: trip.vehicle,
    driver: trip.driver,
    tripWindow: trip.window.replace(/^Today, /, ''),
  }
}

const emptyDashboard: CustomerDashboard = {
  greetingName: CUSTOMER.firstName,
  companyName: CUSTOMER.company,
  kpis: {
    openOrders: { value: 0, caption: 'Not yet completed' },
    quotationsToReview: { value: 0, caption: 'Nothing to review' },
    tripsInProgress: { value: 0, caption: 'No trip on the road' },
    completedThisMonth: { value: 0, caption: 'None yet this month' },
  },
  quotationBanner: null,
  latestOrders: [],
  activeTrip: null,
  recentPayments: [],
}

function buildDashboard(): CustomerDashboard {
  const store = mockOrderStore()
  const now = store.now()
  const all = store.listOrders()
  const myOrders = all.filter((order) => order.inMyOrders)

  const open = myOrders.filter((order) => OPEN_STATUSES.includes(order.status as DashboardOrderStatus))

  const waiting = myOrders
    .filter((order) => isWaiting(order, now))
    .sort((a, b) => new Date(a.quotation!.validUntil).getTime() - new Date(b.quotation!.validUntil).getTime())
  const soonest = waiting[0]
  const quotationBanner: QuotationBannerData | null = soonest
    ? {
        orderId: soonest.orderId,
        route: soonest.route,
        amount: soonest.quotation!.total,
        validUntilLabel: shortLabel(new Date(soonest.quotation!.validUntil)),
      }
    : null

  const onTheRoad = myOrders.filter((order) => order.trip?.status === 'in-progress')
  const activeTrip = onTheRoad.length > 0 ? toActiveTrip(onTheRoad[0]) : null

  const completedThisMonth = myOrders.filter((order) => {
    if (order.status !== 'completed') return false
    const at = parseLabel(stepCaption(order, 'completed'), now)
    return at !== null && at.getFullYear() === now.getFullYear() && at.getMonth() === now.getMonth()
  })
  const unpaid = completedThisMonth.filter((order) => order.payment?.status !== 'paid').length

  const recentPayments: RecentPayment[] = all
    .flatMap((order) => {
      const payment = order.payment
      const paidAt = parseLabel(payment?.paidOnLabel ?? null, now)
      if (payment?.status !== 'paid' || !paidAt || !payment.invoiceId) return []
      return [{ paidAt, row: { orderId: order.orderId, paidLabel: `Paid ${paidAt.getDate()} ${MONTHS[paidAt.getMonth()]}`, amount: payment.amount, invoiceId: payment.invoiceId } }]
    })
    .sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime())
    .slice(0, RECENT_PAYMENTS)
    .map(({ row }) => row)

  return {
    greetingName: CUSTOMER.firstName,
    companyName: CUSTOMER.company,
    kpis: {
      openOrders: { value: open.length, caption: 'Not yet completed' },
      quotationsToReview: {
        value: waiting.length,
        caption: soonest ? `${soonest.orderId} · ${formatLKR(soonest.quotation!.total)}` : 'Nothing to review',
      },
      tripsInProgress: {
        value: onTheRoad.length,
        caption: activeTrip
          ? onTheRoad[0].trip!.started
            ? `${activeTrip.tripId} started ${onTheRoad[0].trip!.started}`
            : activeTrip.tripId
          : 'No trip on the road',
      },
      completedThisMonth: {
        value: completedThisMonth.length,
        caption:
          completedThisMonth.length === 0 ? 'None yet this month' : unpaid === 0 ? 'All paid' : `${unpaid} awaiting payment`,
      },
    },
    quotationBanner,
    latestOrders: myOrders.slice(0, LATEST_ORDERS).map((order) => ({
      orderId: order.orderId,
      dateLabel: order.placedLabel,
      route: order.route,
      cargoSummary: cargoSummary(order.cargo),
      status: order.status as DashboardOrderStatus,
    })),
    activeTrip,
    recentPayments,
  }
}

/** The customer dashboard summary, in one call. */
export async function getCustomerDashboard(): Promise<CustomerDashboard> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))
  const scenario = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('mock') : null
  if (scenario === 'error') {
    throw new ApiError('Check your connection and try again. If it keeps happening, contact support.')
  }
  return scenario === 'empty' ? structuredClone(emptyDashboard) : buildDashboard()
}
