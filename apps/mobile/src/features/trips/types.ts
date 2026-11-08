/** Trip lifecycle as the driver sees it. Tones live in `components/ui/statusTones.ts`. */
export type TripStatus = 'Assigned' | 'In progress' | 'Completed' | 'Cancelled';

/** A pickup or destination stop. Stops and times only — no coordinates, map or ETA. */
export type TripStop = {
  /** Full place name — "Colombo Pharma warehouse". */
  name: string;
  /** Name used on the Home trip card — "Colombo Pharma". */
  shortName: string;
  /** Town or postal area — "Colombo 10", "Negombo". */
  area: string;
  /** Street address — "No. 140, Sri Sangaraja Mawatha, Colombo 10". */
  address: string;
  /** "Contact" at the pickup, "Receiver" at the destination. */
  contactRole: 'Contact' | 'Receiver';
  contactName: string;
  /** E.164-style number, dialled from the call button. */
  contactPhone: string;
};

/** The vehicle assigned to this trip by the coordinator (never a fixed vehicle per driver). */
export type TripVehicle = {
  id: string;
  /** Number plate — "WP LB-7702". */
  plate: string;
  /** Make and model — "Isuzu Elf". */
  model: string;
  /** Load capacity in tonnes. */
  capacityTonnes: number;
};

export type TripCargo = {
  /** "Medicines in 40 cool boxes". */
  description: string;
  weightTonnes: number;
  /** Handling instructions shown as badges — "Keep cool", "Fragile". */
  handling: string[];
};

export type TripNote = {
  authorName: string;
  /** "coordinator". */
  authorRole: string;
  text: string;
};

export type TripPersonRole = 'Customer' | 'Mechanic' | 'Coordinator';

/** Someone in the order's chat room. */
export type TripPerson = {
  id: string;
  name: string;
  role: TripPersonRole;
  /** Shown after the role — company for a customer ("Colombo Pharma"), staff ID for a mechanic ("MEC-012"). */
  detail?: string;
};

export type Trip = {
  /** "TRP-2208". */
  id: string;
  /** "ORD-1053". */
  orderId: string;
  /** Customer company — "Colombo Pharma". */
  customerName: string;
  status: TripStatus;
  /** ISO date-time the trip is due to start (pickup time). */
  scheduledStart: string;
  /** ISO date-time the cargo must be delivered by. */
  deliverBy: string;
  distanceKm: number;
  pickup: TripStop;
  destination: TripStop;
  vehicle: TripVehicle;
  cargo: TripCargo;
  coordinatorNote?: TripNote;
  people: TripPerson[];
  /** ISO date-time the driver started the trip (set by Start trip). */
  startedAt?: string;
  /** Odometer reading entered on Start trip, in km. Trip progress uses odometer readings only — no GPS. */
  startOdometerKm?: number;
  /** ISO date-time the trip was completed with proof of delivery. */
  completedAt?: string;
  /** Odometer reading entered on Complete trip, in km. */
  endOdometerKm?: number;
  /** Trip notes the driver added on the way — "Notes 2" on Complete trip. */
  noteCount: number;
  /** Vehicle issues the driver reported on this trip — "Issues 1" on Complete trip. */
  issueCount: number;
};

/** What the trip records when the driver completes it (sent with the proof of delivery). */
export type TripCompletion = {
  completedAt: string;
  endOdometerKm: number;
};

/** "This week" tiles on Driver — Home. */
export type WeeklyStats = {
  tripCount: number;
  distanceKm: number;
  issuesReported: number;
};
