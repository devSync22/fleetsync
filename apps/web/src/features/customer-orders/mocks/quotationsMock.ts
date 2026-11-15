import { formatLKR } from '@/lib/utils'
import type { CustomerOrderDetail, CustomerQuotation, QuotationLine, QuotationStatus } from '../types'
import { orderDetailsMock } from './orderDetailsMock'

/** A stored quotation. `paymentDue` is worked out from the order when it is read. */
export type QuotationRecord = Omit<CustomerQuotation, 'paymentDue'>

/*
 * One quotation for every order that has been quoted (all orders except ORD-1051, still pending review).
 * ORD-1049 is "Customer — Fare quotation" (160:5892). The others reuse their order's amount, stops and
 * cargo from orderDetailsMock so the three customer screens agree.
 */

const COORDINATOR = 'Nimal Perera'
const ROLE = 'Operational Coordinator'

// Spelled out rather than Intl: en-GB gives "Sept", while the rest of the mock data uses "Sep".
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2026-10-16T18:00:00" → "Fri, 16 Oct 2026 at 18:00" */
function validLabel(iso: string) {
  const date = new Date(iso)
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()} at ${iso.slice(11, 16)}`
}

const roundTo50 = (n: number) => Math.round(n / 50) * 50

function vehicleFor(weightKg: number) {
  if (weightKg <= 3500) return 'Light truck · up to 3.5 t'
  if (weightKg <= 5000) return 'Medium truck · up to 5 t'
  if (weightKg <= 9000) return 'Heavy truck · up to 9 t'
  return 'Heavy truck · up to 12 t'
}

/** Price lines that add up to exactly `total`: distance ≈ 62 %, handling and tolls fixed shares, load takes the rest. */
function priceLines(detail: CustomerOrderDetail, total: number, km: number): QuotationLine[] {
  const { cargo } = detail
  const rate = Math.max(10, Math.round((total * 0.62) / km / 10) * 10)
  const distance = km * rate
  const loading = roundTo50(total * 0.1)
  const fragile = cargo.handling.startsWith('Fragile') ? roundTo50(total * 0.08) : 0
  const tolls = roundTo50(total * 0.04)
  const load = total - distance - loading - fragile - tolls
  const tonnes = new Intl.NumberFormat('en-LK', { maximumFractionDigits: 1 }).format(cargo.weightKg / 1000)
  const handlingRest = cargo.handling.replace(/^Fragile,?\s*/, '')

  return [
    { label: 'Distance charge', detail: `${km} km × ${formatLKR(rate)}`, amount: distance },
    { label: 'Load charge', detail: `${tonnes} t`, amount: load },
    { label: 'Loading and unloading', detail: `${cargo.unitsCount} ${cargo.unitsLabel.toLowerCase()}`, amount: loading },
    ...(fragile
      ? [{ label: 'Fragile handling', detail: handlingRest ? handlingRest[0].toUpperCase() + handlingRest.slice(1) : 'Careful handling', amount: fragile }]
      : []),
    { label: 'Tolls and fees', detail: km > 60 ? 'Expressway' : 'Road tolls', amount: tolls },
  ]
}

type Spec = {
  orderId: string
  km: number
  /** "15 Oct, 12:40" */
  sent: string
  /** Local ISO, "2026-10-16T18:00:00" */
  validUntil: string
  status: QuotationStatus
  decided?: string
  declineReason?: string
}

function fromOrder(spec: Spec): QuotationRecord {
  const detail = orderDetailsMock.find((order) => order.orderId === spec.orderId)
  if (!detail || detail.amount === null) throw new Error(`No quoted order ${spec.orderId} in orderDetailsMock`)
  const lines = priceLines(detail, detail.amount, spec.km)
  return {
    orderId: spec.orderId,
    status: spec.status,
    sentBy: COORDINATOR,
    sentByRole: ROLE,
    sentAtLabel: spec.sent.replace(', ', ' at '),
    validUntil: spec.validUntil,
    validUntilLabel: validLabel(spec.validUntil),
    vehicleLabel: vehicleFor(detail.cargo.weightKg),
    lines,
    total: lines.reduce((sum, line) => sum + line.amount, 0),
    coordinatorMessage: `Price includes loading and unloading of all ${detail.cargo.unitsCount} ${detail.cargo.unitsLabel.toLowerCase()}.`,
    messageMeta: `${COORDINATOR} · ${spec.sent}`,
    order: {
      pickup: { address: detail.pickup.address, when: detail.pickup.when },
      destination: { address: detail.destination.address, when: detail.destination.when },
      cargo: detail.cargo,
    },
    decidedAtLabel: spec.decided,
    declineReason: spec.declineReason,
  }
}

/** ORD-1049 — the Figma frame, exactly (including its "Mon, 20 Oct 2026" and "Tue, 21 Oct" labels). */
const ord1049: QuotationRecord = {
  orderId: 'ORD-1049',
  status: 'awaiting',
  sentBy: COORDINATOR,
  sentByRole: ROLE,
  sentAtLabel: 'today at 11:20',
  validUntil: '2026-10-20T18:00:00',
  validUntilLabel: 'Mon, 20 Oct 2026 at 18:00',
  vehicleLabel: 'Heavy truck · up to 9 t',
  lines: [
    { label: 'Distance charge', detail: '96 km × LKR 210', amount: 20160 },
    { label: 'Load charge', detail: '6.2 t', amount: 4500 },
    { label: 'Loading and unloading', detail: '12 pallets', amount: 3000 },
    { label: 'Fragile handling', detail: 'Keep upright', amount: 2500 },
    { label: 'Tolls and fees', detail: 'Expressway', amount: 1250 },
  ],
  total: 31410,
  coordinatorMessage: 'Price includes loading and unloading of all 12 pallets.',
  messageMeta: 'Nimal Perera · today, 11:20',
  order: {
    pickup: { address: 'No. 215, Nawala Road, Nugegoda', when: 'Tue, 21 Oct, 08:00' },
    destination: { address: 'Kurunegala Distribution Yard, Dambulla Road', when: 'Same day, before 15:00' },
    cargo: { type: 'Ceramic tiles', weightKg: 6200, unitsLabel: 'Pallets', unitsCount: 12, handling: 'Fragile, keep upright' },
  },
}

const specs: Spec[] = [
  { orderId: 'ORD-1040', km: 94, sent: '15 Oct, 12:40', validUntil: '2026-10-16T18:00:00', status: 'accepted', decided: '15 Oct, 14:20' },
  { orderId: 'ORD-1035', km: 126, sent: '9 Oct, 17:05', validUntil: '2026-10-10T18:00:00', status: 'accepted', decided: '10 Oct, 09:12' },
  { orderId: 'ORD-1031', km: 115, sent: '2 Oct, 16:10', validUntil: '2026-10-03T18:00:00', status: 'accepted', decided: '3 Oct, 08:50' },
  { orderId: 'ORD-1027', km: 38, sent: '26 Sep, 13:40', validUntil: '2026-09-27T18:00:00', status: 'accepted', decided: '26 Sep, 15:02' },
  { orderId: 'ORD-1018', km: 101, sent: '12 Sep, 14:15', validUntil: '2026-09-13T18:00:00', status: 'accepted', decided: '13 Sep, 10:00' },
  { orderId: 'ORD-1014', km: 205, sent: '5 Sep, 10:20', validUntil: '2026-09-06T18:00:00', status: 'accepted', decided: '5 Sep, 11:45' },
  { orderId: 'ORD-1009', km: 43, sent: '27 Aug, 15:30', validUntil: '2026-08-28T18:00:00', status: 'accepted', decided: '28 Aug, 09:05' },
  { orderId: 'ORD-1006', km: 230, sent: '18 Aug, 14:50', validUntil: '2026-08-19T18:00:00', status: 'accepted', decided: '19 Aug, 10:30' },
  { orderId: 'ORD-1002', km: 29, sent: '6 Aug, 16:40', validUntil: '2026-08-07T18:00:00', status: 'accepted', decided: '7 Aug, 08:55' },
  {
    orderId: 'ORD-1022',
    km: 395,
    sent: '20 Sep, 16:30',
    validUntil: '2026-09-22T18:00:00',
    status: 'declined',
    decided: '21 Sep, 09:40',
    declineReason: 'We are sending this stock to Jaffna by rail instead.',
  },
  // Orders that are only in orderDetailsMock (see there).
  { orderId: 'ORD-1050', km: 27, sent: '18 Oct, 15:40', validUntil: '2026-10-21T18:00:00', status: 'accepted', decided: '19 Oct, 09:10' },
  { orderId: 'ORD-1055', km: 78, sent: '16 Oct, 17:10', validUntil: '2026-10-17T18:00:00', status: 'accepted', decided: '17 Oct, 08:40' },
  { orderId: 'ORD-1020', km: 238, sent: '16 Sep, 15:20', validUntil: '2026-09-17T18:00:00', status: 'accepted', decided: '17 Sep, 09:00' },
  // Still "awaiting" in storage but past its validUntil: the page must show it as expired.
  { orderId: 'ORD-1012', km: 257, sent: '1 Sep, 17:45', validUntil: '2026-09-03T17:45:00', status: 'awaiting' },
]

export const quotationsMock: QuotationRecord[] = [ord1049, ...specs.map(fromOrder)]
