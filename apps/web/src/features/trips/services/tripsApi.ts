import { ApiError } from '@/services/apiClient'
import { readyOrdersMock, tripCandidatesMock } from '../mocks/createTripMock'
import {
  attentionMock,
  driverUpdatesMock,
  trp2203BeforePickup,
  trp2203Cancellation,
  trp2203PickedUp,
  trp2207,
  trp2207Creation,
  tripListMock,
} from '../mocks/tripsMock'
import type {
  CreateTripInput,
  LifecycleStep,
  ReadyOrder,
  TripCancellation,
  TripCandidates,
  TripCreation,
  TripDetail,
  TripListItem,
  TripsOverview,
} from '../types'

/*
 * Mocked until the trip endpoints exist. Each function keeps the signature the real call will have, e.g.
 *   getTripDetail  → apiClient.get<TripDetail>(`/coordinator/trips/${tripId}`)
 *   cancelTrip     → apiClient.post<TripCancellation>(`/coordinator/trips/${tripId}/cancel`, { reason })
 *   createTrip     → apiClient.post<{ tripId: string }>('/coordinator/trips', input)
 *
 * Trips cancelled or created in this session are kept in memory so the list, details and result pages agree.
 * In dev, add `mock=error` to the URL query to preview the error states, `mock=empty` for empty lists,
 * and `mock=picked-up` to see TRP-2203 after its cargo was picked up.
 */

const MOCK_LATENCY_MS = 400
const COORDINATOR_NAME = 'Nimal Perera'

const createdTrips: TripListItem[] = []
const cancellations = new Map<string, TripCancellation>([['TRP-2203', trp2203Cancellation]])
const cancelledTripIds = new Set<string>()
const creations = new Map<string, TripCreation>([['TRP-2207', trp2207Creation]])

async function mockRequest(): Promise<string | null> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))
  const scenario = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('mock') : null
  if (scenario === 'error') {
    throw new ApiError('Check your connection and try again. If it keeps happening, contact support.')
  }
  return scenario
}

function nowTime() {
  return new Date().toTimeString().slice(0, 5)
}

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function allTrips(): TripListItem[] {
  return [...createdTrips, ...tripListMock].map((trip) =>
    cancelledTripIds.has(trip.tripId) ? { ...trip, status: 'cancelled' as const, notStartedOnTime: false } : trip,
  )
}

/** A details view for trips the frames don't draw in full, built from the list row. */
function detailFromListItem(trip: TripListItem): TripDetail {
  const [from, to] = trip.route.split(' → ')
  const order = ['draft', 'assigned', 'in-progress', 'completed'] as const
  const reached = trip.status === 'cancelled' ? 1 : order.indexOf(trip.status)
  const stateAt = (i: number): LifecycleStep['state'] =>
    trip.status === 'completed' || i < reached ? 'done' : i === reached ? 'current' : 'upcoming'

  const lifecycle: LifecycleStep[] = [
    { label: 'Draft', detail: 'Order reviewed', time: null, state: stateAt(0) },
    {
      label: 'Assigned',
      detail: trip.vehiclePlate && trip.driverName ? `${trip.vehiclePlate} · ${trip.driverName}` : 'Waiting for vehicle and driver',
      time: null,
      state: stateAt(1),
    },
    trip.status === 'cancelled'
      ? { label: 'Cancelled', detail: 'Trip cancelled', time: null, state: 'current' }
      : {
          label: 'In progress',
          detail: trip.startOdometerKm ? `Started at ${trip.startOdometerKm.toLocaleString('en-LK')} km` : 'Driver has not started',
          time: trip.startedAt ? `Today, ${trip.startedAt}` : null,
          state: stateAt(2),
        },
  ]
  if (trip.status !== 'cancelled') {
    lifecycle.push({
      label: 'Completed',
      detail: trip.endOdometerMissing ? 'End odometer not entered yet' : trip.status === 'completed' ? 'Delivered' : 'Waiting for end odometer',
      time: null,
      state: stateAt(3),
    })
  }

  return {
    tripId: trip.tripId,
    status: trip.status,
    orderId: trip.orderId,
    customerName: trip.customerName,
    route: trip.route,
    pickedUpAt: null,
    pickup: { place: from, note: `Scheduled ${trip.scheduledAt}` },
    destination: { place: to, note: null },
    cargo: null,
    weight: null,
    distance: null,
    tripWindow: null,
    vehicle: trip.vehiclePlate ? { plate: trip.vehiclePlate, description: null } : null,
    driver: trip.driverName
      ? { name: trip.driverName, initials: initialsOf(trip.driverName), code: null, licence: null, phone: null }
      : null,
    mechanic: trip.mechanicName
      ? { name: trip.mechanicName, initials: initialsOf(trip.mechanicName), code: null, workshop: null }
      : null,
    customerContact: null,
    paymentStatus: 'paid',
    quotedFare: null,
    odometer: { startKm: trip.startOdometerKm, endKm: null },
    note: null,
    lifecycle,
    activity: trip.startedAt
      ? [
          {
            time: trip.startedAt,
            title: `${trip.driverName} started the trip`,
            detail: `Start odometer ${trip.startOdometerKm?.toLocaleString('en-LK')} km`,
          },
        ]
      : [],
  }
}

export async function getTripsOverview(): Promise<TripsOverview> {
  const scenario = await mockRequest()
  if (scenario === 'empty') return { trips: [], driverUpdates: [], attention: [] }
  return { trips: allTrips(), driverUpdates: driverUpdatesMock, attention: attentionMock }
}

export async function getTripDetail(tripId: string): Promise<TripDetail> {
  const scenario = await mockRequest()
  let detail: TripDetail | undefined
  if (tripId === 'TRP-2203') detail = scenario === 'picked-up' ? trp2203PickedUp : trp2203BeforePickup
  else if (tripId === 'TRP-2207') detail = trp2207
  else {
    const row = allTrips().find((trip) => trip.tripId === tripId)
    if (row) detail = detailFromListItem(row)
  }
  if (!detail) throw new ApiError(`Trip ${tripId} was not found.`, 404)
  if (!cancelledTripIds.has(tripId)) return detail
  return {
    ...detail,
    status: 'cancelled',
    lifecycle: [
      ...detail.lifecycle.filter((step) => step.state === 'done'),
      { label: 'Cancelled', detail: cancellations.get(tripId)?.cancelledBy ?? 'Trip cancelled', time: null, state: 'current' },
    ],
  }
}

/** Only assigned trips, and in-progress trips before pickup, can be cancelled. Both trigger a full refund. */
export function canCancel(trip: Pick<TripDetail, 'status' | 'pickedUpAt'>) {
  return trip.status === 'assigned' || (trip.status === 'in-progress' && !trip.pickedUpAt)
}

export async function cancelTrip(tripId: string, reason: string): Promise<TripCancellation> {
  const trip = await getTripDetail(tripId)
  if (!canCancel(trip)) {
    throw new ApiError('This trip can no longer be cancelled because the cargo has been picked up.', 409)
  }
  const time = nowTime()
  const contactName = trip.customerContact?.split(' · ')[0]
  const firstSentence = reason.trim().split(/(?<=\.)\s/)[0]
  const cancellation: TripCancellation = {
    tripId,
    orderId: trip.orderId,
    customerName: trip.customerName,
    pickedUp: false,
    statusWhenCancelled: trip.status === 'assigned' ? 'Assigned' : 'In progress, before pickup',
    cancelledBy: `${COORDINATOR_NAME} · ${time}`,
    reason: reason.trim(),
    vehiclePlate: trip.vehicle?.plate ?? null,
    driverName: trip.driver?.name ?? null,
    mechanicName: trip.mechanic?.name ?? null,
    startOdometerKm: trip.odometer.startKm,
    refund: trip.quotedFare,
    notifications: [
      ...(trip.driver
        ? [{ name: trip.driver.name, initials: trip.driver.initials, role: ['Driver', trip.driver.code].filter(Boolean).join(' · '), sentTo: 'Driver app', sentAt: time, status: 'not-opened' as const }]
        : []),
      ...(trip.mechanic
        ? [{ name: trip.mechanic.name, initials: trip.mechanic.initials, role: ['Mechanic', trip.mechanic.code].filter(Boolean).join(' · '), sentTo: 'Mechanic app', sentAt: time, status: 'not-opened' as const }]
        : []),
      {
        name: trip.customerName,
        initials: initialsOf(trip.customerName),
        role: contactName ? `Customer · ${contactName}` : 'Customer',
        sentTo: 'Email and app',
        sentAt: time,
        status: 'delivered',
      },
    ],
    driverPreview: {
      title: `Trip cancelled · ${tripId}`,
      body: `${firstSentence} Stop the trip and call ${COORDINATOR_NAME.split(' ')[0]} for next steps.`,
    },
  }
  cancellations.set(tripId, cancellation)
  cancelledTripIds.add(tripId)
  return cancellation
}

export async function getTripCancellation(tripId: string): Promise<TripCancellation> {
  await mockRequest()
  const cancellation = cancellations.get(tripId)
  if (!cancellation) throw new ApiError(`Trip ${tripId} has not been cancelled.`, 404)
  return cancellation
}

/**
 * Paid orders that don't have a trip yet ("Ready for a trip"). The frames disagree here (ORD-1045 is ready in
 * Create trip but already has TRP-2207 in Trips), so only trips created in this session take an order off the list.
 */
export async function getReadyOrders(): Promise<ReadyOrder[]> {
  const scenario = await mockRequest()
  if (scenario === 'empty') return []
  const withTrip = new Set(createdTrips.map((trip) => trip.orderId))
  return readyOrdersMock.filter((order) => !withTrip.has(order.orderId))
}

/** Vehicles, drivers and mechanics free for the whole trip window of the order. */
export async function getTripCandidates(): Promise<TripCandidates> {
  await mockRequest()
  const highest = Math.max(...allTrips().map((trip) => Number(trip.tripId.slice(4))))
  return { ...tripCandidatesMock, nextTripId: `TRP-${highest + 1}` }
}

export async function createTrip(input: CreateTripInput): Promise<{ tripId: string }> {
  const [orders, candidates] = await Promise.all([getReadyOrders(), getTripCandidates()])
  const order = orders.find((o) => o.orderId === input.orderId)
  const vehicle = candidates.vehicles.find((v) => v.plate === input.vehiclePlate)
  const driver = candidates.drivers.find((d) => d.code === input.driverCode)
  const mechanic = candidates.mechanics.find((m) => m.code === input.mechanicCode)
  if (!order || !vehicle || !driver || !mechanic) {
    throw new ApiError('That order, vehicle or person is no longer available. Refresh and try again.', 409)
  }

  const tripId = candidates.nextTripId
  const time = nowTime()
  createdTrips.unshift({
    tripId,
    orderId: order.orderId,
    customerName: order.customerName,
    route: order.route,
    vehiclePlate: vehicle.plate,
    driverName: driver.name,
    mechanicName: mechanic.name,
    scheduledAt: order.pickupLabel.replace(',', ''),
    startedAt: null,
    startOdometerKm: null,
    status: 'assigned',
  })
  creations.set(tripId, {
    tripId,
    orderId: order.orderId,
    customerName: order.customerName,
    route: order.route,
    startLabel: order.pickupLabel.replace(', ', ' at '),
    tripWindow: order.tripWindow.replace(' · ', ', '),
    cargo: order.cargoLabel,
    vehiclePlate: vehicle.plate,
    driverName: driver.name,
    mechanicName: mechanic.name,
    createdBy: `${COORDINATOR_NAME} · ${time}`,
    notifications: [
      { name: driver.name, initials: driver.initials, role: `Driver · ${driver.code}`, sentTo: 'Driver app', sentAt: time, status: 'not-opened' },
      { name: mechanic.name, initials: mechanic.initials, role: `Mechanic · ${mechanic.code}`, sentTo: 'Mechanic app', sentAt: time, status: 'not-opened' },
    ],
    driverPreview: {
      title: `New trip assigned · ${tripId}`,
      body: `${order.route} · ${order.pickupLabel} · Vehicle ${vehicle.plate}. Tap to view the trip.`,
    },
  })
  return { tripId }
}

export async function getTripCreation(tripId: string): Promise<TripCreation> {
  await mockRequest()
  const creation = creations.get(tripId)
  if (!creation) throw new ApiError(`No new trip ${tripId} was found.`, 404)
  return creation
}
