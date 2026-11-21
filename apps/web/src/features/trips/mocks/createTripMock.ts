import type { ReadyOrder, TripCandidates } from '../types'

/**
 * From "Create trip / Choose order" (518:11998) and "Create trip" (124:4326).
 * Trip windows and distances for orders other than ORD-1045, and the vehicles and driver below the
 * 12 t / heavy-licence filters, are placeholders so the filters have something to hide.
 */
export const readyOrdersMock: ReadyOrder[] = [
  {
    orderId: 'ORD-1045',
    customerName: 'Hayleys Freight',
    route: 'Kurunegala → Colombo 10',
    pickupLabel: '22 Oct, 07:00',
    cargoLabel: 'General freight · 12 t',
    weightTonnes: 12,
    tripWindow: '22 Oct · 07:00 – 12:30',
    distanceKm: 94,
  },
  {
    orderId: 'ORD-1044',
    customerName: 'Colombo Pharma',
    route: 'Colombo 03 → Negombo',
    pickupLabel: '20 Oct, 10:00',
    cargoLabel: 'Medicines · cold chain · 0.8 t',
    weightTonnes: 0.8,
    tripWindow: '20 Oct · 10:00 – 12:30',
    distanceKm: 38,
  },
  {
    orderId: 'ORD-1035',
    customerName: 'Lanka Tiles PLC',
    route: 'Colombo 15 → Matara',
    pickupLabel: '23 Oct, 08:00',
    cargoLabel: 'Tiles · 16 pallets · 8 t',
    weightTonnes: 8,
    tripWindow: '23 Oct · 08:00 – 14:00',
    distanceKm: 160,
  },
  {
    orderId: 'ORD-1032',
    customerName: 'Matale Spice Exports',
    route: 'Matale → Kandy',
    pickupLabel: '24 Oct, 06:30',
    cargoLabel: 'Spices · bags · 3.5 t',
    weightTonnes: 3.5,
    tripWindow: '24 Oct · 06:30 – 09:00',
    distanceKm: 26,
  },
  {
    orderId: 'ORD-1031',
    customerName: 'Ceylon Agro Ltd',
    route: 'Ja-Ela → Kurunegala',
    pickupLabel: '25 Oct, 07:00',
    cargoLabel: 'Fertiliser · bags · 9 t',
    weightTonnes: 9,
    tripWindow: '25 Oct · 07:00 – 11:30',
    distanceKm: 86,
  },
]

export const tripCandidatesMock: TripCandidates = {
  nextTripId: 'TRP-2207',
  totalVehicles: 18,
  vehicles: [
    { plate: 'WP LB-4521', model: 'Isuzu Forward · heavy truck', capacityTonnes: 16, homeBase: 'Kurunegala yard', nextServiceKm: 2400, status: 'available' },
    { plate: 'WP LC-1188', model: 'Tata 1615 · heavy truck', capacityTonnes: 15, homeBase: 'Kurunegala yard', nextServiceKm: 5100, status: 'available' },
    { plate: 'NW LE-7730', model: 'Ashok Leyland Ecomet', capacityTonnes: 14, homeBase: 'Kuliyapitiya', nextServiceKm: 900, status: 'service-soon' },
    { plate: 'WP LD-3302', model: 'Mitsubishi Fuso Fighter', capacityTonnes: 12, homeBase: 'Colombo depot', nextServiceKm: 7800, status: 'available' },
    { plate: 'WP LH-2045', model: 'Isuzu Elf · light truck', capacityTonnes: 3.5, homeBase: 'Colombo depot', nextServiceKm: 3200, status: 'available' },
    { plate: 'CP LK-6612', model: 'Tata Ace · pickup', capacityTonnes: 1, homeBase: 'Kandy depot', nextServiceKm: 1100, status: 'available' },
  ],
  drivers: [
    { code: 'DRV-014', name: 'Kasun Jayasinghe', initials: 'KJ', licence: 'Heavy', lastTripEnded: '21 Oct, 16:40', tripsThisWeek: 3 },
    { code: 'DRV-022', name: 'Ruwan Silva', initials: 'RS', licence: 'Heavy', lastTripEnded: '20 Oct, 18:10', tripsThisWeek: 2 },
    { code: 'DRV-031', name: 'Mohamed Rizwan', initials: 'MR', licence: 'Heavy', lastTripEnded: '19 Oct, 13:25', tripsThisWeek: 1 },
    { code: 'DRV-027', name: 'Dilshan Rathnayake', initials: 'DR', licence: 'Light', lastTripEnded: '21 Oct, 12:05', tripsThisWeek: 2 },
  ],
  mechanics: [
    { code: 'MEC-005', name: 'Chaminda Fernando', initials: 'CF', speciality: 'Heavy vehicle', workshop: 'Kurunegala', openJobs: 1 },
    { code: 'MEC-009', name: 'Sampath Kumara', initials: 'SK', speciality: 'Engine, brakes', workshop: 'Kurunegala', openJobs: 2 },
    { code: 'MEC-012', name: 'Ishara Bandara', initials: 'IB', speciality: 'General', workshop: 'Colombo depot', openJobs: 0 },
  ],
}
