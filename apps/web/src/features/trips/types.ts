export type TripStatus = 'draft' | 'assigned' | 'in-progress' | 'completed' | 'cancelled'

/** One row of the "All trips" table. Draft trips have no vehicle, driver or mechanic yet. */
export interface TripListItem {
  tripId: string
  orderId: string
  customerName: string
  route: string
  vehiclePlate: string | null
  driverName: string | null
  mechanicName: string | null
  scheduledAt: string
  startedAt: string | null
  startOdometerKm: number | null
  status: TripStatus
  /** Assigned trip that is past its scheduled start. */
  notStartedOnTime?: boolean
  completedToday?: boolean
  endOdometerMissing?: boolean
}

export interface DriverUpdate {
  time: string
  driverName: string
  action: 'started' | 'completed'
  tripId: string
  detail: string
}

export interface AttentionItem {
  kind: 'not-started' | 'notification-not-opened' | 'odometer-missing'
  title: string
  description: string
  action: { label: string; to?: string }
}

export interface TripsOverview {
  trips: TripListItem[]
  driverUpdates: DriverUpdate[]
  attention: AttentionItem[]
}

export interface LifecycleStep {
  label: string
  detail: string
  time: string | null
  state: 'done' | 'current' | 'upcoming'
}

export interface TripActivity {
  time: string
  title: string
  detail: string
}

export interface TripPerson {
  name: string
  initials: string
  code: string | null
}

export interface TripDetail {
  tripId: string
  status: TripStatus
  orderId: string
  customerName: string
  route: string
  /** Time the driver confirmed pickup; once set the trip can no longer be cancelled. */
  pickedUpAt: string | null
  pickup: { place: string; note: string | null }
  destination: { place: string; note: string | null }
  cargo: string | null
  weight: string | null
  distance: string | null
  tripWindow: string | null
  vehicle: { plate: string; description: string | null } | null
  driver: (TripPerson & { licence: string | null; phone: string | null }) | null
  mechanic: (TripPerson & { workshop: string | null }) | null
  customerContact: string | null
  paymentStatus: 'paid' | 'awaiting-payment'
  quotedFare: number | null
  odometer: { startKm: number | null; endKm: number | null }
  note: { text: string; addedBy: string } | null
  lifecycle: LifecycleStep[]
  activity: TripActivity[]
}

export type NotificationStatus = 'opened' | 'not-opened' | 'delivered'

export interface SentNotification {
  name: string
  initials: string
  role: string
  sentTo: string
  sentAt: string
  status: NotificationStatus
}

/** What the Trip cancelled page shows. */
export interface TripCancellation {
  tripId: string
  orderId: string
  customerName: string
  pickedUp: boolean
  statusWhenCancelled: string
  cancelledBy: string
  reason: string
  vehiclePlate: string | null
  driverName: string | null
  mechanicName: string | null
  startOdometerKm: number | null
  refund: number | null
  notifications: SentNotification[]
  driverPreview: { title: string; body: string }
}

/** What the Trip created page shows. */
export interface TripCreation {
  tripId: string
  orderId: string
  customerName: string
  route: string
  startLabel: string
  tripWindow: string
  cargo: string
  vehiclePlate: string
  driverName: string
  mechanicName: string
  createdBy: string
  notifications: SentNotification[]
  driverPreview: { title: string; body: string }
}

/** A paid order that can be turned into a trip. */
export interface ReadyOrder {
  orderId: string
  customerName: string
  route: string
  pickupLabel: string
  cargoLabel: string
  weightTonnes: number
  tripWindow: string
  distanceKm: number
}

export interface VehicleCandidate {
  plate: string
  model: string
  capacityTonnes: number
  homeBase: string
  nextServiceKm: number
  status: 'available' | 'service-soon'
}

export interface DriverCandidate {
  code: string
  name: string
  initials: string
  licence: 'Heavy' | 'Light'
  lastTripEnded: string
  tripsThisWeek: number
}

export interface MechanicCandidate {
  code: string
  name: string
  initials: string
  speciality: string
  workshop: string
  openJobs: number
}

export interface TripCandidates {
  nextTripId: string
  totalVehicles: number
  vehicles: VehicleCandidate[]
  drivers: DriverCandidate[]
  mechanics: MechanicCandidate[]
}

export interface CreateTripInput {
  orderId: string
  vehiclePlate: string
  driverCode: string
  mechanicCode: string
}
