/**
 * One mock fleet shared by the Trips and Availability pages, so their numbers agree with each other and
 * with the Operational dashboard frame: 17 trips in progress, 1 trip not started on time, 21 of 48 vehicles
 * free (6 in maintenance; light trucks 11 · heavy trucks 4 · vans 4 · pickups 2) and 12 of 35 drivers free
 * (heavy licence 7 · light licence 5).
 *
 * The four in-progress trips, their drivers, K. Perera on TRP-2026-00382 in WP CAB-4521 and TRP-2026-00392
 * come from the Figma frames; every other name, plate and trip is a placeholder to check against the
 * "Coordinator — Trips" (135:4698) and "Coordinator — Availability" (141:4873) frames.
 *
 * Delete this file once the trips and availability endpoints exist.
 */

export type VehicleType = 'Light truck' | 'Heavy truck' | 'Van' | 'Pickup'
export type DriverLicence = 'Heavy licence' | 'Light licence'

export interface FleetTrip {
  tripId: string
  orderId: string
  customerName: string
  route: string
  vehiclePlate: string
  vehicleType: VehicleType
  driverName: string
  mechanicName: string
  scheduledLabel: string
  /** Time the driver started the trip, for trips in progress. */
  startedAt: string | null
  /** Minutes past the scheduled start, for assigned trips that have not started on time. */
  lateByMinutes: number
  note: string | null
  status: 'assigned' | 'in-progress' | 'completed' | 'cancelled'
}

export interface FleetVehicle {
  plate: string
  type: VehicleType
  capacityKg: number
  odometerKm: number
  status: 'available' | 'on-trip' | 'assigned' | 'in-maintenance'
  tripId: string | null
  note: string | null
}

export interface FleetDriver {
  name: string
  licence: DriverLicence
  status: 'available' | 'on-trip' | 'assigned' | 'off-duty'
  tripId: string | null
}

export interface FleetMechanic {
  name: string
  speciality: string
  status: 'available' | 'off-duty'
  /** Assigned or in-progress trips this mechanic is matched to. */
  activeTripCount: number
}

const capacityKg: Record<VehicleType, number> = {
  'Light truck': 3500,
  'Heavy truck': 10000,
  Van: 1500,
  Pickup: 1000,
}

// 17 in-progress trips, then 4 assigned — in the same order as the trips below.
const busyVehicleTypes: VehicleType[] = [
  'Light truck', 'Heavy truck', 'Light truck', 'Van', 'Light truck', 'Heavy truck', 'Pickup', 'Light truck', 'Van',
  'Light truck', 'Heavy truck', 'Light truck', 'Van', 'Light truck', 'Pickup', 'Light truck', 'Van',
  'Heavy truck', 'Light truck', 'Van', 'Light truck',
]
const maintenance: [VehicleType, string][] = [
  ['Light truck', 'Brake service'],
  ['Heavy truck', 'Engine service'],
  ['Heavy truck', 'Gearbox repair'],
  ['Van', 'Tyre replacement'],
  ['Pickup', 'Annual inspection'],
  ['Pickup', 'Clutch replacement'],
]
const freeVehicleTypes: VehicleType[] = [
  ...Array<VehicleType>(11).fill('Light truck'),
  ...Array<VehicleType>(4).fill('Heavy truck'),
  ...Array<VehicleType>(4).fill('Van'),
  ...Array<VehicleType>(2).fill('Pickup'),
]

const provinces = ['WP', 'CP', 'SP', 'NW', 'WP', 'NC', 'SG', 'WP']
const plateLetters = ['LH', 'KD', 'GA', 'CBK', 'KR', 'NA', 'LB', 'PH', 'DE', 'MK', 'RT', 'BN']

function plate(index: number) {
  // The second vehicle is the Style Guide's example plate, on TRP-2026-00382.
  if (index === 1) return 'WP CAB-4521'
  return `${provinces[index % provinces.length]} ${plateLetters[(index * 5) % plateLetters.length]}-${3011 + index * 137}`
}

function odometer(index: number) {
  return index === 1 ? 187400 : 24000 + ((index * 7919) % 210000)
}

const busyDrivers = [
  // in progress
  'Ruwan Silva', 'K. Perera', 'Asanka Perera', 'Nuwan Herath', 'Kasun Bandara', 'Sunil Jayasinghe',
  'Chaminda Fernando', 'Pradeep Kumara', 'Mahesh Dissanayake', 'Tharindu Wijesinghe', 'Dilshan Rathnayake',
  'Roshan Gunawardena', 'Saman Ekanayake', 'Janaka Wickramasinghe', 'Upul Senanayake', 'Gayan Abeysekara',
  'Isuru Karunaratne',
  // assigned
  'Nalin Rajapaksha', 'Chathura Samarasinghe', 'Lahiru Weerasinghe', 'Buddhika Herath',
]
const freeDrivers: [string, DriverLicence][] = [
  ['Amila Jayawardena', 'Heavy licence'],
  ['Dinesh Mendis', 'Heavy licence'],
  ['Harsha Liyanage', 'Heavy licence'],
  ['Kamal Pathirana', 'Heavy licence'],
  ['Lalith Gamage', 'Heavy licence'],
  ['Malinda Peiris', 'Heavy licence'],
  ['Nimesh Cooray', 'Heavy licence'],
  ['Prasad Wimalasena', 'Light licence'],
  ['Ravindu Hettiarachchi', 'Light licence'],
  ['Sachith Munasinghe', 'Light licence'],
  ['Tharaka Alwis', 'Light licence'],
  ['Viraj Kodikara', 'Light licence'],
]
const offDutyDrivers: [string, DriverLicence][] = [
  ['Wasantha Ranasinghe', 'Heavy licence'],
  ['Yasith Premadasa', 'Light licence'],
]

const onCallMechanics: [string, string][] = [
  ['Lahiru Gunasekara', 'Engines'],
  ['Dinesh Silva', 'Brakes & suspension'],
  ['Mohan Rathnayake', 'Electrical'],
  ['Ishara Fonseka', 'Tyres'],
  ['Sampath Ariyaratne', 'Engines'],
  ['Kavinda Jayalath', 'Refrigeration units'],
]
const offDutyMechanics: [string, string][] = [
  ['Ranjith Edirisinghe', 'Gearboxes'],
  ['Nuwan Pathirage', 'Electrical'],
]

type TripSeed = [tripId: string, orderId: string, customerName: string, route: string]

const inProgressSeeds: [...TripSeed, startedAt: string][] = [
  ['TRP-2026-00384', 'ORD-1038', 'Mirissa Seafoods', 'Galle → Colombo Fish Market', '09:20'],
  ['TRP-2026-00382', 'ORD-1036', 'Ceylon Cold Stores', 'Colombo Port → Kandy Depot', '09:02'],
  ['TRP-2026-00390', 'ORD-1037', 'Negombo Lagoon Exports', 'Colombo 03 → Negombo', '08:55'],
  ['TRP-2026-00388', 'ORD-1035', 'Kurunegala Rice Mills', 'Kurunegala → Colombo 10', '08:40'],
  ['TRP-2026-00375', 'ORD-1032', 'Hayleys Freight', 'Biyagama → Kandy', '08:35'],
  ['TRP-2026-00374', 'ORD-1031', 'Kelani Beverages', 'Horana → Colombo Port', '08:28'],
  ['TRP-2026-00373', 'ORD-1030', 'Union Paper Mills', 'Ja-Ela → Kandy', '08:15'],
  ['TRP-2026-00372', 'ORD-1029', 'Serendib Textiles', 'Matara → Colombo 14', '08:02'],
  ['TRP-2026-00371', 'ORD-1028', 'Ruhuna Spices', 'Colombo 10 → Gampaha', '07:50'],
  ['TRP-2026-00370', 'ORD-1027', 'Lanka Hardware Mart', 'Dambulla → Colombo 11', '07:41'],
  ['TRP-2026-00369', 'ORD-1026', 'Dambulla Fresh Produce', 'Galle → Ratnapura', '07:30'],
  ['TRP-2026-00368', 'ORD-1025', 'Southern Ceramics', 'Kandy → Matale', '07:18'],
  ['TRP-2026-00367', 'ORD-1024', 'Kandy Builders', 'Negombo → Galle', '07:05'],
  ['TRP-2026-00366', 'ORD-1023', 'Ceylon Agro Ltd', 'Colombo → Kurunegala', '06:52'],
  ['TRP-2026-00365', 'ORD-1022', 'Lanka Tiles PLC', 'Nuwara Eliya → Colombo 05', '06:40'],
  ['TRP-2026-00364', 'ORD-1021', 'Ambewela Dairies', 'Matale → Kandy', '06:30'],
  ['TRP-2026-00363', 'ORD-1020', 'Matale Spice Garden', 'Kegalle → Colombo 15', '06:15'],
]

const assignedSeeds: [...TripSeed, scheduledLabel: string, lateByMinutes: number][] = [
  ['TRP-2026-00391', 'ORD-1033', 'Ambewela Dairies', 'Nuwara Eliya → Colombo 05', 'Today, 08:30', 45],
  ['TRP-2026-00392', 'ORD-1041', 'Lanka Tiles PLC', 'Colombo Port → Kandy', 'Today, 14:00', 0],
  ['TRP-2026-00393', 'ORD-1034', 'Kelani Beverages', 'Biyagama → Galle', 'Today, 15:30', 0],
  ['TRP-2026-00394', 'ORD-1019', 'Hayleys Freight', 'Colombo → Trincomalee', 'Tomorrow, 06:00', 0],
]

const closedSeeds: [...TripSeed, scheduledLabel: string, status: 'completed' | 'cancelled', note: string][] = [
  ['TRP-2026-00380', 'ORD-1040', 'Ceylon Agro Ltd', 'Negombo → Galle', 'Sat, 31 Oct', 'completed', 'Delivered 13:40'],
  ['TRP-2026-00379', 'ORD-1039', 'Kandy Builders', 'Kandy → Nuwara Eliya', 'Fri, 30 Oct', 'cancelled', 'Refunded in full'],
  ['TRP-2026-00378', 'ORD-1018', 'Kandy Builders', 'Kandy → Matale', 'Sat, 31 Oct', 'completed', 'Delivered 11:05'],
  ['TRP-2026-00377', 'ORD-1017', 'Southern Ceramics', 'Galle → Colombo 10', 'Fri, 30 Oct', 'completed', 'Delivered 16:20'],
]

// Vehicles: busy ones first (matched to trips by index), then maintenance, then free.
export const fleetVehicles: FleetVehicle[] = [
  ...busyVehicleTypes.map((type, i) => ({ type, status: i < 17 ? 'on-trip' : 'assigned', note: null })),
  ...maintenance.map(([type, note]) => ({ type, status: 'in-maintenance', note })),
  ...freeVehicleTypes.map((type) => ({ type, status: 'available', note: null })),
].map((vehicle, i) => ({
  plate: plate(i),
  type: vehicle.type,
  capacityKg: capacityKg[vehicle.type],
  odometerKm: odometer(i),
  status: vehicle.status as FleetVehicle['status'],
  tripId: null,
  note: vehicle.note,
}))

const onCall = onCallMechanics.map(([name]) => name)
const firstFreeVehicle = busyVehicleTypes.length + maintenance.length

export const fleetTrips: FleetTrip[] = [
  ...assignedSeeds.map(([tripId, orderId, customerName, route, scheduledLabel, lateByMinutes], i) => {
    const busyIndex = inProgressSeeds.length + i
    return {
      tripId,
      orderId,
      customerName,
      route,
      vehiclePlate: fleetVehicles[busyIndex].plate,
      vehicleType: fleetVehicles[busyIndex].type,
      driverName: busyDrivers[busyIndex],
      mechanicName: onCall[busyIndex % onCall.length],
      scheduledLabel,
      startedAt: null,
      lateByMinutes,
      note: lateByMinutes > 0 ? `${lateByMinutes} min after scheduled start` : null,
      status: 'assigned' as const,
    }
  }),
  ...inProgressSeeds.map(([tripId, orderId, customerName, route, startedAt], i) => ({
    tripId,
    orderId,
    customerName,
    route,
    vehiclePlate: fleetVehicles[i].plate,
    vehicleType: fleetVehicles[i].type,
    driverName: busyDrivers[i],
    mechanicName: onCall[i % onCall.length],
    scheduledLabel: 'Today',
    startedAt,
    lateByMinutes: 0,
    note: null,
    status: 'in-progress' as const,
  })),
  ...closedSeeds.map(([tripId, orderId, customerName, route, scheduledLabel, status, note], i) => ({
    tripId,
    orderId,
    customerName,
    route,
    vehiclePlate: fleetVehicles[firstFreeVehicle + i].plate,
    vehicleType: fleetVehicles[firstFreeVehicle + i].type,
    driverName: freeDrivers[i][0],
    mechanicName: onCall[i % onCall.length],
    scheduledLabel,
    startedAt: null,
    lateByMinutes: 0,
    note,
    status,
  })),
]

// Point busy vehicles at their trip.
for (const trip of fleetTrips) {
  if (trip.status !== 'assigned' && trip.status !== 'in-progress') continue
  const vehicle = fleetVehicles.find((v) => v.plate === trip.vehiclePlate)
  if (vehicle) vehicle.tripId = trip.tripId
}

const activeTrips = fleetTrips.filter((trip) => trip.status === 'assigned' || trip.status === 'in-progress')

export const fleetDrivers: FleetDriver[] = [
  ...activeTrips.map((trip) => ({
    name: trip.driverName,
    licence: (trip.vehicleType === 'Heavy truck' ? 'Heavy licence' : 'Light licence') as DriverLicence,
    status: trip.status === 'in-progress' ? ('on-trip' as const) : ('assigned' as const),
    tripId: trip.tripId,
  })),
  ...freeDrivers.map(([name, licence]) => ({ name, licence, status: 'available' as const, tripId: null })),
  ...offDutyDrivers.map(([name, licence]) => ({ name, licence, status: 'off-duty' as const, tripId: null })),
]

export const fleetMechanics: FleetMechanic[] = [
  ...onCallMechanics.map(([name, speciality]) => ({
    name,
    speciality,
    status: 'available' as const,
    activeTripCount: activeTrips.filter((trip) => trip.mechanicName === name).length,
  })),
  ...offDutyMechanics.map(([name, speciality]) => ({
    name,
    speciality,
    status: 'off-duty' as const,
    activeTripCount: 0,
  })),
]
