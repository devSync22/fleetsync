import type { Trip } from '../types';

import { PersonRow } from './PersonRow';
import { SectionCard } from './SectionCard';

/** PEOPLE ON THIS TRIP: customer, mechanic and coordinator in the order's chat room. */
export function PeopleCard({ trip }: { trip: Trip }) {
  return (
    <SectionCard title="People on this trip">
      {trip.people.map((person) => (
        <PersonRow key={person.id} person={person} />
      ))}
    </SectionCard>
  );
}
