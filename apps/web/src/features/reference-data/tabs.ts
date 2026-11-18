import type { LookupListId, ReferenceTab } from './types'

/** Tabs in frame order, with the singular noun used by the "Add …" button and dialog. */
export const referenceTabs: { id: ReferenceTab; label: string; singular: string }[] = [
  { id: 'service-types', label: 'Service types', singular: 'service type' },
  { id: 'vehicle-types', label: 'Vehicle types', singular: 'vehicle type' },
  { id: 'cargo-types', label: 'Cargo types', singular: 'cargo type' },
  { id: 'depots', label: 'Depots', singular: 'depot' },
  { id: 'licence-classes', label: 'Licence classes', singular: 'licence class' },
]

export const isReferenceTab = (value: string | null): value is ReferenceTab => referenceTabs.some((t) => t.id === value)

/** Column headings and help text for the simple lookup lists. */
export const lookupCopy: Record<LookupListId, { nameHeader: string; detailHeader: string; note: string }> = {
  'vehicle-types': { nameHeader: 'Vehicle type', detailHeader: 'Description', note: 'Used on Add vehicle and to match vehicles to orders.' },
  'cargo-types': { nameHeader: 'Cargo type', detailHeader: 'Handling', note: 'Customers pick one when they place an order.' },
  depots: { nameHeader: 'Depot', detailHeader: 'Address', note: 'Staff are assigned to a depot when their account is created.' },
  'licence-classes': { nameHeader: 'Licence class', detailHeader: 'Allows', note: 'Checked against the vehicle type when a driver is assigned.' },
}
