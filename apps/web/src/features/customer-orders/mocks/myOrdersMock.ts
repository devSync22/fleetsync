import type { CustomerOrderRow } from '../types'

/** A mock row plus the date it was placed, which the mock service uses for the period filter. */
export type MyOrderRecord = CustomerOrderRow & { placedOn: string }

/** "Today" in the mock data (the Figma frames are set on 20 Oct 2026). */
export const MOCK_TODAY = '2026-10-20'

type Row = [
  orderId: string,
  placedOn: string,
  placedLabel: string,
  route: string,
  cargo: string,
  pickupLabel: string,
  amount: number | null,
  status: CustomerOrderRow['status'],
]

/**
 * Orders placed by Lanka Tiles PLC, newest first.
 * The first 7 are the rows of "Customer — My orders" (157:5675); the rest fill page 2.
 */
const rows: Row[] = [
  ['ORD-1051', '2026-10-20', 'Today, 09:12', 'Colombo 15 → Matara', 'Tiles · 8 t', '23 Oct, 08:00', null, 'pending-review'],
  ['ORD-1049', '2026-10-17', '17 Oct', 'Nugegoda → Kurunegala', 'Tiles · 6.2 t', '21 Oct, 08:00', 31410, 'quoted'],
  ['ORD-1040', '2026-10-15', '15 Oct', 'Colombo → Kurunegala', 'Tiles · 9 t', 'Today, 08:00', 27900, 'in-progress'],
  ['ORD-1035', '2026-10-09', '9 Oct', 'Colombo → Galle', 'Tiles · 5.5 t', '12 Oct, 07:30', 19600, 'completed'],
  ['ORD-1031', '2026-10-02', '2 Oct', 'Colombo 15 → Kandy', 'Tiles · 7 t', '4 Oct, 06:30', 24300, 'completed'],
  ['ORD-1027', '2026-09-26', '26 Sep', 'Colombo 15 → Negombo', 'Tiles · 3 t', '28 Sep, 09:00', 11800, 'completed'],
  ['ORD-1022', '2026-09-20', '20 Sep', 'Colombo 15 → Jaffna', 'Tiles · 9 t', '—', 68500, 'declined'],
  ['ORD-1018', '2026-09-12', '12 Sep', 'Colombo 15 → Ratnapura', 'Tiles · 6 t', '15 Sep, 07:00', 22800, 'completed'],
  ['ORD-1014', '2026-09-04', '4 Sep', 'Nugegoda → Anuradhapura', 'Tiles · 8.5 t', '7 Sep, 06:00', 41200, 'completed'],
  ['ORD-1009', '2026-08-27', '27 Aug', 'Colombo 15 → Kalutara', 'Tiles · 4 t', '29 Aug, 08:30', 12600, 'completed'],
  ['ORD-1006', '2026-08-18', '18 Aug', 'Colombo → Badulla', 'Tiles · 7.5 t', '21 Aug, 06:00', 38900, 'completed'],
  ['ORD-1002', '2026-08-06', '6 Aug', 'Colombo 15 → Gampaha', 'Tiles · 2.5 t', '8 Aug, 10:00', 9400, 'completed'],
]

export const myOrdersMock: MyOrderRecord[] = rows.map(
  ([orderId, placedOn, placedLabel, route, cargo, pickupLabel, amount, status]) => ({
    orderId,
    placedOn,
    placedLabel,
    route,
    cargo,
    pickupLabel,
    amount,
    status,
  }),
)
