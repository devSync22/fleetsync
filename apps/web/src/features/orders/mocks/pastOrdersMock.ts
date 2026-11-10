import type { OrderDetail, VehicleClass } from '../types'

/**
 * Details for the orders past review (Quoted, Accepted, Trip created and Closed rows of Submitted orders).
 * There is no frame for these, so addresses, cargo, fares and dates are placeholders made to agree with the
 * list rows: the three Quoted totals match the list (24,600 / 36,200 / 41,900) and TRP-2203 matches Trips.
 */

export const customerDirectory: Record<string, OrderDetail['customer']> = {
  'Lanka Tiles PLC': { contact: 'Dilini Perera · 077 214 5590', email: 'orders@lankatiles.lk', customerSince: 'Feb 2025 · 14 orders' },
  'Kandy Builders': { contact: 'Ravindu Silva · 077 318 2264', email: 'orders@kandybuilders.lk', customerSince: 'Mar 2024 · 22 orders' },
  'Nova Electricals': { contact: 'Ruwan Silva · 077 455 2310', email: 'orders@novaelectricals.lk', customerSince: 'Jun 2024 · 9 orders' },
  'Ceylon Agro Ltd': { contact: 'Nuwan Perera · 077 602 1189', email: 'ops@ceylonagro.lk', customerSince: 'Oct 2025 · 3 orders' },
  'Southern Fisheries': { contact: 'Pradeep Senanayake · 091 223 4410', email: 'dispatch@southernfisheries.lk', customerSince: 'Jan 2025 · 31 orders' },
  'Matale Spice Exports': { contact: 'Chamari Wijesinghe · 066 222 8174', email: 'logistics@matalespice.lk', customerSince: 'Aug 2024 · 17 orders' },
  'Hayleys Freight': { contact: 'Asela Gunawardena · 011 762 3300', email: 'bookings@hayleysfreight.lk', customerSince: 'Nov 2023 · 46 orders' },
  'Colombo Pharma': { contact: 'Dr. Shanika Fernando · 077 890 4412', email: 'supply@colombopharma.lk', customerSince: 'May 2025 · 6 orders' },
}

/** What happened after the quotation was sent. */
type Outcome =
  | { kind: 'awaiting'; opened: string | null }
  | { kind: 'paid'; opened: string; at: string; trip?: { id: string; at: string }; delivered?: string }
  | { kind: 'payment-failed'; opened: string; at: string }
  | { kind: 'declined'; opened: string; at: string; reason: string }
  | { kind: 'expired'; opened: string | null; at: string }

export interface PastOrder {
  orderId: string
  submittedAt: string
  pickupPlace: string
  pickupWhen: string
  destinationPlace: string
  destinationWhen: string
  distanceKm: number
  cargo: OrderDetail['cargo']
  vehicleClass: VehicleClass
  /** Fare lines besides the distance charge: [label, detail, amount]. */
  extras: [string, string, number][]
  quotation: { sentAt: string; validUntil: string; message: string }
  outcome: Outcome
}

const cargo = (
  type: string,
  weight: string,
  unitsLabel: string,
  units: string,
  handling: string,
  note: string | null = null,
): OrderDetail['cargo'] => ({ type, weight, unitsLabel, units, handling, note })

export const pastOrdersMock: PastOrder[] = [
  // Quoted
  {
    orderId: 'ORD-1046',
    submittedAt: 'Yesterday, 16:40',
    pickupPlace: 'Ceylon Agro collection centre, Chilaw Road, Negombo',
    pickupWhen: '22 Oct 2026, 07:00',
    destinationPlace: 'Galle Central Market, Main Street, Galle',
    destinationWhen: 'Same day, before 12:00',
    distanceKm: 148,
    cargo: cargo('Fresh produce, palletised', '3 pallets · 1.4 t', 'Pallets', '3 pallets · 1.2 × 1.0 m', 'Ventilated, keep out of sun'),
    vehicleClass: 'light-5',
    extras: [
      ['Loading and unloading', '3 pallets', 900],
      ['Ventilated truck', 'Fresh produce', 600],
      ['Tolls and fees', 'Southern Expressway', 900],
    ],
    quotation: { sentAt: 'Yesterday, 18:55', validUntil: '2026-10-20T19:50', message: 'Includes loading at Negombo and unloading at the market.' },
    outcome: { kind: 'awaiting', opened: 'Today, 09:10' },
  },
  {
    orderId: 'ORD-1039',
    submittedAt: '17 Oct, 09:30',
    pickupPlace: 'Matale Spice Exports warehouse, Trincomalee Road, Matale',
    pickupWhen: '23 Oct 2026, 06:00',
    destinationPlace: 'Colombo Port, Gate 4 (export cargo)',
    destinationWhen: 'Same day, before 14:00',
    distanceKm: 142,
    cargo: cargo('Spices in sealed containers', '5 t', 'Containers', '40 sealed drums · 120 kg each', 'Keep dry, export seals intact', 'Export documents travel with the driver. Port gate pass will be emailed the day before.'),
    vehicleClass: 'heavy-9',
    extras: [
      ['Load charge', '5 t', 3000],
      ['Loading and unloading', '40 drums', 1600],
      ['Port gate fee', 'Colombo Port', 1780],
    ],
    quotation: { sentAt: '17 Oct, 15:10', validUntil: '2026-10-21T18:00', message: 'Port gate fee is included. Pickup at 06:00 to reach the port before the export cut-off.' },
    outcome: { kind: 'awaiting', opened: 'Today, 08:42' },
  },
  {
    orderId: 'ORD-1037',
    submittedAt: '17 Oct, 08:15',
    pickupPlace: 'Southern Fisheries cold store, Harbour Road, Matara',
    pickupWhen: '24 Oct 2026, 05:00',
    destinationPlace: 'Fish market, St. Anthony’s Mawatha, Colombo 15',
    destinationWhen: 'Same day, before 10:00',
    distanceKm: 162,
    cargo: cargo('Chilled seafood in ice boxes', '3 t', 'Boxes', '60 insulated boxes', 'Refrigerated, 0–4 °C'),
    vehicleClass: 'light-5',
    extras: [
      ['Refrigerated truck', '0–4 °C', 12000],
      ['Load charge', '3 t', 1800],
      ['Loading and unloading', '60 boxes', 1500],
      ['Tolls and fees', 'Southern Expressway', 2300],
    ],
    quotation: { sentAt: '17 Oct, 13:20', validUntil: '2026-10-22T12:00', message: 'Refrigerated truck at 0–4 °C for the whole trip.' },
    outcome: { kind: 'awaiting', opened: 'Yesterday, 17:30' },
  },
  // Accepted and paid — ready for a trip
  {
    orderId: 'ORD-1045',
    submittedAt: 'Yesterday, 09:05',
    pickupPlace: 'Hayleys Freight yard, Puttalam Road, Kurunegala',
    pickupWhen: '22 Oct 2026, 07:00',
    destinationPlace: 'Hayleys warehouse, Baseline Road, Colombo 10',
    destinationWhen: 'Same day, before 13:00',
    distanceKm: 94,
    cargo: cargo('General freight, palletised', '12 t', 'Pallets', '18 pallets', 'Standard'),
    vehicleClass: 'heavy-14',
    extras: [
      ['Load charge', '12 t', 7200],
      ['Loading and unloading', '18 pallets', 3000],
      ['Tolls and fees', 'Expressway', 1100],
    ],
    quotation: { sentAt: 'Yesterday, 11:30', validUntil: '2026-10-19T18:00', message: '' },
    outcome: { kind: 'paid', opened: 'Yesterday, 12:02', at: 'Yesterday, 12:10' },
  },
  {
    orderId: 'ORD-1044',
    submittedAt: 'Yesterday, 08:20',
    pickupPlace: 'Colombo Pharma stores, Galle Road, Colombo 03',
    pickupWhen: '20 Oct 2026, 10:00',
    destinationPlace: 'District hospital pharmacy, Negombo',
    destinationWhen: 'Same day, before 13:00',
    distanceKm: 38,
    cargo: cargo('Medicines, cold chain', '0.8 t', 'Cartons', '42 insulated cartons', 'Refrigerated, 2–8 °C', 'Hand over to the chief pharmacist only.'),
    vehicleClass: 'light-5',
    extras: [
      ['Cold chain truck', '2–8 °C', 6500],
      ['Loading and unloading', '42 cartons', 800],
      ['Tolls and fees', 'Katunayake Expressway', 600],
    ],
    quotation: { sentAt: 'Yesterday, 10:15', validUntil: '2026-10-19T16:00', message: 'Temperature log is shared with you after delivery.' },
    outcome: { kind: 'paid', opened: 'Yesterday, 10:40', at: 'Yesterday, 10:52' },
  },
  {
    orderId: 'ORD-1035',
    submittedAt: '17 Oct, 07:50',
    pickupPlace: 'Lanka Tiles showroom yard, Colombo 15',
    pickupWhen: '23 Oct 2026, 08:00',
    destinationPlace: 'Lanka Tiles dealer, Anagarika Dharmapala Mawatha, Matara',
    destinationWhen: 'Same day, before 15:00',
    distanceKm: 165,
    cargo: cargo('Ceramic tiles, palletised', '8 t', 'Pallets', '16 pallets · 1.2 × 1.0 m', 'Fragile, keep upright'),
    vehicleClass: 'heavy-9',
    extras: [
      ['Load charge', '8 t', 4800],
      ['Loading and unloading', '16 pallets', 4000],
      ['Fragile handling', 'Keep upright', 2500],
      ['Tolls and fees', 'Southern Expressway', 2300],
    ],
    quotation: { sentAt: '17 Oct, 11:05', validUntil: '2026-10-19T18:00', message: '' },
    outcome: { kind: 'paid', opened: '17 Oct, 14:20', at: '17 Oct, 14:31' },
  },
  {
    orderId: 'ORD-1032',
    submittedAt: '16 Oct, 10:10',
    pickupPlace: 'Matale Spice Exports warehouse, Trincomalee Road, Matale',
    pickupWhen: '24 Oct 2026, 06:30',
    destinationPlace: 'Spice packing centre, Katugastota Road, Kandy',
    destinationWhen: 'Same day, before 09:30',
    distanceKm: 27,
    cargo: cargo('Spices in bags', '3.5 t', 'Bags', '70 bags · 50 kg each', 'Keep dry, covered truck'),
    vehicleClass: 'light-5',
    extras: [
      ['Load charge', '3.5 t', 2100],
      ['Loading and unloading', '70 bags', 1400],
    ],
    quotation: { sentAt: '16 Oct, 13:40', validUntil: '2026-10-18T18:00', message: '' },
    outcome: { kind: 'paid', opened: '16 Oct, 15:05', at: '16 Oct, 15:12' },
  },
  {
    orderId: 'ORD-1031',
    submittedAt: '16 Oct, 08:45',
    pickupPlace: 'Ceylon Agro fertiliser store, Ja-Ela',
    pickupWhen: '25 Oct 2026, 07:00',
    destinationPlace: 'Agrarian service centre, Kurunegala',
    destinationWhen: 'Same day, before 12:00',
    distanceKm: 82,
    cargo: cargo('Fertiliser in bags', '9 t', 'Bags', '180 bags · 50 kg each', 'Keep dry, covered truck'),
    vehicleClass: 'heavy-9',
    extras: [
      ['Load charge', '9 t', 5400],
      ['Loading and unloading', '180 bags', 3600],
      ['Covered truck', 'Keep dry', 1500],
    ],
    quotation: { sentAt: '16 Oct, 11:20', validUntil: '2026-10-18T18:00', message: '' },
    outcome: { kind: 'paid', opened: '16 Oct, 16:40', at: '16 Oct, 16:48' },
  },
  // Accepted, card payment failed
  {
    orderId: 'ORD-1042',
    submittedAt: '17 Oct, 08:55',
    pickupPlace: 'Matale Spice Exports warehouse, Trincomalee Road, Matale',
    pickupWhen: '21 Oct 2026, 06:00',
    destinationPlace: 'Colombo Port, Gate 4 (export cargo)',
    destinationWhen: 'Same day, before 14:00',
    distanceKm: 142,
    cargo: cargo('Spices in sealed containers', '5 t', 'Containers', '40 sealed drums · 120 kg each', 'Keep dry, export seals intact'),
    vehicleClass: 'heavy-9',
    extras: [
      ['Load charge', '5 t', 3000],
      ['Loading and unloading', '40 drums', 1600],
      ['Port gate fee', 'Colombo Port', 1780],
    ],
    quotation: { sentAt: '17 Oct, 10:30', validUntil: '2026-10-19T18:00', message: 'Port gate fee is included.' },
    outcome: { kind: 'payment-failed', opened: '17 Oct, 12:15', at: '17 Oct, 12:22' },
  },
  // Trip running
  {
    orderId: 'ORD-1041',
    submittedAt: '16 Oct, 09:40',
    pickupPlace: 'Kandy Builders depot, Katugastota Road, Kandy',
    pickupWhen: 'Today, 08:30',
    destinationPlace: 'Construction site, Flower Road, Colombo 03',
    destinationWhen: 'Same day, before 15:00',
    distanceKm: 118,
    cargo: cargo('Cement, in bags', '11.5 t', 'Bags', '230 bags · 50 kg each', 'Keep dry, covered truck'),
    vehicleClass: 'heavy-14',
    extras: [
      ['Load charge', '11.5 t', 6900],
      ['Loading and unloading', '230 bags', 4600],
      ['Covered truck', 'Keep dry', 1500],
    ],
    quotation: { sentAt: '16 Oct, 12:05', validUntil: '2026-10-18T18:00', message: '' },
    outcome: { kind: 'paid', opened: '16 Oct, 13:10', at: '16 Oct, 13:18', trip: { id: 'TRP-2203', at: '17 Oct, 09:00' } },
  },
  // Closed
  {
    orderId: 'ORD-1043',
    submittedAt: '17 Oct, 07:30',
    pickupPlace: 'Colombo Port, Gate 2 (import cargo)',
    pickupWhen: '19 Oct 2026, 06:30',
    destinationPlace: 'Lanka Tiles dealer, Peradeniya Road, Kandy',
    destinationWhen: '19 Oct, before 13:00',
    distanceKm: 116,
    cargo: cargo('Ceramic tiles, palletised', '8 t', 'Pallets', '16 pallets', 'Fragile, keep upright'),
    vehicleClass: 'heavy-9',
    extras: [
      ['Load charge', '8 t', 4800],
      ['Loading and unloading', '16 pallets', 3000],
      ['Fragile handling', 'Keep upright', 2500],
      ['Port gate fee', 'Colombo Port', 1780],
    ],
    quotation: { sentAt: '17 Oct, 09:10', validUntil: '2026-10-18T12:00', message: '' },
    outcome: { kind: 'paid', opened: '17 Oct, 09:40', at: '17 Oct, 09:46', trip: { id: 'TRP-2190', at: '17 Oct, 11:00' }, delivered: '19 Oct, 11:40' },
  },
  {
    orderId: 'ORD-1040',
    submittedAt: '15 Oct, 10:00',
    pickupPlace: 'Lanka Tiles showroom yard, Colombo 15',
    pickupWhen: '24 Oct 2026, 07:00',
    destinationPlace: 'Kurunegala Distribution Yard, Dambulla Road',
    destinationWhen: '24 Oct, before 13:00',
    distanceKm: 94,
    cargo: cargo('Ceramic tiles', '9 t', 'Pallets', '18 pallets', 'Fragile, keep upright'),
    vehicleClass: 'heavy-9',
    extras: [
      ['Load charge', '9 t', 5400],
      ['Loading and unloading', '18 pallets', 3000],
      ['Fragile handling', 'Keep upright', 2500],
      ['Tolls and fees', 'Expressway', 1100],
    ],
    quotation: { sentAt: '15 Oct, 12:30', validUntil: '2026-10-17T18:00', message: '' },
    outcome: { kind: 'paid', opened: '15 Oct, 14:00', at: '15 Oct, 14:06', trip: { id: 'TRP-2186', at: '16 Oct, 10:15' }, delivered: '24 Oct, 12:05' },
  },
  {
    orderId: 'ORD-1038',
    submittedAt: '14 Oct, 09:20',
    pickupPlace: 'Hayleys Freight yard, Puttalam Road, Kurunegala',
    pickupWhen: '24 Oct 2026, 06:30',
    destinationPlace: 'Hayleys warehouse, Baseline Road, Colombo 10',
    destinationWhen: '24 Oct, before 12:00',
    distanceKm: 94,
    cargo: cargo('General freight, palletised', '10 t', 'Pallets', '15 pallets', 'Standard'),
    vehicleClass: 'heavy-14',
    extras: [
      ['Load charge', '10 t', 6000],
      ['Loading and unloading', '15 pallets', 3000],
      ['Tolls and fees', 'Expressway', 1100],
    ],
    quotation: { sentAt: '14 Oct, 11:00', validUntil: '2026-10-16T18:00', message: '' },
    outcome: { kind: 'paid', opened: '14 Oct, 11:45', at: '14 Oct, 11:52', trip: { id: 'TRP-2181', at: '15 Oct, 09:30' }, delivered: '24 Oct, 10:20' },
  },
  {
    orderId: 'ORD-1036',
    submittedAt: '13 Oct, 14:10',
    pickupPlace: 'Ceylon Agro machinery yard, Ja-Ela',
    pickupWhen: '23 Oct 2026, 07:00',
    destinationPlace: 'Ceylon Agro farm, Kandalama Road, Dambulla',
    destinationWhen: '23 Oct, before 14:00',
    distanceKm: 138,
    cargo: cargo('Farm machinery', '4 t', 'Items', '2 power tillers, 1 thresher', 'Strap down, crane at pickup'),
    vehicleClass: 'light-5',
    extras: [
      ['Load charge', '4 t', 2400],
      ['Machinery handling', '3 items', 3500],
    ],
    quotation: { sentAt: '13 Oct, 16:00', validUntil: '2026-10-15T18:00', message: '' },
    outcome: { kind: 'paid', opened: '14 Oct, 08:30', at: '14 Oct, 08:41', trip: { id: 'TRP-2178', at: '14 Oct, 10:00' }, delivered: '23 Oct, 13:30' },
  },
  {
    orderId: 'ORD-1033',
    submittedAt: '12 Oct, 11:30',
    pickupPlace: 'Steel stores, Base Line Road, Peliyagoda',
    pickupWhen: '15 Oct 2026, 07:00',
    destinationPlace: 'Site office, Peradeniya Road, Kandy',
    destinationWhen: '15 Oct, before 13:00',
    distanceKm: 116,
    cargo: cargo('Steel reinforcement bars', '7 t', 'Bundles', '28 bundles · 12 m', 'Long load, flatbed'),
    vehicleClass: 'heavy-9',
    extras: [
      ['Load charge', '7 t', 4200],
      ['Loading and unloading', '28 bundles', 2800],
    ],
    quotation: { sentAt: '12 Oct, 14:00', validUntil: '2026-10-14T12:00', message: '' },
    outcome: { kind: 'expired', opened: '12 Oct, 18:20', at: '14 Oct, 12:00' },
  },
  {
    orderId: 'ORD-1030',
    submittedAt: '11 Oct, 08:00',
    pickupPlace: 'Southern Fisheries cold store, Galle Harbour',
    pickupWhen: '13 Oct 2026, 05:00',
    destinationPlace: 'Peliyagoda central fish market, Colombo',
    destinationWhen: '13 Oct, before 09:00',
    distanceKm: 119,
    cargo: cargo('Chilled seafood in ice boxes', '2 t', 'Boxes', '40 insulated boxes', 'Refrigerated, 0–4 °C'),
    vehicleClass: 'light-5',
    extras: [
      ['Refrigerated truck', '0–4 °C', 9000],
      ['Load charge', '2 t', 1200],
      ['Tolls and fees', 'Southern Expressway', 1800],
    ],
    quotation: { sentAt: '11 Oct, 10:30', validUntil: '2026-10-12T18:00', message: '' },
    outcome: { kind: 'declined', opened: '11 Oct, 12:00', at: '12 Oct, 09:15', reason: 'Found a cheaper option for this trip.' },
  },
  {
    orderId: 'ORD-1028',
    submittedAt: '10 Oct, 13:45',
    pickupPlace: 'Nova Electricals warehouse, Wellampitiya',
    pickupWhen: '13 Oct 2026, 08:00',
    destinationPlace: 'Nova Electricals branch, Dalada Veediya, Kandy',
    destinationWhen: '13 Oct, before 16:00',
    distanceKm: 112,
    cargo: cargo('Electrical goods in cartons', '2.1 t', 'Cartons', '140 cartons', 'Fragile, keep dry'),
    vehicleClass: 'light-5',
    extras: [
      ['Load charge', '2.1 t', 1300],
      ['Loading and unloading', '140 cartons', 2000],
      ['Fragile handling', 'Keep dry', 1500],
    ],
    quotation: { sentAt: '10 Oct, 15:30', validUntil: '2026-10-12T12:00', message: '' },
    outcome: { kind: 'paid', opened: '10 Oct, 16:10', at: '10 Oct, 16:20', trip: { id: 'TRP-2170', at: '11 Oct, 09:00' }, delivered: '13 Oct, 15:10' },
  },
]
