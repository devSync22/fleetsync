/**
 * Public entry for the trips feature. Other features (e.g. driver-home, proof-of-delivery) import from
 * `@/features/trips` only — never from this feature's internal folders.
 */
export {
  getTodayTrip,
  getTrip,
  getUpcomingTrips,
  getWeeklyStats,
  recordTripCompleted,
  TripNotFoundError,
} from './services/tripsApi';
export { useTrip, type TripState } from './hooks/useTrip';
export { canCompleteTrip, canStartTrip, isLateToStart, isSameDay, isScheduledToday } from './tripTime';
export { completeTripHref, proofOfDeliveryHref, tripHref, tripStartHref } from './routes';
export type {
  Trip,
  TripCargo,
  TripCompletion,
  TripNote,
  TripPerson,
  TripPersonRole,
  TripStatus,
  TripStop,
  TripVehicle,
  WeeklyStats,
} from './types';
