/** A maintenance service and its interval; whichever limit (km or months) comes first triggers it. */
export type ServiceType = {
  id: string
  name: string
  /** Muted second line: "Most common service". */
  note: string
  everyKm: number | null
  everyMonths: number | null
  /** "All vehicle types", "Heavy trucks", "Trucks, vans". */
  appliesTo: string
  typicalCost: number
  /** Turned-off types are hidden from new maintenance records; past records keep them. */
  active: boolean
}

/** The simpler lookup lists (no frames of their own): a name, a detail line and an on/off switch. */
export type LookupListId = 'vehicle-types' | 'cargo-types' | 'depots' | 'licence-classes'

export type LookupItem = { id: string; name: string; detail: string; active: boolean }

export type ReferenceTab = 'service-types' | LookupListId

export type ReferenceData = {
  serviceTypes: ServiceType[]
  lists: Record<LookupListId, LookupItem[]>
}

export type ServiceTypeInput = Omit<ServiceType, 'id' | 'active'>
export type LookupItemInput = Omit<LookupItem, 'id' | 'active'>
