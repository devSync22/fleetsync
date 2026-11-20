// Shared mock data store for mechanic state persistence across screens
export interface HistoryAttachment {
  name: string;
  size: string;
  type?: 'pdf' | 'jpg';
  url?: string;
}

export interface SharedHistoryItem {
  id: string;
  vehiclePlate: string;
  vehicleModel: string;
  date: string;
  timestampMs: number;
  title: string;
  subtitle: string;
  tag: 'Resolved' | 'Service' | 'Repair';
  odometer: string;
  mechanicName: string;
  workDone?: string;
  cost?: string;
  parts?: { name: string; qty: string }[];
  nextOdometer?: string;
  nextDate?: string;
  attachments?: HistoryAttachment[];
}

export const INITIAL_HISTORY_ITEMS: SharedHistoryItem[] = [
  {
    id: 'h1',
    vehiclePlate: 'WP LB-7702',
    vehicleModel: 'Isuzu Elf 3.5 t',
    date: '19 Oct 2026',
    timestampMs: new Date('2026-10-19T14:20:00').getTime(),
    title: 'Tyre valve replaced',
    subtitle: 'Valve core replaced & inflated all tyres to 85 psi. No puncture found.',
    tag: 'Resolved',
    odometer: '84,274 km',
    mechanicName: 'Ishara Bandara',
    workDone: 'Inspected tyre pressure sensor, replaced leaking valve core on rear-left tyre, and pumped all 6 tyres to standard 85 psi.',
    cost: '4,500',
    parts: [
      { name: 'Tyre valve stem core', qty: '1' },
      { name: 'High-pressure nitrogen top-up', qty: '6 wheels' },
    ],
    nextOdometer: '90,000 km',
    nextDate: '15 Dec 2026',
    attachments: [
      { name: 'Tyre_valve_19Oct.jpg', size: '1.2 MB', type: 'jpg' },
    ],
  },
  {
    id: 'h2',
    vehiclePlate: 'WP LB-7702',
    vehicleModel: 'Isuzu Elf 3.5 t',
    date: '2 Sep 2026',
    timestampMs: new Date('2026-09-02T10:00:00').getTime(),
    title: 'Full service — 80,000 km',
    subtitle: 'Oil, filters, and brake inspection. All safety checks passed.',
    tag: 'Service',
    odometer: '80,012 km',
    mechanicName: 'Sampath Kumara',
    workDone: 'Full 80,000 km routine preventive maintenance. Replaced engine oil, oil filter, air filter element, and fuel separator. Adjusted brake shoe clearance.',
    cost: '28,600',
    parts: [
      { name: 'Engine oil 15W-40', qty: '6 L' },
      { name: 'OEM Oil filter', qty: '1' },
      { name: 'Air filter element', qty: '1' },
      { name: 'Fuel water separator', qty: '1' },
    ],
    nextOdometer: '90,000 km',
    nextDate: '2 Jan 2027',
    attachments: [
      { name: 'Service_report_2Sep.pdf', size: '412 KB', type: 'pdf' },
      { name: 'Invoice_2Sep.pdf', size: '220 KB', type: 'pdf' },
    ],
  },
  {
    id: 'h3',
    vehiclePlate: 'WP LE-3316',
    vehicleModel: 'Tata Ultra cooler',
    date: '28 Aug 2026',
    timestampMs: new Date('2026-08-28T16:15:00').getTime(),
    title: 'Refrigeration unit fan replaced',
    subtitle: 'Replaced auxiliary evaporator fan motor. Unit cooled down to +2°C.',
    tag: 'Repair',
    odometer: '58,400 km',
    mechanicName: 'Ishara Bandara',
    workDone: 'Auxiliary cooling bay evaporator fan motor bearing failure. Installed replacement DC brushless fan motor, inspected wiring harness, and recharged R404A.',
    cost: '32,400',
    parts: [
      { name: 'Evaporator fan motor 24V', qty: '1' },
      { name: 'Refrigerant R404A top-up', qty: '400 g' },
    ],
    nextOdometer: '68,000 km',
    nextDate: '28 Feb 2027',
    attachments: [
      { name: 'Reefer_Inspection_Report.pdf', size: '340 KB', type: 'pdf' },
      { name: 'Invoice.pdf', size: '184 KB', type: 'pdf' },
    ],
  },
  {
    id: 'h4',
    vehiclePlate: 'WP LB-7702',
    vehicleModel: 'Isuzu Elf 3.5 t',
    date: '14 Jul 2026',
    timestampMs: new Date('2026-07-14T11:30:00').getTime(),
    title: 'Front brake pads replaced',
    subtitle: 'New OEM ceramic brake pad set installed. Rotor runout verified.',
    tag: 'Repair',
    odometer: '76,940 km',
    mechanicName: 'Sampath Kumara',
    workDone: 'Front axle ceramic brake pad replacement. Caliper slide pins cleaned and greased with high-temp silicone grease. Fluid level verified.',
    cost: '16,800',
    parts: [
      { name: 'Front ceramic brake pad kit', qty: '1 set' },
      { name: 'Brake fluid DOT 4', qty: '500 mL' },
    ],
    nextOdometer: '85,000 km',
    nextDate: '14 Jan 2027',
    attachments: [
      { name: 'Invoice_14Jul.pdf', size: '184 KB', type: 'pdf' },
    ],
  },
  {
    id: 'h5',
    vehiclePlate: 'WP LA-9087',
    vehicleModel: 'Isuzu NPR 5 t',
    date: '3 May 2026',
    timestampMs: new Date('2026-05-03T09:00:00').getTime(),
    title: 'Engine oil & filter',
    subtitle: '15W-40 heavy diesel oil flush, replaced oil & fuel filter.',
    tag: 'Service',
    odometer: '75,020 km',
    mechanicName: 'Ishara Bandara',
    workDone: 'Periodic 10,000 km oil service. Drained sump, torqued drain plug with new crush washer, and replaced oil filter cartridge.',
    cost: '18,500',
    parts: [
      { name: 'Diesel 15W-40 Engine oil', qty: '7 L' },
      { name: 'Oil filter cartridge', qty: '1' },
    ],
    nextOdometer: '85,000 km',
    nextDate: '3 Nov 2026',
    attachments: [
      { name: 'Service_Work_Order_May.pdf', size: '280 KB', type: 'pdf' },
    ],
  },
];

export let globalHistoryItems: SharedHistoryItem[] = [...INITIAL_HISTORY_ITEMS];

export interface SharedQueueItem {
  id: string;
  province: string;
  plate: string;
  type: 'DRIVER REPORT' | 'SERVICE';
  title: string;
  subtitle: string;
  status: 'Reported' | 'In progress' | 'Overdue' | 'Due soon' | 'Resolved';
  stripColor: string;
  vehicleModel: string;
  odometer: string;
  category: string;
  impactTag: string;
  description: string;
  driverName: string;
  tripId: string;
  reportedTime: string;
  defaultFix: string;
  isService?: boolean;
  cost?: string;
  workDone?: string;
  parts?: { name: string; qty: string }[];
  nextOdometer?: string;
  nextDate?: string;
}

export const INITIAL_SHARED_ITEMS: SharedQueueItem[] = [
  {
    id: '1',
    province: 'WP',
    plate: 'LB-7702',
    type: 'DRIVER REPORT',
    title: 'Tyre pressure low',
    subtitle: 'Kasun · today 10:15 · can continue',
    status: 'Reported',
    stripColor: '#D97706',
    vehicleModel: 'Isuzu Elf',
    odometer: '84,310 km',
    category: 'Tyres',
    impactTag: 'Could continue',
    description: 'Tyre pressure warning on the dashboard. Rear left tyre looks low. Driving slowly to Negombo.',
    driverName: 'Kasun Jayasinghe',
    tripId: 'TRP-2208',
    reportedTime: 'today 10:15',
    defaultFix: 'Valve core on the rear left tyre was leaking. Replaced the valve and inflated all tyres to 85 psi. No puncture found.',
    cost: '4,500',
    workDone: 'Inspected tyre pressure sensor, replaced leaking valve core on rear-left tyre, and pumped all 6 tyres to standard 85 psi.',
    parts: [
      { name: 'Tyre valve stem core', qty: '1' },
      { name: 'High-pressure nitrogen top-up', qty: '6 wheels' },
    ],
    nextOdometer: '90,000 km',
    nextDate: '15 Dec 2026',
  },
  {
    id: '2',
    province: 'WP',
    plate: 'LE-3316',
    type: 'DRIVER REPORT',
    title: 'Cooling unit not cooling',
    subtitle: 'Dinesh · today 10:30 · you started 13:10',
    status: 'In progress',
    stripColor: '#2563EB',
    vehicleModel: 'Tata Ultra cooler',
    odometer: '61,840 km',
    category: 'Cooling unit',
    impactTag: 'Could continue',
    description: 'Cooling unit stops after 20 minutes. Fan runs but no cold air. Perishable cargo in bay.',
    driverName: 'Dinesh Kumara',
    tripId: 'TRP-2206',
    reportedTime: 'today 10:30',
    defaultFix: 'Refrigerant pressure low due to loose flare nut on compressor line. Evacuated system, torqued fitting, recharged R404A.',
    cost: '14,200',
    workDone: 'Detected micro-leak on refrigerant return manifold. Tightened compressor flare nut, evacuated system with vacuum pump, and recharged 1.8 kg R404A.',
    parts: [
      { name: 'Refrigerant R404A gas', qty: '1.8 kg' },
      { name: 'Manifold O-ring seal', qty: '2' },
    ],
    nextOdometer: '70,000 km',
    nextDate: '28 Feb 2027',
  },
  {
    id: '3',
    province: 'WP',
    plate: 'LA-9087',
    type: 'SERVICE',
    title: 'Engine oil & filter',
    subtitle: '1,200 km overdue · 102,480 km',
    status: 'Overdue',
    stripColor: '#DC2626',
    vehicleModel: 'Isuzu NPR 5 t',
    odometer: '102,480 km',
    category: 'Engine oil & filter',
    impactTag: '1,200 km overdue',
    description: 'Scheduled periodic maintenance overdue by 1,200 km. Vehicle flagged for workshop oil flush.',
    driverName: 'Depot Fleet',
    tripId: 'DEPOT-MAIN',
    reportedTime: 'today 08:00',
    defaultFix: 'Drained engine oil, replaced oil filter (OEM-4402) and fuel water separator. Refilled 15W-40 heavy diesel oil.',
    isService: true,
    cost: '18,450',
    workDone: 'Drained engine oil, flushed crankcase, replaced spin-on oil filter and diesel pre-filter. Inspected coolant and air filter.',
    parts: [
      { name: 'Engine oil 15W-40', qty: '7 L' },
      { name: 'Oil filter (OEM-4402)', qty: '1' },
      { name: 'Diesel pre-filter', qty: '1' },
    ],
    nextOdometer: '107,480 km',
    nextDate: '19 Jan 2027',
  },
  {
    id: '4',
    province: 'WP',
    plate: 'LC-4410',
    type: 'SERVICE',
    title: 'Tyre rotation',
    subtitle: '6 days overdue · due 13 Oct',
    status: 'Overdue',
    stripColor: '#DC2626',
    vehicleModel: 'Hino 300 Series',
    odometer: '92,100 km',
    category: 'Tyre rotation',
    impactTag: '6 days overdue',
    description: 'Tyre rotation overdue. Front steer axle tyres exhibiting uneven shoulder wear.',
    driverName: 'Depot Fleet',
    tripId: 'DEPOT-MAIN',
    reportedTime: '13 Oct',
    defaultFix: 'Rotated steer to drive axle in cross pattern. Torqued wheel nuts to 450 Nm and checked pressure on all 6 wheels.',
    isService: true,
    cost: '6,000',
    workDone: 'Completed 6-wheel cross rotation from steer axle to rear duals. Checked wheel nut torque and calibrated TPMS.',
    parts: [
      { name: 'Wheel balancing weights', qty: '120 g' },
    ],
    nextOdometer: '102,000 km',
    nextDate: '15 Apr 2027',
  },
  {
    id: '5',
    province: 'NW',
    plate: 'LE-7730',
    type: 'SERVICE',
    title: 'Brake service',
    subtitle: 'Due in 900 km · booked Wed 22 Oct',
    status: 'Due soon',
    stripColor: '#D97706',
    vehicleModel: 'Toyota Dyna',
    odometer: '114,300 km',
    category: 'Brake service',
    impactTag: 'Due in 900 km',
    description: 'Brake pad lining thickness at 20%. Scheduled replacement before next long-haul run.',
    driverName: 'Sunil Rathnayake',
    tripId: 'TRP-2210',
    reportedTime: 'Wed 22 Oct',
    defaultFix: 'Replaced front disc brake pads, inspected rotors for runout, bled hydraulic fluid lines.',
    isService: true,
    cost: '22,800',
    workDone: 'Replaced front disc brake pads, measured rotor thickness (within spec), cleaned caliper slider pins and flushed brake fluid DOT 4.',
    parts: [
      { name: 'Front brake pad set (OEM)', qty: '1 set' },
      { name: 'Brake fluid DOT 4', qty: '1 L' },
      { name: 'Caliper pin grease', qty: '1 tube' },
    ],
    nextOdometer: '125,000 km',
    nextDate: '22 Mar 2027',
  },
  {
    id: 's4',
    province: 'WP',
    plate: 'LB-4521',
    type: 'SERVICE',
    title: 'Full service',
    subtitle: '2,400 km left · at 210,000 km',
    status: 'Due soon',
    stripColor: '#2563EB',
    vehicleModel: 'Mitsubishi Fuso Canter',
    odometer: '207,600 km',
    category: 'Full service',
    impactTag: '2,400 km left',
    description: 'Scheduled 210,000 km major service. Comprehensive inspection of engine, transmission fluid, differentials, and safety systems.',
    driverName: 'Depot Fleet',
    tripId: 'DEPOT-MAIN',
    reportedTime: 'Scheduled',
    defaultFix: 'Complete 210,000 km periodic service with oil, fuel, air filter changes and general safety check.',
    isService: true,
    cost: '34,500',
    workDone: 'Changed engine oil and oil filter, replaced fuel filter and primary air filter element. Inspected drive belts and greased propeller shaft.',
    parts: [
      { name: 'Engine oil 15W-40', qty: '8.5 L' },
      { name: 'Heavy duty oil filter', qty: '1' },
      { name: 'Fuel filter element', qty: '1' },
      { name: 'Chassis grease NLGI-2', qty: '500 g' },
    ],
    nextOdometer: '220,000 km',
    nextDate: '10 May 2027',
  },
  {
    id: 's5',
    province: 'WP',
    plate: 'LC-1188',
    type: 'SERVICE',
    title: 'Brake inspection',
    subtitle: '5,100 km left · at 152,000 km',
    status: 'Due soon',
    stripColor: '#2563EB',
    vehicleModel: 'Isuzu Forward 8 t',
    odometer: '146,900 km',
    category: 'Brake inspection',
    impactTag: '5,100 km left',
    description: 'Quarterly brake lining and air dryer cartridge inspection. Ensure air compressor governor cuts out at specified pressure.',
    driverName: 'Depot Fleet',
    tripId: 'DEPOT-MAIN',
    reportedTime: 'Scheduled',
    defaultFix: 'Inspected brake shoes and drums, adjusted brake slack adjusters, purged air dryer condensation.',
    isService: true,
    cost: '12,000',
    workDone: 'Measured brake lining thickness, lubricated camshafts and slack adjusters. Replaced desiccant cartridge on air dryer.',
    parts: [
      { name: 'Air dryer desiccant cartridge', qty: '1' },
      { name: 'Brake cleaner spray', qty: '2 cans' },
    ],
    nextOdometer: '160,000 km',
    nextDate: '14 Jun 2027',
  },
  {
    id: 's6',
    province: 'WP',
    plate: 'LB-7702',
    type: 'SERVICE',
    title: 'Full service',
    subtitle: '5,726 km left · at 90,000 km',
    status: 'Due soon',
    stripColor: '#2563EB',
    vehicleModel: 'Isuzu Elf',
    odometer: '84,274 km',
    category: 'Full service',
    impactTag: '5,726 km left',
    description: 'Scheduled 90,000 km milestone service for Isuzu Elf delivery truck. Standard lubricants and filters renewal.',
    driverName: 'Kasun Jayasinghe',
    tripId: 'TRP-2208',
    reportedTime: 'Scheduled',
    defaultFix: 'Standard milestone service: engine oil, filter, wiper blades, suspension bushing check.',
    isService: true,
    cost: '21,000',
    workDone: 'Completed 90,000 km inspection, replaced engine oil, filter, and checked steering play.',
    parts: [
      { name: 'Diesel engine oil 15W-40', qty: '6 L' },
      { name: 'Spin-on oil filter', qty: '1' },
      { name: 'Wiper blade set', qty: '1 pair' },
    ],
    nextOdometer: '100,000 km',
    nextDate: '20 Jul 2027',
  },
];

// Global in-memory mutable store so screen changes persist seamlessly
export let globalQueueItems: SharedQueueItem[] = [...INITIAL_SHARED_ITEMS];

export function updateItemOutcome(id: string, outcome: 'resolved' | 'needs_more_work', fixDescription?: string) {
  globalQueueItems = globalQueueItems.map((item) => {
    if (item.id === id) {
      if (outcome === 'resolved') {
        const resolvedItem = {
          ...item,
          status: 'Resolved' as const,
          defaultFix: fixDescription || item.defaultFix,
        };

        // Also append to globalHistoryItems so it is immediately accessible in history
        const historyEntry: SharedHistoryItem = {
          id: `h-res-${item.id}-${Date.now()}`,
          vehiclePlate: `${item.province} ${item.plate}`,
          vehicleModel: item.vehicleModel,
          date: 'Today',
          timestampMs: Date.now(),
          title: `${item.title} — Resolved`,
          subtitle: fixDescription || item.defaultFix || 'Issue resolved and verified.',
          tag: 'Resolved',
          odometer: item.odometer,
          mechanicName: 'Ishara Bandara',
          workDone: fixDescription || item.workDone || item.defaultFix,
          cost: item.cost,
          parts: item.parts,
          nextOdometer: item.nextOdometer,
          nextDate: item.nextDate,
          attachments: [
            { name: `Job_Card_${item.plate}.pdf`, size: '210 KB', type: 'pdf' },
          ],
        };

        // Prepend so newest is on top
        globalHistoryItems = [historyEntry, ...globalHistoryItems];

        return resolvedItem;
      } else {
        // Needs more work -> Remains in Queue marked as 'In progress' with blue strip!
        return {
          ...item,
          status: 'In progress' as const,
          stripColor: '#2563EB',
          subtitle: `${item.driverName} · Needs more work · In workshop bay`,
          defaultFix: fixDescription || item.defaultFix,
        };
      }
    }
    return item;
  });
}
