import type { CoordinatorDashboard } from '../types'

/** Values copied from the Figma frame "Coordinator — Operational dashboard" (121:3930). */
export const coordinatorDashboardMock: CoordinatorDashboard = {
  coordinatorFirstName: 'Nimal',
  ordersToQuote: 6,
  oldestOrderWaitingHours: 5,
  tripsInProgress: 17,
  tripsNotStartedOnTime: 1,
  vehicles: {
    free: 21,
    total: 48,
    inMaintenance: 6,
    breakdown: [
      { label: 'Light trucks', count: 11 },
      { label: 'Heavy trucks', count: 4 },
      { label: 'Vans', count: 4 },
      { label: 'Pickups', count: 2 },
    ],
  },
  drivers: {
    free: 12,
    total: 35,
    breakdown: [
      { label: 'Heavy licence', count: 7 },
      { label: 'Light licence', count: 5 },
    ],
  },
  expiringQuotations: [
    {
      orderId: 'ORD-1046',
      sentLabel: 'Sent yesterday, 18:55',
      customerName: 'Ceylon Agro Ltd',
      route: 'Negombo → Galle',
      amount: 24600,
      timesOpened: 2,
      expiresInMinutes: 55,
    },
    {
      orderId: 'ORD-1049',
      sentLabel: 'Sent today, 11:20',
      customerName: 'Lanka Tiles PLC',
      route: 'Nugegoda → Kurunegala',
      amount: 31410,
      timesOpened: 0,
      expiresInMinutes: 100,
    },
  ],
  waitingOrders: [
    {
      orderId: 'ORD-1049',
      receivedLabel: 'Today, 10:42',
      customerName: 'Lanka Tiles PLC',
      route: 'Colombo → Kurunegala',
      status: 'pending-review',
    },
    {
      orderId: 'ORD-1048',
      receivedLabel: 'Today, 09:15',
      customerName: 'Kandy Builders',
      route: 'Kandy → Matale',
      status: 'pending-review',
    },
    {
      orderId: 'ORD-1046',
      receivedLabel: 'Yesterday',
      customerName: 'Ceylon Agro Ltd',
      route: 'Negombo → Galle',
      status: 'quoted',
    },
    {
      orderId: 'ORD-1045',
      receivedLabel: 'Yesterday',
      customerName: 'Hayleys Freight',
      route: 'Kurunegala → Colombo',
      status: 'paid',
    },
  ],
  activeTrips: [
    { tripId: 'TRP-2026-00384', route: 'Galle → Colombo Fish Market', startedAt: '09:20', driverName: 'Ruwan Silva' },
    { tripId: 'TRP-2026-00382', route: 'Colombo Port → Kandy Depot', startedAt: '09:02', driverName: 'K. Perera' },
    { tripId: 'TRP-2026-00388', route: 'Kurunegala → Colombo 10', startedAt: '08:40', driverName: 'Nuwan Herath' },
    { tripId: 'TRP-2026-00390', route: 'Colombo 03 → Negombo', startedAt: '08:55', driverName: 'Asanka Perera' },
  ],
  payments: [
    { status: 'paid', orderCount: 9, amount: 1284500 },
    { status: 'awaiting-payment', orderCount: 4, amount: 412300 },
    { status: 'payment-failed', orderCount: 1, amount: 48500 },
  ],
  report: { lastGeneratedLabel: 'today at 08:00', periodLabel: '1–18 Oct' },
}

/** Same coordinator on a quiet day — used to preview the empty states (`?mock=empty`). */
export const emptyCoordinatorDashboardMock: CoordinatorDashboard = {
  ...coordinatorDashboardMock,
  ordersToQuote: 0,
  oldestOrderWaitingHours: 0,
  tripsInProgress: 0,
  tripsNotStartedOnTime: 0,
  expiringQuotations: [],
  waitingOrders: [],
  activeTrips: [],
  payments: [],
  report: null,
}
