/**
 * Public entry for the trips feature. Other features (e.g. driver-home) import from
 * `@/features/trips` only — never from this feature's internal folders.
 */
export { getTodayTrip, getTrip, getUpcomingTrips, getWeeklyStats, TripNotFoundError } from './services/tripsApi';
export { canStartTrip, isLateToStart, isSameDay, isScheduledToday } from './tripTime';
export { tripHref, tripStartHref } from './routes';
export type {
  Trip,
  TripCargo,
  TripNote,
  TripPerson,
  TripPersonRole,
  TripStatus,
  TripStop,
  TripVehicle,
  WeeklyStats,
} from './types';
