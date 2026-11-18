import type { ReferenceData } from '../types'

/** Service types from "Admin — Reference data / Service types" (113:3243); the other lists match the rest of the app. */
export const referenceDataMock: ReferenceData = {
  serviceTypes: [
    { id: 'SVC-01', name: 'Engine oil & filter', note: 'Most common service', everyKm: 5000, everyMonths: 3, appliesTo: 'All vehicle types', typicalCost: 18500, active: true },
    { id: 'SVC-02', name: 'Brake inspection', note: 'Pads, discs and fluid', everyKm: 20000, everyMonths: 12, appliesTo: 'All vehicle types', typicalCost: 12000, active: true },
    { id: 'SVC-03', name: 'Tyre rotation', note: 'Even tyre wear', everyKm: 10000, everyMonths: null, appliesTo: 'Trucks, vans', typicalCost: 4500, active: true },
    { id: 'SVC-04', name: 'Air filter replacement', note: 'Engine air intake', everyKm: 15000, everyMonths: null, appliesTo: 'All vehicle types', typicalCost: 6800, active: true },
    { id: 'SVC-05', name: 'Major service', note: 'Full inspection', everyKm: 100000, everyMonths: 24, appliesTo: 'Heavy trucks', typicalCost: 145000, active: true },
    { id: 'SVC-06', name: 'Revenue licence renewal', note: 'Government requirement', everyKm: null, everyMonths: 12, appliesTo: 'All vehicle types', typicalCost: 9200, active: true },
    { id: 'SVC-07', name: 'Emission test', note: 'Government requirement', everyKm: null, everyMonths: 12, appliesTo: 'All vehicle types', typicalCost: 1800, active: true },
    { id: 'SVC-08', name: 'Fire extinguisher check', note: 'Replaced by safety audit', everyKm: null, everyMonths: 6, appliesTo: 'Heavy trucks', typicalCost: 2500, active: false },
  ],
  lists: {
    'vehicle-types': [
      { id: 'VT-1', name: 'Light truck', detail: 'Up to 5 t', active: true },
      { id: 'VT-2', name: 'Heavy truck', detail: '5 t and above', active: true },
      { id: 'VT-3', name: 'Van', detail: 'Small loads and parcels', active: true },
      { id: 'VT-4', name: 'Pickup', detail: 'Short local trips', active: true },
      { id: 'VT-5', name: 'Refrigerated truck', detail: 'Cold chain cargo', active: true },
    ],
    'cargo-types': [
      { id: 'CT-1', name: 'Pallets', detail: 'Forklift loading', active: true },
      { id: 'CT-2', name: 'Cartons', detail: 'Hand loading, stackable', active: true },
      { id: 'CT-3', name: 'Bags', detail: 'Sacks of loose goods', active: true },
      { id: 'CT-4', name: 'Loose items', detail: 'Irregular shapes', active: true },
      { id: 'CT-5', name: 'Chilled goods', detail: 'Refrigerated truck only', active: true },
      { id: 'CT-6', name: 'Fragile goods', detail: 'Extra padding and care', active: true },
      { id: 'CT-7', name: 'Machinery', detail: 'Heavy truck, crane at site', active: true },
      { id: 'CT-8', name: 'Construction material', detail: 'Tiles, cement, steel', active: true },
      { id: 'CT-9', name: 'Hazardous goods', detail: 'No longer accepted', active: false },
    ],
    depots: [
      { id: 'DP-1', name: 'Colombo depot', detail: 'No. 120, Baseline Road, Colombo 09', active: true },
      { id: 'DP-2', name: 'Kandy depot', detail: 'No. 45, Katugastota Road, Kandy', active: true },
      { id: 'DP-3', name: 'Galle depot', detail: 'Harbour Road, Galle', active: true },
      { id: 'DP-4', name: 'Kurunegala depot', detail: 'No. 8, Puttalam Road, Kurunegala', active: true },
    ],
    'licence-classes': [
      { id: 'LC-1', name: 'Light vehicle (B)', detail: 'Vans, pickups, light trucks up to 3.5 t', active: true },
      { id: 'LC-2', name: 'Heavy vehicle (C)', detail: 'Trucks above 3.5 t', active: true },
      { id: 'LC-3', name: 'Heavy combination (CE)', detail: 'Trucks with a trailer', active: true },
      { id: 'LC-4', name: 'Light combination (BE)', detail: 'Light vehicles with a trailer', active: true },
    ],
  },
}
