import { formatLKR } from '@/lib/utils'
import type {
  CustomerOrderDetail,
  CustomerOrderTrip,
  OrderCargo,
  OrderPayment,
  OrderProgressState,
  OrderProgressStep,
  OrderProgressStepId,
  OrderStop,
  OrderUpdate,
} from '../types'

/*
 * Order details for Lanka Tiles PLC. There is one detail for every row of myOrdersMock, with the same
 * id, route, cargo, amount, pickup and status. ORD-1040 is "Customer — Order details" (158:5805).
 *
 * The My orders mock has no accepted, trip-scheduled, quotation-expired or cancelled orders, so
 * ORD-1050, ORD-1055, ORD-1012 and ORD-1020 are here only (open them by URL) to show those states.
 */

const CUSTOMER_CONTACT = 'Dilini Perera'
const COLOMBO_15 = 'No. 82, Aluthmawatha Road, Colombo 15'
const NUGEGODA = 'Lanka Tiles warehouse, 45 High Level Road, Nugegoda'
const VISA = 'Online · Visa ending 4421'
const MASTERCARD = 'Online · Mastercard ending 7730'
const FRAGILE = 'Fragile, keep upright'

const STEPS: { id: OrderProgressStepId; label: string }[] = [
  { id: 'submitted', label: 'Submitted' },
  { id: 'quoted', label: 'Quoted' },
  { id: 'paid', label: 'Paid' },
  { id: 'trip-scheduled', label: 'Trip scheduled' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
]

/**
 * Steps before `at` are done; step `at` gets `atState`; the rest are upcoming.
 * `captions` lists one caption per step from the start; missing captions show "—".
 */
export function progress(captions: string[], at: number, atState: OrderProgressState): OrderProgressStep[] {
  return STEPS.map((step, i) => ({
    ...step,
    state: i < at ? 'done' : i === at ? atState : 'upcoming',
    caption: captions[i] ?? '—',
  }))
}

const tiles = (weightKg: number, pallets: number, type = 'Ceramic tiles', handling = FRAGILE): OrderCargo => ({
  type,
  weightKg,
  unitsLabel: 'Pallets',
  unitsCount: pallets,
  handling,
})

const submitted = (when: string): OrderUpdate => ({ title: 'Order submitted', detail: `By ${CUSTOMER_CONTACT}`, when, tone: 'neutral' })
const quoteReceived = (amount: number, when: string, detail = formatLKR(amount)): OrderUpdate => ({
  title: 'Fare quotation received',
  detail,
  when,
  tone: 'accent',
})
const quoteAccepted = (amount: number, when: string): OrderUpdate => ({ title: 'Fare quotation accepted', detail: formatLKR(amount), when, tone: 'success' })
const paymentReceived = (amount: number, when: string): OrderUpdate => ({
  title: 'Payment received',
  detail: `${formatLKR(amount)} · online`,
  when,
  tone: 'success',
})
const tripScheduled = (when: string): OrderUpdate => ({
  title: 'Trip scheduled',
  detail: 'Vehicle and driver assigned by the coordinator',
  when,
  tone: 'accent',
})
const tripStarted = (trip: Pick<CustomerOrderTrip, 'driver' | 'vehicle'>, when: string): OrderUpdate => ({
  title: 'The driver started the trip',
  detail: `${trip.driver} · ${trip.vehicle}`,
  when,
  tone: 'info',
})

type CompletedSpec = {
  orderId: string
  route: string
  cargoSummary: string
  amount: number
  pickup: OrderStop
  destination: OrderStop
  cargo: OrderCargo
  /** "9 Oct, 14:22" etc. — when each step happened. */
  placed: string
  accepted: string
  paid: string
  scheduled: string
  /** Day of the trip, "12 Oct". */
  tripDay: string
  /** Trip window times, "07:30 – 12:00". */
  windowTimes: string
  started: string
  delivered: string
  trip: Pick<CustomerOrderTrip, 'tripId' | 'vehicle' | 'driver'>
  method: string
  reference: string
}

/** A delivered order: every step done, the same updates as ORD-1040 plus the delivery. */
function completedOrder(spec: CompletedSpec): CustomerOrderDetail {
  const trip: CustomerOrderTrip = {
    ...spec.trip,
    status: 'completed',
    window: `${spec.tripDay}, ${spec.windowTimes}`,
    started: spec.started,
  }
  const startedWhen = `${spec.tripDay}, ${spec.started}`
  return {
    orderId: spec.orderId,
    status: 'completed',
    placedLabel: spec.placed,
    route: spec.route,
    cargoSummary: spec.cargoSummary,
    amount: spec.amount,
    progress: progress([spec.placed, formatLKR(spec.amount), spec.paid, spec.scheduled, startedWhen, spec.delivered], 5, 'done'),
    trip,
    updates: [
      { title: 'Order delivered', detail: `Received by ${spec.destination.contact}`, when: spec.delivered, tone: 'success' },
      tripStarted(trip, startedWhen),
      tripScheduled(spec.scheduled),
      paymentReceived(spec.amount, spec.paid),
      quoteAccepted(spec.amount, spec.accepted),
      submitted(spec.placed),
    ],
    pickup: spec.pickup,
    destination: spec.destination,
    cargo: spec.cargo,
    payment: { quotationAmount: spec.amount, paidOn: spec.paid, method: spec.method, reference: spec.reference, status: 'paid', invoiceId: `INV-2026-${spec.orderId.slice(4)}` },
  }
}

/* ───────────── ORD-1040: the Figma frame, exactly ───────────── */

const ord1040Trip: CustomerOrderTrip = {
  tripId: 'TRP-2202',
  status: 'in-progress',
  vehicle: 'WP LC-4410',
  driver: 'Saman Wijesinghe',
  window: 'Today, 08:00 – 13:00',
  started: '08:15',
}

const ord1040: CustomerOrderDetail = {
  orderId: 'ORD-1040',
  status: 'in-progress',
  placedLabel: '15 Oct, 10:05',
  route: 'Colombo → Kurunegala',
  cargoSummary: '9 t ceramic tiles',
  amount: 27900,
  progress: progress(['15 Oct, 10:05', 'LKR 27,900', '15 Oct, 15:02', '15 Oct, 16:40', 'Today, 08:15'], 4, 'current'),
  trip: ord1040Trip,
  updates: [
    tripStarted(ord1040Trip, 'Today, 08:15'),
    tripScheduled('15 Oct, 16:40'),
    paymentReceived(27900, '15 Oct, 15:02'),
    quoteAccepted(27900, '15 Oct, 14:20'),
    submitted('15 Oct, 10:05'),
  ],
  pickup: { address: COLOMBO_15, when: 'Today, 08:00', contact: CUSTOMER_CONTACT },
  destination: { address: 'Lanka Tiles showroom, Negombo Road, Kurunegala', when: 'Before 13:00', contact: 'Chamara Bandara' },
  cargo: tiles(9000, 18),
  payment: { quotationAmount: 27900, paidOn: '15 Oct, 15:02', method: VISA, reference: 'PAY-58213', status: 'paid', invoiceId: 'INV-2026-1040' },
}

/* ───────────── Rows of My orders ───────────── */

const ord1051: CustomerOrderDetail = {
  orderId: 'ORD-1051',
  status: 'pending-review',
  placedLabel: 'Today, 09:12',
  route: 'Colombo 15 → Matara',
  cargoSummary: '8 t ceramic tiles',
  amount: null,
  progress: progress(['Today, 09:12', 'Awaiting quote'], 1, 'current'),
  trip: null,
  updates: [submitted('Today, 09:12')],
  pickup: { address: COLOMBO_15, when: '23 Oct, 08:00', contact: CUSTOMER_CONTACT },
  destination: { address: 'Lanka Tiles showroom, Anagarika Dharmapala Mawatha, Matara', when: 'Before 14:00', contact: 'Sachini Gunasekara' },
  cargo: tiles(8000, 16),
  payment: null,
}

// Matches "Customer — Fare quotation" (160:5892): quoted today at 11:20.
const ord1049: CustomerOrderDetail = {
  orderId: 'ORD-1049',
  status: 'quoted',
  placedLabel: '17 Oct, 10:42',
  route: 'Nugegoda → Kurunegala',
  cargoSummary: '6.2 t ceramic tiles',
  amount: 31410,
  progress: progress(['17 Oct, 10:42', 'LKR 31,410', 'Awaiting your reply'], 2, 'current'),
  trip: null,
  updates: [quoteReceived(31410, 'Today, 11:20', 'LKR 31,410 · accept it to continue to payment'), submitted('17 Oct, 10:42')],
  pickup: { address: 'No. 215, Nawala Road, Nugegoda', when: '21 Oct, 08:00', contact: CUSTOMER_CONTACT },
  destination: { address: 'Kurunegala Distribution Yard, Dambulla Road', when: 'Before 15:00', contact: 'Chamara Bandara' },
  cargo: tiles(6200, 12),
  payment: null,
}

const ord1022: CustomerOrderDetail = {
  orderId: 'ORD-1022',
  status: 'declined',
  placedLabel: '20 Sep, 11:05',
  route: 'Colombo 15 → Jaffna',
  cargoSummary: '9 t ceramic tiles',
  amount: 68500,
  progress: progress(['20 Sep, 11:05', 'Declined 21 Sep'], 1, 'stopped'),
  trip: null,
  updates: [
    { title: 'You declined the quotation', detail: 'LKR 68,500', when: '21 Sep, 09:40', tone: 'neutral' },
    quoteReceived(68500, '20 Sep, 16:30'),
    submitted('20 Sep, 11:05'),
  ],
  pickup: { address: COLOMBO_15, when: 'Pickup date not set', contact: CUSTOMER_CONTACT },
  destination: { address: 'Jaffna Tile House, Hospital Road, Jaffna', when: 'Any time', contact: 'Suresh Kanagaratnam' },
  cargo: tiles(9000, 18),
  payment: null,
}

const completedOrders: CustomerOrderDetail[] = [
  completedOrder({
    orderId: 'ORD-1035',
    route: 'Colombo → Galle',
    cargoSummary: '5.5 t ceramic tiles',
    amount: 19600,
    pickup: { address: COLOMBO_15, when: '12 Oct, 07:30', contact: CUSTOMER_CONTACT },
    destination: { address: 'Lanka Tiles showroom, Wakwella Road, Galle', when: 'Before 12:00', contact: 'Nadeesha Fernando' },
    cargo: tiles(5500, 11),
    placed: '7 Oct, 14:22',
    accepted: '8 Oct, 10:05',
    paid: '8 Oct, 10:21',
    scheduled: '8 Oct, 15:45',
    tripDay: '12 Oct',
    windowTimes: '07:30 – 12:00',
    started: '07:34',
    delivered: '12 Oct, 11:20',
    trip: { tripId: 'TRP-2176', vehicle: 'WP LK-8803', driver: 'Janaka Wickramasinghe' },
    method: VISA,
    reference: 'PAY-57790',
  }),
  completedOrder({
    orderId: 'ORD-1031',
    route: 'Colombo 15 → Kandy',
    cargoSummary: '7 t ceramic tiles',
    amount: 24300,
    pickup: { address: COLOMBO_15, when: '4 Oct, 06:30', contact: CUSTOMER_CONTACT },
    destination: { address: 'Lanka Tiles showroom, Peradeniya Road, Kandy', when: 'Before 12:30', contact: 'Ruwani Jayawardena' },
    cargo: tiles(7000, 14),
    placed: '2 Oct, 11:40',
    accepted: '3 Oct, 08:50',
    paid: '3 Oct, 09:47',
    scheduled: '3 Oct, 14:30',
    tripDay: '4 Oct',
    windowTimes: '06:30 – 12:30',
    started: '06:38',
    delivered: '4 Oct, 11:55',
    trip: { tripId: 'TRP-2168', vehicle: 'WP LB-9145', driver: 'Roshan Gunawardena' },
    method: MASTERCARD,
    reference: 'PAY-57512',
  }),
  completedOrder({
    orderId: 'ORD-1027',
    route: 'Colombo 15 → Negombo',
    cargoSummary: '3 t ceramic tiles',
    amount: 11800,
    pickup: { address: COLOMBO_15, when: '28 Sep, 09:00', contact: CUSTOMER_CONTACT },
    destination: { address: 'Lanka Tiles showroom, Colombo Road, Negombo', when: 'Before 11:30', contact: 'Pradeep Silva' },
    cargo: tiles(3000, 6),
    placed: '26 Sep, 10:15',
    accepted: '26 Sep, 15:02',
    paid: '27 Sep, 16:05',
    scheduled: '27 Sep, 17:10',
    tripDay: '28 Sep',
    windowTimes: '09:00 – 11:30',
    started: '09:06',
    delivered: '28 Sep, 10:45',
    trip: { tripId: 'TRP-2161', vehicle: 'WP LE-6120', driver: 'Isuru Karunaratne' },
    method: VISA,
    reference: 'PAY-57201',
  }),
  completedOrder({
    orderId: 'ORD-1018',
    route: 'Colombo 15 → Ratnapura',
    cargoSummary: '6 t porcelain floor tiles',
    amount: 22800,
    pickup: { address: COLOMBO_15, when: '15 Sep, 07:00', contact: CUSTOMER_CONTACT },
    destination: { address: 'Ratnapura Hardware Centre, Main Street, Ratnapura', when: 'Before 11:30', contact: 'Kelum Rathnayake' },
    cargo: tiles(6000, 12, 'Porcelain floor tiles'),
    placed: '12 Sep, 09:30',
    accepted: '13 Sep, 10:00',
    paid: '13 Sep, 10:12',
    scheduled: '13 Sep, 16:00',
    tripDay: '15 Sep',
    windowTimes: '07:00 – 11:30',
    started: '07:05',
    delivered: '15 Sep, 10:50',
    trip: { tripId: 'TRP-2154', vehicle: 'WP LD-3302', driver: 'Ruwan Silva' },
    method: VISA,
    reference: 'PAY-56312',
  }),
  completedOrder({
    orderId: 'ORD-1014',
    route: 'Nugegoda → Anuradhapura',
    cargoSummary: '8.5 t ceramic tiles',
    amount: 41200,
    pickup: { address: NUGEGODA, when: '7 Sep, 06:00', contact: CUSTOMER_CONTACT },
    destination: {
      address: 'Lanka Tiles showroom, Maithripala Senanayake Mawatha, Anuradhapura',
      when: 'Before 13:30',
      contact: 'Chathurika Herath',
    },
    cargo: tiles(8500, 17),
    placed: '4 Sep, 15:05',
    accepted: '5 Sep, 11:45',
    paid: '5 Sep, 11:58',
    scheduled: '5 Sep, 16:30',
    tripDay: '7 Sep',
    windowTimes: '06:00 – 13:30',
    started: '06:04',
    delivered: '7 Sep, 12:40',
    trip: { tripId: 'TRP-2147', vehicle: 'WP LA-5012', driver: 'Lahiru Weerasinghe' },
    method: MASTERCARD,
    reference: 'PAY-55847',
  }),
  completedOrder({
    orderId: 'ORD-1009',
    route: 'Colombo 15 → Kalutara',
    cargoSummary: '4 t ceramic tiles',
    amount: 12600,
    pickup: { address: COLOMBO_15, when: '29 Aug, 08:30', contact: CUSTOMER_CONTACT },
    destination: { address: 'Lanka Tiles showroom, Galle Road, Kalutara', when: 'Before 11:00', contact: 'Ishani Mendis' },
    cargo: tiles(4000, 8),
    placed: '27 Aug, 11:10',
    accepted: '28 Aug, 09:05',
    paid: '28 Aug, 09:14',
    scheduled: '28 Aug, 13:20',
    tripDay: '29 Aug',
    windowTimes: '08:30 – 11:00',
    started: '08:36',
    delivered: '29 Aug, 10:15',
    trip: { tripId: 'TRP-2139', vehicle: 'WP LK-8803', driver: 'Janaka Wickramasinghe' },
    method: VISA,
    reference: 'PAY-55203',
  }),
  completedOrder({
    orderId: 'ORD-1006',
    route: 'Colombo → Badulla',
    cargoSummary: '7.5 t ceramic tiles',
    amount: 38900,
    pickup: { address: COLOMBO_15, when: '21 Aug, 06:00', contact: CUSTOMER_CONTACT },
    destination: { address: 'Badulla Tile Centre, Lower Street, Badulla', when: 'Before 14:00', contact: 'Nimal Jayasuriya' },
    cargo: tiles(7500, 15),
    placed: '18 Aug, 09:45',
    accepted: '19 Aug, 10:30',
    paid: '19 Aug, 10:41',
    scheduled: '19 Aug, 15:10',
    tripDay: '21 Aug',
    windowTimes: '06:00 – 14:00',
    started: '06:07',
    delivered: '21 Aug, 13:25',
    trip: { tripId: 'TRP-2131', vehicle: 'WP LC-1188', driver: 'Mohamed Rizwan' },
    method: VISA,
    reference: 'PAY-54766',
  }),
  completedOrder({
    orderId: 'ORD-1002',
    route: 'Colombo 15 → Gampaha',
    cargoSummary: '2.5 t wall tiles',
    amount: 9400,
    pickup: { address: COLOMBO_15, when: '8 Aug, 10:00', contact: CUSTOMER_CONTACT },
    destination: { address: 'Lanka Tiles showroom, Colombo Road, Gampaha', when: 'Before 12:00', contact: 'Tharaka Peiris' },
    cargo: { type: 'Wall tiles', weightKg: 2500, unitsLabel: 'Boxes', unitsCount: 210, handling: 'Fragile, stack at most 4 high' },
    placed: '6 Aug, 13:20',
    accepted: '7 Aug, 08:55',
    paid: '7 Aug, 09:02',
    scheduled: '7 Aug, 14:15',
    tripDay: '8 Aug',
    windowTimes: '10:00 – 12:00',
    started: '10:03',
    delivered: '8 Aug, 11:10',
    trip: { tripId: 'TRP-2124', vehicle: 'WP LB-4521', driver: 'Kasun Jayasinghe' },
    method: MASTERCARD,
    reference: 'PAY-54109',
  }),
]

/* ───────────── States that have no row in My orders ───────────── */

const ord1050Payment: OrderPayment = { quotationAmount: 16200, paidOn: null, method: null, reference: null, status: 'awaiting-payment' }

const ord1050: CustomerOrderDetail = {
  orderId: 'ORD-1050',
  status: 'accepted',
  placedLabel: '18 Oct, 11:20',
  route: 'Colombo 15 → Panadura',
  cargoSummary: '5 t ceramic tiles',
  amount: 16200,
  progress: progress(['18 Oct, 11:20', 'LKR 16,200', 'Awaiting payment'], 2, 'current'),
  trip: null,
  updates: [quoteAccepted(16200, '19 Oct, 09:10'), quoteReceived(16200, '18 Oct, 15:40'), submitted('18 Oct, 11:20')],
  pickup: { address: COLOMBO_15, when: '24 Oct, 07:00', contact: CUSTOMER_CONTACT },
  destination: { address: 'Lanka Tiles showroom, Galle Road, Panadura', when: 'Before 10:00', contact: 'Ishani Mendis' },
  cargo: tiles(5000, 10),
  payment: ord1050Payment,
}

const ord1055Trip: CustomerOrderTrip = {
  tripId: 'TRP-2212',
  status: 'scheduled',
  vehicle: 'WP LK-8803',
  driver: 'Janaka Wickramasinghe',
  window: '22 Oct, 07:00 – 11:30',
  started: null,
}

const ord1055: CustomerOrderDetail = {
  orderId: 'ORD-1055',
  status: 'trip-scheduled',
  placedLabel: '23 Sep, 13:30',
  route: 'Colombo 15 → Kegalle',
  cargoSummary: '5 t ceramic tiles',
  amount: 21400,
  progress: progress(['23 Sep, 13:30', 'LKR 21,400', '24 Sep, 08:52', '24 Sep, 14:25', 'Starts 22 Oct, 07:00'], 4, 'upcoming'),
  trip: ord1055Trip,
  updates: [
    tripScheduled('24 Sep, 14:25'),
    paymentReceived(21400, '24 Sep, 08:52'),
    quoteAccepted(21400, '24 Sep, 08:40'),
    submitted('23 Sep, 13:30'),
  ],
  pickup: { address: COLOMBO_15, when: '22 Oct, 07:00', contact: CUSTOMER_CONTACT },
  destination: { address: 'Kegalle Tile Mart, Kandy Road, Kegalle', when: 'Before 11:30', contact: 'Asela Dissanayake' },
  cargo: tiles(5000, 10),
  payment: { quotationAmount: 21400, paidOn: '24 Sep, 08:52', method: VISA, reference: 'PAY-57150', status: 'paid', invoiceId: 'INV-2026-1055' },
}

const ord1020Trip: CustomerOrderTrip = {
  tripId: 'TRP-2150',
  status: 'trip-cancelled',
  vehicle: 'WP LD-3302',
  driver: 'Ruwan Silva',
  window: '19 Sep, 05:30 – 13:00',
  started: null,
}

const ord1020: CustomerOrderDetail = {
  orderId: 'ORD-1020',
  status: 'cancelled',
  placedLabel: '16 Sep, 10:10',
  route: 'Colombo 15 → Hambantota',
  cargoSummary: '10 t ceramic tiles',
  amount: 45600,
  progress: progress(['16 Sep, 10:10', 'LKR 45,600', '17 Sep, 09:11', 'Cancelled 18 Sep'], 3, 'stopped'),
  trip: ord1020Trip,
  updates: [
    { title: 'Full refund issued', detail: 'LKR 45,600 to Visa ending 4421', when: '18 Sep, 17:06', tone: 'neutral' },
    { title: 'Order cancelled', detail: 'The coordinator cancelled TRP-2150 before pickup', when: '18 Sep, 17:05', tone: 'danger' },
    tripScheduled('17 Sep, 13:40'),
    paymentReceived(45600, '17 Sep, 09:11'),
    quoteAccepted(45600, '17 Sep, 09:00'),
    submitted('16 Sep, 10:10'),
  ],
  pickup: { address: COLOMBO_15, when: '19 Sep, 05:30', contact: CUSTOMER_CONTACT },
  destination: { address: 'Lanka Tiles showroom, Tissa Road, Hambantota', when: 'Before 13:00', contact: 'Malith Wickramaratne' },
  cargo: tiles(10000, 20),
  payment: { quotationAmount: 45600, paidOn: '17 Sep, 09:11', method: VISA, reference: 'PAY-56120', status: 'refunded', invoiceId: 'INV-2026-1020' },
}

const ord1012: CustomerOrderDetail = {
  orderId: 'ORD-1012',
  status: 'quotation-expired',
  placedLabel: '1 Sep, 14:00',
  route: 'Colombo 15 → Trincomalee',
  cargoSummary: '7.5 t ceramic tiles',
  amount: 44800,
  progress: progress(['1 Sep, 14:00', 'Expired 3 Sep'], 1, 'stopped'),
  trip: null,
  updates: [
    { title: 'Quotation expired', detail: 'It was not accepted before it expired', when: '3 Sep, 17:45', tone: 'neutral' },
    quoteReceived(44800, '1 Sep, 17:45'),
    submitted('1 Sep, 14:00'),
  ],
  pickup: { address: COLOMBO_15, when: '5 Sep, 06:00', contact: CUSTOMER_CONTACT },
  destination: { address: 'Trinco Building Supplies, Dockyard Road, Trincomalee', when: 'Before 15:00', contact: 'Mohamed Faizal' },
  cargo: tiles(7500, 15),
  payment: null,
}

export const orderDetailsMock: CustomerOrderDetail[] = [
  ord1051,
  ord1049,
  ord1040,
  ...completedOrders,
  ord1022,
  ord1050,
  ord1055,
  ord1020,
  ord1012,
]
