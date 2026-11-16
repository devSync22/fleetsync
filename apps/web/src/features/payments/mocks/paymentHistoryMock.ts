import type { PaymentHistoryStatus } from '../types'

/** A past payment, stored the way the history endpoint will return it. */
export type HistorySeed = {
  paymentId: string
  orderId: string
  /** Local ISO date-time, "2026-10-15T15:02:00". */
  at: string
  amount: number
  status: PaymentHistoryStatus
  cardLast4: string
  /**
   * Route and trip day for orders older than the customer-orders mock (they are not in the mock store).
   * Orders that are in the store take both from there, so the screens agree.
   */
  older?: { route: string; tripDate: string }
}

const VISA = '4421'
const MASTERCARD = '7730'

/** "INV-2026-1040" — one invoice per paid order. */
export const invoiceIdFor = (orderId: string, at: string) => `INV-${at.slice(0, 4)}-${orderId.slice(4)}`

/*
 * Lanka Tiles PLC's payments this year, newest first — 27 here, 29 once ORD-1049 is paid on the Payment
 * page (its declined attempt and its payment are made in the session, so the mock store stays consistent).
 *
 * The first rows match "Customer — Payment history" (162:6243). Paid dates, references and cards of
 * orders that are in the customer-orders mock match their Order details.
 */
export const paymentHistoryMock: HistorySeed[] = [
  // In the mock store (customer-orders)
  { paymentId: 'PAY-58213', orderId: 'ORD-1040', at: '2026-10-15T15:02:00', amount: 27900, status: 'paid', cardLast4: VISA },
  { paymentId: 'PAY-57790', orderId: 'ORD-1035', at: '2026-10-08T10:21:00', amount: 19600, status: 'paid', cardLast4: VISA },
  { paymentId: 'PAY-57512', orderId: 'ORD-1031', at: '2026-10-03T09:47:00', amount: 24300, status: 'paid', cardLast4: MASTERCARD },
  { paymentId: 'PAY-57201', orderId: 'ORD-1027', at: '2026-09-27T16:05:00', amount: 11800, status: 'paid', cardLast4: VISA },
  { paymentId: 'PAY-57150', orderId: 'ORD-1055', at: '2026-09-24T08:52:00', amount: 21400, status: 'paid', cardLast4: VISA },
  { paymentId: 'PAY-56120', orderId: 'ORD-1020', at: '2026-09-17T09:11:00', amount: 45600, status: 'refunded', cardLast4: VISA },
  { paymentId: 'PAY-56312', orderId: 'ORD-1018', at: '2026-09-13T10:12:00', amount: 22800, status: 'paid', cardLast4: VISA },
  { paymentId: 'PAY-55847', orderId: 'ORD-1014', at: '2026-09-05T11:58:00', amount: 41200, status: 'paid', cardLast4: MASTERCARD },
  { paymentId: 'PAY-55203', orderId: 'ORD-1009', at: '2026-08-28T09:14:00', amount: 12600, status: 'paid', cardLast4: VISA },
  { paymentId: 'PAY-54766', orderId: 'ORD-1006', at: '2026-08-19T10:41:00', amount: 38900, status: 'paid', cardLast4: VISA },
  { paymentId: 'PAY-54109', orderId: 'ORD-1002', at: '2026-08-07T09:02:00', amount: 9400, status: 'paid', cardLast4: MASTERCARD },
  // Older orders (January – mid July), before the customer-orders mock begins
  { paymentId: 'PAY-53702', orderId: 'ORD-1000', at: '2026-07-17T10:25:00', amount: 20290, status: 'paid', cardLast4: VISA, older: { route: 'Colombo 15 → Chilaw', tripDate: '2026-07-19' } },
  { paymentId: 'PAY-53455', orderId: 'ORD-0998', at: '2026-07-14T14:10:00', amount: 15600, status: 'paid', cardLast4: VISA, older: { route: 'Colombo 15 → Panadura', tripDate: '2026-07-16' } },
  { paymentId: 'PAY-52981', orderId: 'ORD-0996', at: '2026-07-09T09:35:00', amount: 43500, status: 'paid', cardLast4: MASTERCARD, older: { route: 'Colombo 15 → Trincomalee', tripDate: '2026-07-12' } },
  { paymentId: 'PAY-52318', orderId: 'ORD-0994', at: '2026-06-25T11:02:00', amount: 30200, status: 'paid', cardLast4: VISA, older: { route: 'Nugegoda → Kurunegala', tripDate: '2026-06-27' } },
  { paymentId: 'PAY-51874', orderId: 'ORD-0992', at: '2026-06-11T15:48:00', amount: 19300, status: 'paid', cardLast4: VISA, older: { route: 'Colombo 15 → Galle', tripDate: '2026-06-13' } },
  { paymentId: 'PAY-51290', orderId: 'ORD-0990', at: '2026-05-28T10:17:00', amount: 20700, status: 'paid', cardLast4: VISA, older: { route: 'Colombo 15 → Kegalle', tripDate: '2026-05-30' } },
  { paymentId: 'PAY-50836', orderId: 'ORD-0988', at: '2026-05-14T09:29:00', amount: 9100, status: 'paid', cardLast4: MASTERCARD, older: { route: 'Colombo 15 → Gampaha', tripDate: '2026-05-15' } },
  { paymentId: 'PAY-50402', orderId: 'ORD-0986', at: '2026-04-30T16:20:00', amount: 37800, status: 'paid', cardLast4: VISA, older: { route: 'Colombo → Badulla', tripDate: '2026-05-03' } },
  { paymentId: 'PAY-49955', orderId: 'ORD-0984', at: '2026-04-16T11:45:00', amount: 12300, status: 'paid', cardLast4: VISA, older: { route: 'Colombo 15 → Kalutara', tripDate: '2026-04-17' } },
  { paymentId: 'PAY-49431', orderId: 'ORD-0981', at: '2026-04-02T10:08:00', amount: 40600, status: 'paid', cardLast4: MASTERCARD, older: { route: 'Nugegoda → Anuradhapura', tripDate: '2026-04-06' } },
  { paymentId: 'PAY-48876', orderId: 'ORD-0978', at: '2026-03-19T14:33:00', amount: 22100, status: 'paid', cardLast4: VISA, older: { route: 'Colombo 15 → Ratnapura', tripDate: '2026-03-21' } },
  { paymentId: 'PAY-48390', orderId: 'ORD-0975', at: '2026-03-03T09:51:00', amount: 11200, status: 'paid', cardLast4: VISA, older: { route: 'Colombo → Negombo', tripDate: '2026-03-04' } },
  { paymentId: 'PAY-47815', orderId: 'ORD-0972', at: '2026-02-18T15:12:00', amount: 28700, status: 'paid', cardLast4: VISA, older: { route: 'Colombo 15 → Matara', tripDate: '2026-02-20' } },
  { paymentId: 'PAY-47306', orderId: 'ORD-0969', at: '2026-02-04T10:40:00', amount: 26400, status: 'paid', cardLast4: MASTERCARD, older: { route: 'Colombo 15 → Kurunegala', tripDate: '2026-02-06' } },
  { paymentId: 'PAY-46783', orderId: 'ORD-0965', at: '2026-01-21T11:26:00', amount: 19900, status: 'paid', cardLast4: VISA, older: { route: 'Nugegoda → Galle', tripDate: '2026-01-23' } },
  { paymentId: 'PAY-46254', orderId: 'ORD-0962', at: '2026-01-08T09:15:00', amount: 23800, status: 'paid', cardLast4: VISA, older: { route: 'Colombo 15 → Kandy', tripDate: '2026-01-10' } },
]
