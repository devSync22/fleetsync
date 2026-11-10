import type {
  AttentionItem,
  DriverUpdate,
  TripCancellation,
  TripCreation,
  TripDetail,
  TripListItem,
} from '../types'

/**
 * Values copied from the Figma frames "Coordinator — Trips" (135:4698), "Trip details" (137:4699, 401:12975),
 * "Cancel trip" (138:4801, 401:13302), "Trip cancelled" (405:8350) and "Trip assigned" (130:4437).
 * Rows marked "placeholder" fill the tab counts the frame shows but whose rows it does not draw.
 */

type ListSeed = [
  tripId: string,
  orderId: string,
  customerName: string,
  route: string,
  vehiclePlate: string,
  driverName: string,
  mechanicName: string,
  scheduledAt: string,
]

const inProgress: [...ListSeed, startedAt: string, startOdometerKm: number][] = [
  ['TRP-2202', 'ORD-1040', 'Lanka Tiles PLC', 'Colombo → Kurunegala', 'WP LC-4410', 'Saman Wijesinghe', 'Sampath Kumara', '08:00', '08:15', 174330],
  ['TRP-2203', 'ORD-1041', 'Kandy Builders', 'Kandy → Colombo 03', 'CP LF-2210', 'Nuwan Herath', 'Sampath Kumara', '08:30', '08:40', 203790],
  ['TRP-2204', 'ORD-1047', 'Southern Fisheries', 'Matara → Colombo 15', 'SP LG-5521', 'Asanka Perera', 'Ishara Bandara', '09:00', '08:55', 61215],
  ['TRP-2201', 'ORD-1043', 'Colombo Pharma', 'Colombo → Galle', 'WP LD-3302', 'Ruwan Silva', 'Ishara Bandara', '09:15', '09:20', 98450],
  ['TRP-2205', 'ORD-1046', 'Ceylon Agro', 'Dambulla → Kandy', 'WP LC-1188', 'Mohamed Rizwan', 'Chaminda Fernando', '09:30', '09:41', 142880],
]

const assigned: [...ListSeed, notStartedOnTime: boolean][] = [
  // placeholder customer, route and vehicle; the frame only says "Scheduled for 09:30. Kasun has not tapped Start trip yet."
  ['TRP-2208', 'ORD-1036', 'Union Paper Mills', 'Horana → Colombo Port', 'NW LE-7730', 'Kasun Jayasinghe', 'Sampath Kumara', '09:30', true],
  ['TRP-2207', 'ORD-1045', 'Hayleys Freight', 'Kurunegala → Colombo 10', 'WP LB-4521', 'Kasun Jayasinghe', 'Chaminda Fernando', '22 Oct 07:00', false],
  // placeholder
  ['TRP-2209', 'ORD-1037', 'Kelani Beverages', 'Biyagama → Kandy', 'CP LK-6612', 'Tharindu Wijesinghe', 'Ishara Bandara', '14:00', false],
]

// placeholders — the frame shows a count of 2
const drafts: [tripId: string, orderId: string, customerName: string, route: string, scheduledAt: string][] = [
  ['TRP-2210', 'ORD-1038', 'Lanka Hardware Mart', 'Colombo 10 → Gampaha', '23 Oct 08:00'],
  ['TRP-2211', 'ORD-1039', 'Ruhuna Spices', 'Matara → Colombo 14', '23 Oct 10:30'],
]

// TRP-2206 is from the frame; the rest are placeholders for "Completed today 9 · 2 waiting for end odometer".
const completed: [...ListSeed, startedAt: string, startOdometerKm: number, endOdometerMissing: boolean][] = [
  ['TRP-2206', 'ORD-1034', 'Matale Spice Exports', 'Matale → Kandy', 'CP LH-1907', 'Dinesh Kumara', 'Chaminda Fernando', '06:30', '06:35', 88120, true],
  ['TRP-2200', 'ORD-1033', 'Ambewela Dairies', 'Nuwara Eliya → Colombo 05', 'CP LJ-2284', 'Chathura Samarasinghe', 'Sampath Kumara', '05:30', '05:40', 132600, true],
  ['TRP-2199', 'ORD-1032', 'Hayleys Freight', 'Colombo Port → Biyagama', 'WP LA-5012', 'Lahiru Weerasinghe', 'Ishara Bandara', '05:00', '05:05', 76540, false],
  ['TRP-2198', 'ORD-1031', 'Ceylon Agro', 'Ja-Ela → Kurunegala', 'NW LF-3390', 'Buddhika Herath', 'Chaminda Fernando', '05:15', '05:20', 54210, false],
  ['TRP-2197', 'ORD-1030', 'Kandy Builders', 'Kandy → Matale', 'CP LG-4471', 'Gayan Abeysekara', 'Sampath Kumara', '06:00', '06:02', 167300, false],
  ['TRP-2196', 'ORD-1029', 'Serendib Textiles', 'Ja-Ela → Colombo 10', 'WP LE-6120', 'Isuru Karunaratne', 'Ishara Bandara', '06:15', '06:20', 45980, false],
  ['TRP-2195', 'ORD-1028', 'Southern Fisheries', 'Galle → Colombo Fish Market', 'SP LH-7731', 'Upul Senanayake', 'Ishara Bandara', '04:30', '04:32', 112450, false],
  ['TRP-2194', 'ORD-1027', 'Lanka Tiles PLC', 'Colombo 15 → Kalutara', 'WP LK-8803', 'Janaka Wickramasinghe', 'Sampath Kumara', '05:45', '05:50', 98760, false],
  ['TRP-2193', 'ORD-1026', 'Colombo Pharma', 'Colombo 03 → Negombo', 'WP LB-9145', 'Roshan Gunawardena', 'Ishara Bandara', '07:00', '07:04', 39870, false],
]

export const tripListMock: TripListItem[] = [
  ...inProgress.map(([tripId, orderId, customerName, route, vehiclePlate, driverName, mechanicName, scheduledAt, startedAt, startOdometerKm]) => ({
    tripId, orderId, customerName, route, vehiclePlate, driverName, mechanicName, scheduledAt, startedAt, startOdometerKm,
    status: 'in-progress' as const,
  })),
  ...assigned.map(([tripId, orderId, customerName, route, vehiclePlate, driverName, mechanicName, scheduledAt, notStartedOnTime]) => ({
    tripId, orderId, customerName, route, vehiclePlate, driverName, mechanicName, scheduledAt,
    startedAt: null, startOdometerKm: null, status: 'assigned' as const, notStartedOnTime,
  })),
  ...drafts.map(([tripId, orderId, customerName, route, scheduledAt]) => ({
    tripId, orderId, customerName, route, scheduledAt,
    vehiclePlate: null, driverName: null, mechanicName: null, startedAt: null, startOdometerKm: null,
    status: 'draft' as const,
  })),
  ...completed.map(([tripId, orderId, customerName, route, vehiclePlate, driverName, mechanicName, scheduledAt, startedAt, startOdometerKm, endOdometerMissing]) => ({
    tripId, orderId, customerName, route, vehiclePlate, driverName, mechanicName, scheduledAt, startedAt, startOdometerKm,
    status: 'completed' as const, completedToday: true, endOdometerMissing,
  })),
  // placeholder — the frame shows a count of 1
  {
    tripId: 'TRP-2192', orderId: 'ORD-1025', customerName: 'Kandy Builders', route: 'Kandy → Nuwara Eliya',
    vehiclePlate: 'CP LF-2210', driverName: 'Nuwan Herath', mechanicName: 'Sampath Kumara',
    scheduledAt: '20 Oct 08:00', startedAt: null, startOdometerKm: null, status: 'cancelled',
  },
]

export const driverUpdatesMock: DriverUpdate[] = [
  { time: '10:05', driverName: 'Dinesh Kumara', action: 'completed', tripId: 'TRP-2206', detail: 'End odometer not entered yet' },
  { time: '09:41', driverName: 'Mohamed Rizwan', action: 'started', tripId: 'TRP-2205', detail: 'Start odometer 142,880 km' },
  { time: '09:20', driverName: 'Ruwan Silva', action: 'started', tripId: 'TRP-2201', detail: 'Start odometer 98,450 km' },
  { time: '08:55', driverName: 'Asanka Perera', action: 'started', tripId: 'TRP-2204', detail: 'Start odometer 61,215 km' },
  { time: '08:40', driverName: 'Nuwan Herath', action: 'started', tripId: 'TRP-2203', detail: 'Start odometer 203,790 km' },
  { time: '08:15', driverName: 'Saman Wijesinghe', action: 'started', tripId: 'TRP-2202', detail: 'Start odometer 174,330 km' },
]

export const attentionMock: AttentionItem[] = [
  {
    kind: 'not-started',
    title: 'TRP-2208 has not started',
    description: 'Scheduled for 09:30. Kasun has not tapped Start trip yet.',
    action: { label: 'Open chat', to: '/coordinator/chat?trip=TRP-2208' },
  },
  {
    kind: 'notification-not-opened',
    title: 'Notification not opened',
    description: 'Chaminda Fernando has not opened TRP-2207.',
    action: { label: 'Resend' },
  },
  {
    kind: 'odometer-missing',
    title: 'End odometer missing',
    description: 'TRP-2206 was completed without an end odometer reading.',
    action: { label: 'View trip', to: '/coordinator/trips/TRP-2206' },
  },
]

const trp2203Base: TripDetail = {
  tripId: 'TRP-2203',
  status: 'in-progress',
  orderId: 'ORD-1041',
  customerName: 'Kandy Builders',
  route: 'Kandy → Colombo 03',
  pickedUpAt: null,
  pickup: { place: 'Kandy Builders yard, Peradeniya Road, Kandy', note: 'Scheduled 08:30' },
  destination: { place: 'Site office, Galle Road, Colombo 03', note: 'Unloading by site crew' },
  cargo: 'Cement, 230 bags',
  weight: '11.5 t',
  distance: '116 km',
  tripWindow: '08:30 – 13:00',
  vehicle: { plate: 'CP LF-2210', description: 'Ashok Leyland Ecomet · 14 t' },
  driver: { name: 'Nuwan Herath', initials: 'NH', code: 'DRV-018', licence: 'heavy vehicle licence', phone: '077 318 5521' },
  mechanic: { name: 'Sampath Kumara', initials: 'SK', code: 'MEC-009', workshop: 'Kurunegala workshop' },
  customerContact: 'Ravindu Silva · 071 448 2210',
  paymentStatus: 'paid',
  quotedFare: 34200,
  odometer: { startKm: 203790, endKm: null },
  note: {
    text: 'Site crew unloads after 11:00. Driver to call Ravindu on arrival at the gate.',
    addedBy: 'Added by Nimal Perera · 18 Oct',
  },
  lifecycle: [
    { label: 'Draft', detail: 'Order reviewed', time: '18 Oct, 15:10', state: 'done' },
    { label: 'Assigned', detail: 'CP LF-2210 · Nuwan Herath', time: '18 Oct, 16:20', state: 'done' },
    { label: 'In progress', detail: 'Started at 203,790 km', time: 'Today, 08:40', state: 'current' },
    { label: 'Cargo picked up', detail: 'Driver is at the pickup', time: null, state: 'upcoming' },
    { label: 'Completed', detail: 'Waiting for end odometer', time: null, state: 'upcoming' },
  ],
  activity: [
    { time: '08:40', title: 'Nuwan Herath started the trip', detail: 'Start odometer 203,790 km' },
    { time: '07:58', title: 'Nuwan Herath opened the trip notification', detail: 'Driver app' },
    { time: '18 Oct, 16:24', title: 'Sampath Kumara opened the trip notification', detail: 'Mechanic app' },
    { time: '18 Oct, 16:20', title: 'Nimal Perera created the trip', detail: 'Assigned CP LF-2210, Nuwan Herath and Sampath Kumara' },
    { time: '18 Oct, 15:10', title: 'Payment received for ORD-1041', detail: 'LKR 34,200 · online' },
  ],
}

/** TRP-2203 before the cargo is picked up (401:12975) — it can still be cancelled. */
export const trp2203BeforePickup = trp2203Base

/** TRP-2203 after pickup at 09:05 (137:4699) — cancelling is no longer allowed. Preview with `?mock=picked-up`. */
export const trp2203PickedUp: TripDetail = {
  ...trp2203Base,
  pickedUpAt: '09:05',
  lifecycle: [
    ...trp2203Base.lifecycle.slice(0, 2),
    { label: 'In progress', detail: 'Started at 203,790 km', time: 'Today, 08:40', state: 'done' },
    { label: 'Cargo picked up', detail: '230 bags loaded · seal 22871', time: 'Today, 09:05', state: 'done' },
    { label: 'Completed', detail: 'Waiting for end odometer', time: null, state: 'upcoming' },
  ],
  activity: [
    { time: '09:05', title: 'Nuwan Herath picked up the cargo', detail: '230 bags loaded · seal 22871 · Driver app' },
    ...trp2203Base.activity,
  ],
}

export const trp2207: TripDetail = {
  tripId: 'TRP-2207',
  status: 'assigned',
  orderId: 'ORD-1045',
  customerName: 'Hayleys Freight',
  route: 'Kurunegala → Colombo 10',
  pickedUpAt: null,
  pickup: { place: 'Hayleys yard, Puttalam Road, Kurunegala', note: 'Scheduled 22 Oct, 07:00' },
  destination: { place: 'Hayleys Freight terminal, Colombo 10', note: 'Gate pass needed at entry' },
  cargo: 'General cargo, 18 pallets',
  weight: '12 t',
  distance: '94 km',
  tripWindow: '07:00 – 12:30',
  vehicle: { plate: 'WP LB-4521', description: 'Isuzu Forward · 16 t' },
  driver: { name: 'Kasun Jayasinghe', initials: 'KJ', code: 'DRV-014', licence: 'heavy vehicle licence', phone: null },
  mechanic: { name: 'Chaminda Fernando', initials: 'CF', code: 'MEC-005', workshop: 'Kurunegala workshop' },
  customerContact: 'Shehan Fonseka · 077 902 3341',
  paymentStatus: 'paid',
  quotedFare: 29800,
  odometer: { startKm: null, endKm: null },
  note: {
    text: 'Gate pass required at the Colombo 10 terminal. Driver to collect it from the office.',
    addedBy: 'Added by Nimal Perera · 19 Oct',
  },
  lifecycle: [
    { label: 'Draft', detail: 'Order reviewed', time: '19 Oct, 09:50', state: 'done' },
    { label: 'Assigned', detail: 'WP LB-4521 · Kasun Jayasinghe', time: '19 Oct, 10:14', state: 'current' },
    { label: 'In progress', detail: 'Driver has not started', time: '22 Oct, 07:00', state: 'upcoming' },
    { label: 'Completed', detail: 'Waiting for end odometer', time: null, state: 'upcoming' },
  ],
  activity: [
    { time: '19 Oct, 10:20', title: 'Kasun Jayasinghe opened the trip notification', detail: 'Driver app' },
    { time: '19 Oct, 10:14', title: 'Nimal Perera created the trip', detail: 'Assigned WP LB-4521, Kasun Jayasinghe and Chaminda Fernando' },
    { time: '19 Oct, 09:50', title: 'Payment received for ORD-1045', detail: 'LKR 29,800 · online' },
  ],
}

/** The "Trip cancelled" frame (405:8350), shown when TRP-2203 is opened there directly. */
export const trp2203Cancellation: TripCancellation = {
  tripId: 'TRP-2203',
  orderId: 'ORD-1041',
  customerName: 'Kandy Builders',
  pickedUp: false,
  statusWhenCancelled: 'In progress, before pickup',
  cancelledBy: 'Nimal Perera · 08:58',
  reason: 'Kandy Builders postponed the delivery to next week. They will place a new order when the site is ready.',
  vehiclePlate: 'CP LF-2210',
  driverName: 'Nuwan Herath',
  mechanicName: 'Sampath Kumara',
  startOdometerKm: 203790,
  refund: 34200,
  notifications: [
    { name: 'Nuwan Herath', initials: 'NH', role: 'Driver · DRV-018', sentTo: 'Driver app', sentAt: '08:58', status: 'opened' },
    { name: 'Sampath Kumara', initials: 'SK', role: 'Mechanic · MEC-009', sentTo: 'Mechanic app', sentAt: '08:58', status: 'not-opened' },
    { name: 'Kandy Builders', initials: 'KB', role: 'Customer · Ravindu Silva', sentTo: 'Email and app', sentAt: '08:58', status: 'delivered' },
  ],
  driverPreview: {
    title: 'Trip cancelled · TRP-2203',
    body: 'Kandy Builders postponed the delivery. Stop the trip and call Nimal for next steps.',
  },
}

/** The "Trip assigned" frame (130:4437), shown when TRP-2207 is opened there directly. */
export const trp2207Creation: TripCreation = {
  tripId: 'TRP-2207',
  orderId: 'ORD-1045',
  customerName: 'Hayleys Freight',
  route: 'Kurunegala → Colombo 10',
  startLabel: '22 Oct at 07:00',
  tripWindow: '22 Oct, 07:00 – 12:30',
  cargo: '12 t general cargo',
  vehiclePlate: 'WP LB-4521',
  driverName: 'Kasun Jayasinghe',
  mechanicName: 'Chaminda Fernando',
  createdBy: 'Nimal Perera · 10:14',
  notifications: [
    { name: 'Kasun Jayasinghe', initials: 'KJ', role: 'Driver · DRV-014', sentTo: 'Driver app', sentAt: '10:14', status: 'opened' },
    { name: 'Chaminda Fernando', initials: 'CF', role: 'Mechanic · MEC-005', sentTo: 'Mechanic app', sentAt: '10:14', status: 'not-opened' },
  ],
  driverPreview: {
    title: 'New trip assigned · TRP-2207',
    body: 'Kurunegala → Colombo 10 · 22 Oct, 07:00 · Vehicle WP LB-4521. Tap to view the trip.',
  },
}
