import type { Trip } from '@/features/trips';

/** "Ishara Bandara (mechanic on this trip) and Nimal Perera (coordinator)" — who gets the report. */
export function notifiedPeople(trip: Trip): string {
  const mechanic = trip.people.find((person) => person.role === 'Mechanic');
  const coordinator = trip.people.find((person) => person.role === 'Coordinator');
  const names = [
    mechanic ? `${mechanic.name} (mechanic on this trip)` : null,
    coordinator ? `${coordinator.name} (coordinator)` : null,
  ].filter((name): name is string => name !== null);
  return names.length > 0 ? names.join(' and ') : 'The coordinator';
}

/** "WP LB-7702 · during TRP-2208". */
export function issueHeaderSubtitle(trip: Trip): string {
  return `${trip.vehicle.plate} · during ${trip.id}`;
}
