import type { OrderStatus, PaymentStatus, QuotationInfo, SubmittedOrder } from '../types'

/**
 * From the "Coordinator — Submitted orders" frames: 122:4080 (All open), 510:11470 (Needs quotation),
 * 510:11983 (Quoted), 510:12458 (Ready for a trip) and 510:12957 (Closed).
 *
 * Where the frames disagree, the tab frames win:
 * - ORD-1049 is "Pending review" (the Review order frame); sending its quote moves it to Quoted, which is
 *   the state the Quoted frame shows.
 * - ORD-1041 has TRP-2203 running in the Trips frames, so it is "Trip created" here rather than the
 *   "Trip cancelled" the Closed frame shows after that trip is cancelled.
 * The Closed frame says 212 orders; only the 7 it draws are here.
 */
type Seed = [
  orderId: string,
  submittedLabel: string,
  customerName: string,
  route: string,
  routeNote: string,
  cargo: string,
  cargoAmount: string,
  payment: PaymentStatus,
  status: OrderStatus,
]

const pickupDate = (note: string) => note.match(/(\d{1,2} \w{3})/)?.[1] ?? ''

const quotations: Record<string, QuotationInfo> = {
  'ORD-1046': { amount: 24600, openedLabel: 'Opened 2 times', expiresInMinutes: 55 },
  'ORD-1039': { amount: 36200, openedLabel: 'Opened today', expiresInMinutes: null },
  'ORD-1037': { amount: 41900, openedLabel: 'Opened yesterday', expiresInMinutes: null },
}

const trips: Record<string, string> = { 'ORD-1041': 'TRP-2203' }

const seeds: Seed[] = [
  // Needs quotation
  ['ORD-1054', 'Today, 11:05', 'Ceylon Agro Ltd', 'Ja-Ela → Dambulla', 'Pickup 26 Oct, 08:00', 'Machinery · 3 items', '4.2 t', 'not-due', 'pending-review'],
  ['ORD-1053', 'Today, 10:51', 'Kandy Builders', 'Peliyagoda → Kandy', 'Pickup 25 Oct, 07:30', 'Cement · 230 bags', '11.5 t', 'not-due', 'pending-review'],
  ['ORD-1052', 'Today, 10:44', 'Nova Electricals', 'Wellampitiya → Galle', 'Pickup 24 Oct, 09:00', 'Electrical · 120 cartons', '1.8 t', 'not-due', 'pending-review'],
  ['ORD-1049', 'Today, 10:42', 'Lanka Tiles PLC', 'Nugegoda → Kurunegala', 'Pickup 21 Oct, 08:00', 'Tiles · 12 pallets', '6.2 t', 'not-due', 'pending-review'],
  ['ORD-1048', 'Today, 09:15', 'Kandy Builders', 'Kandy → Matale', 'Pickup 20 Oct, 14:00', 'Cement bags', '4 t', 'not-due', 'pending-review'],
  ['ORD-1047', 'Today, 08:02', 'Southern Fisheries', 'Galle → Colombo', 'Pickup 20 Oct, 05:30', 'Chilled seafood', '2.5 t', 'not-due', 'pending-review'],
  // Quoted
  ['ORD-1046', 'Yesterday', 'Ceylon Agro Ltd', 'Negombo → Galle', 'Pickup 22 Oct, 07:00', 'Fresh produce', '3 pallets', 'not-due', 'quoted'],
  ['ORD-1039', '17 Oct', 'Matale Spice Exports', 'Matale → Colombo Port', 'Pickup 23 Oct, 06:00', 'Spices · containers', '5 t', 'not-due', 'quoted'],
  ['ORD-1037', '17 Oct', 'Southern Fisheries', 'Matara → Colombo 15', 'Pickup 24 Oct, 05:00', 'Chilled seafood', '3 t', 'not-due', 'quoted'],
  // Accepted — paid ones are "Ready for a trip"
  ['ORD-1045', 'Yesterday', 'Hayleys Freight', 'Kurunegala → Colombo 10', 'Pickup 22 Oct, 07:00', 'General freight', '12 t', 'paid', 'accepted'],
  ['ORD-1044', 'Yesterday', 'Colombo Pharma', 'Colombo 03 → Negombo', 'Pickup 20 Oct, 10:00', 'Medicines · cold chain', '0.8 t', 'paid', 'accepted'],
  ['ORD-1035', '17 Oct', 'Lanka Tiles PLC', 'Colombo 15 → Matara', 'Pickup 23 Oct, 08:00', 'Tiles · 16 pallets', '8 t', 'paid', 'accepted'],
  ['ORD-1032', '16 Oct', 'Matale Spice Exports', 'Matale → Kandy', 'Pickup 24 Oct, 06:30', 'Spices · bags', '3.5 t', 'paid', 'accepted'],
  ['ORD-1031', '16 Oct', 'Ceylon Agro Ltd', 'Ja-Ela → Kurunegala', 'Pickup 25 Oct, 07:00', 'Fertiliser · bags', '9 t', 'paid', 'accepted'],
  ['ORD-1042', '17 Oct', 'Matale Spice Exports', 'Matale → Colombo Port', 'Pickup 21 Oct, 06:00', 'Spices · containers', '5 t', 'payment-failed', 'accepted'],
  // Trip running
  ['ORD-1041', '16 Oct', 'Kandy Builders', 'Kandy → Colombo 03', 'Pickup today, 08:30', 'Cement · 230 bags', '11.5 t', 'paid', 'trip-created'],
  // Closed
  ['ORD-1043', '17 Oct', 'Lanka Tiles PLC', 'Colombo Port → Kandy', 'Delivered 19 Oct, 11:40', 'Tiles · palletised', '8 t', 'paid', 'completed'],
  ['ORD-1040', '15 Oct', 'Lanka Tiles PLC', 'Colombo → Kurunegala', 'Delivered 24 Oct, 12:05', 'Tiles', '9 t', 'paid', 'completed'],
  ['ORD-1038', '14 Oct', 'Hayleys Freight', 'Kurunegala → Colombo 10', 'Delivered 24 Oct, 10:20', 'General freight', '10 t', 'paid', 'completed'],
  ['ORD-1036', '13 Oct', 'Ceylon Agro Ltd', 'Ja-Ela → Dambulla', 'Delivered 23 Oct, 13:30', 'Machinery', '4 t', 'paid', 'completed'],
  ['ORD-1033', '12 Oct', 'Kandy Builders', 'Peliyagoda → Kandy', 'Quotation expired 14 Oct', 'Steel bars', '7 t', 'no-payment', 'quotation-expired'],
  ['ORD-1030', '11 Oct', 'Southern Fisheries', 'Galle → Colombo', 'Declined 12 Oct', 'Chilled seafood', '2 t', 'no-payment', 'declined'],
  ['ORD-1028', '10 Oct', 'Nova Electricals', 'Wellampitiya → Kandy', 'Delivered 13 Oct, 15:10', 'Electrical · cartons', '2.1 t', 'paid', 'completed'],
]

export const submittedOrdersMock: SubmittedOrder[] = seeds.map(
  ([orderId, submittedLabel, customerName, route, routeNote, cargo, cargoAmount, payment, status]) => ({
    orderId,
    submittedLabel,
    customerName,
    route,
    routeNote,
    pickupDate: routeNote.startsWith('Pickup') ? pickupDate(routeNote) : '',
    cargo,
    cargoAmount,
    payment,
    status,
    quotation: quotations[orderId] ?? null,
    tripId: trips[orderId] ?? null,
  }),
)
