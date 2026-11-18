import type { Vehicle } from '../types'

/** Admin → Vehicles frame (110:3108), plus a few more so the list pages. Plates match the other screens. */
export const vehiclesMock: Vehicle[] = [
  { plate: 'WP CAB-4521', model: 'Isuzu NPR', year: 2021, chassisNo: 'NPR85-7104521', type: 'light-truck', capacity: 4, capacityUnit: 't', odometerKm: 187400, nextService: { kind: 'due-in', km: 1200 }, status: 'on-trip' },
  { plate: 'WP LM-7703', model: 'Tata LPT 1615', year: 2018, chassisNo: 'LPT1615-887703', type: 'heavy-truck', capacity: 9, capacityUnit: 't', odometerKm: 221050, nextService: { kind: 'overdue', km: 2350 }, status: 'out-of-service' },
  { plate: 'CP NA-3390', model: 'Toyota HiAce', year: 2020, chassisNo: 'KDH201-0033390', type: 'van', capacity: 1.2, capacityUnit: 't', odometerKm: 94210, nextService: { kind: 'due-in', km: 4800 }, status: 'available' },
  { plate: 'SP KA-1182', model: 'Ashok Leyland Dost', year: 2022, chassisNo: 'ALDOST-221182', type: 'light-truck', capacity: 1.5, capacityUnit: 't', odometerKm: 62500, nextService: { kind: 'due-in', km: 300 }, status: 'available' },
  { plate: 'WP PE-5527', model: 'Mitsubishi Fuso Canter', year: 2021, chassisNo: 'FEB71-215527', type: 'light-truck', capacity: 4, capacityUnit: 't', odometerKm: 41800, nextService: { kind: 'due-in', km: 8100 }, status: 'trip-scheduled' },
  { plate: 'WP CAB-9012', model: 'Isuzu Elf', year: 2023, chassisNo: 'NKR77-239012', type: 'light-truck', capacity: 3.5, capacityUnit: 't', odometerKm: 62410, nextService: { kind: 'due-in', km: 3600 }, status: 'on-trip' },
  { plate: 'NW PB-4402', model: 'Mitsubishi Fuso Canter', year: 2022, chassisNo: 'FEB71-224402', type: 'light-truck', capacity: 4, capacityUnit: 't', odometerKm: 51770, nextService: { kind: 'in-workshop' }, status: 'in-maintenance' },
  { plate: 'WP KD-2210', model: 'Tata LPT 1615', year: 2019, chassisNo: 'LPT1615-192210', type: 'heavy-truck', capacity: 9, capacityUnit: 't', odometerKm: 143880, nextService: { kind: 'due-in', km: 650 }, status: 'available' },
  { plate: 'WP LH-6620', model: 'Isuzu Forward', year: 2020, chassisNo: 'FRR90-206620', type: 'refrigerated-truck', capacity: 6, capacityUnit: 't', odometerKm: 118300, nextService: { kind: 'due-in', km: 2100 }, status: 'on-trip' },
  { plate: 'CP PC-0418', model: 'Toyota Hilux', year: 2022, chassisNo: 'GUN125-220418', type: 'pickup', capacity: 1, capacityUnit: 't', odometerKm: 38900, nextService: { kind: 'due-in', km: 1100 }, status: 'available' },
  { plate: 'SP LB-7731', model: 'Ashok Leyland Ecomet', year: 2017, chassisNo: 'ECO1215-177731', type: 'heavy-truck', capacity: 12, capacityUnit: 't', odometerKm: 302450, nextService: { kind: 'overdue', km: 900 }, status: 'out-of-service' },
  { plate: 'WP CAD-1290', model: 'Nissan Caravan', year: 2021, chassisNo: 'E26-211290', type: 'van', capacity: 900, capacityUnit: 'kg', odometerKm: 72840, nextService: { kind: 'in-workshop' }, status: 'in-maintenance' },
]
