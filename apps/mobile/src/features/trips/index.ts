/**
 * Public entry for the trips feature. Other features (e.g. driver-home, proof-of-delivery) import from
 * `@/features/trips` only — never from this feature's internal folders.
 */
export {
  addTripNote,
  completeTrip,
  confirmPickup,
  getTodayTrip,
  getTrip,
  getUpcomingTrips,
  getWeeklyStats,
  recordTripDelivered,
  startTrip,
  TripCancelledError,
  TripNotFoundError,
} from './services/tripsApi';
export { useTrip, type TripState } from './hooks/useTrip';
export { useTripAction, type TripActionState } from './hooks/useTripAction';
export { TripGate } from './components/TripGate';
export { VehicleOdometerCard } from './components/VehicleOdometerCard';
export {
  canStartTrip,
  isActiveTrip,
  isHeadingToDestination,
  isLateToStart,
  isSameDay,
  isScheduledToday,
  tripBadgeLabel,
} from './tripStatus';
export {
  activeTripHref,
  completeTripHref,
  pickedUpHref,
  proofOfDeliveryHref,
  reportIssueHref,
  tripHref,
  tripStartHref,
  tripStepHref,
} from './routes';
export type {
  PickupCargoCondition,
  Trip,
  TripCargo,
  TripCompletion,
  TripLogNote,
  TripNote,
  TripPerson,
  TripPersonRole,
  TripPickup,
  TripStart,
  TripStatus,
  TripStop,
  TripVehicle,
  WeeklyStats,
} from './types';
