import type { Trip } from '../types';

import { PersonRow } from './PersonRow';
import { SectionCard } from './SectionCard';

/** PEOPLE ON THIS TRIP: customer, mechanic and coordinator. Only the mechanic and coordinator can be messaged. */
export function PeopleCard({ trip }: { trip: Trip }) {
  return (
    <SectionCard title="People on this trip">
      {trip.people.map((person) => (
        <PersonRow key={person.id} person={person} orderId={trip.orderId} />
      ))}
    </SectionCard>
  );
}
