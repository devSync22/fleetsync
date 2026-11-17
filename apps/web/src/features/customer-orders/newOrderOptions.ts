import type { HandlingFlag, NewOrderDraft, NewOrderField, NewOrderStep, PackingType } from './types'

/*
 * Choices for the New transport order form.
 * TODO: load cities and cargo types from the reference-data endpoint once it exists.
 */

export const cities = [
  'Colombo 03',
  'Colombo 10',
  'Colombo 15',
  'Nugegoda',
  'Peliyagoda',
  'Ja-Ela',
  'Negombo',
  'Gampaha',
  'Panadura',
  'Kalutara',
  'Galle',
  'Matara',
  'Hambantota',
  'Ratnapura',
  'Kegalle',
  'Kandy',
  'Matale',
  'Dambulla',
  'Nuwara Eliya',
  'Badulla',
  'Kurunegala',
  'Anuradhapura',
  'Trincomalee',
  'Batticaloa',
  'Jaffna',
]

export const cargoTypes = [
  'Ceramic tiles',
  'Cement',
  'Building materials',
  'Electrical goods',
  'Machinery',
  'Food and beverages',
  'Fresh produce',
  'Textiles',
  'General freight',
]

type PackingConfig = {
  label: string
  /** Singular and plural unit, e.g. ["pallet", "pallets"]. */
  unit: [string, string]
  quantityLabel: string
  sizeLabel: string
  sizePlaceholder: string
  weightHint: string
  /** "Ceramic tiles on pallets". */
  cargoPhrase: string
  /** How the unit size reads after the count: "(1.2 × 1.0 m)", "(50 kg each)". */
  sizeText: (size: string) => string
}

export const packingTypes: Record<PackingType, PackingConfig> = {
  pallets: {
    label: 'Pallets',
    unit: ['pallet', 'pallets'],
    quantityLabel: 'Number of pallets',
    sizeLabel: 'Pallet size',
    sizePlaceholder: '1.2 × 1.0 m',
    weightHint: 'Include pallets and packing.',
    cargoPhrase: 'on pallets',
    sizeText: (size) => `(${size})`,
  },
  cartons: {
    label: 'Cartons / boxes',
    unit: ['carton', 'cartons'],
    quantityLabel: 'Number of cartons',
    sizeLabel: 'Carton size (L × W × H)',
    sizePlaceholder: '60 × 40 × 40 cm',
    weightHint: 'Include the packing.',
    cargoPhrase: 'in cartons',
    sizeText: (size) => `(${size})`,
  },
  bags: {
    label: 'Bags / sacks',
    unit: ['bag', 'bags'],
    quantityLabel: 'Number of bags',
    sizeLabel: 'Weight per bag',
    sizePlaceholder: '50 kg',
    weightHint: 'Include the packing.',
    cargoPhrase: 'in bags',
    sizeText: (size) => `(${size} each)`,
  },
  'loose-items': {
    label: 'Loose items (no packing)',
    unit: ['item', 'items'],
    quantityLabel: 'Number of items',
    sizeLabel: 'Largest item (L × W × H)',
    sizePlaceholder: '2.4 × 1.2 × 1.5 m',
    weightHint: 'Total for all items.',
    cargoPhrase: 'as loose items',
    sizeText: (size) => `(largest ${size})`,
  },
}

export const packingOptions = (Object.keys(packingTypes) as PackingType[]).map((id) => ({ id, label: packingTypes[id].label }))

export const handlingOptions: { id: HandlingFlag; label: string }[] = [
  { id: 'fragile', label: 'Fragile' },
  { id: 'keep-upright', label: 'Keep upright' },
  { id: 'covered-truck', label: 'Needs a covered truck' },
  { id: 'forklift-pickup', label: 'Forklift at pickup' },
  { id: 'forklift-destination', label: 'Forklift at destination' },
  { id: 'loading-help', label: 'Loading help needed' },
]

export const newOrderSteps: { step: NewOrderStep; title: string; description: string }[] = [
  {
    step: 1,
    title: 'Pickup and destination',
    description: 'Tell us where to pick up and deliver. A coordinator reviews your order and sends you a fare quotation.',
  },
  {
    step: 2,
    title: 'Cargo details',
    description: 'Describe what we are moving so the coordinator can pick the right vehicle and price it.',
  },
  {
    step: 3,
    title: 'Review and submit',
    description: 'Check your order before you submit it. You can go back and change anything.',
  },
]

export const DESCRIPTION_MAX = 500

export const emptyDraft: NewOrderDraft = {
  pickup: { address: '', city: '', date: '', time: '', contactName: '', contactPhone: '' },
  destination: { address: '', city: '', deliverByDate: '', deliverByTime: '', receiverName: '', receiverPhone: '' },
  cargo: {
    cargoType: '',
    packing: '',
    weightKg: '',
    quantity: '',
    unitSize: '',
    description: '',
    handling: [],
    noteForCoordinator: '',
  },
}

/** DOM id of a field's control, so labels, errors and "focus the first error" agree. */
export const fieldId = (field: NewOrderField) => `new-order-${field.replace('.', '-')}`

/** aria props for a control inside FormField, so screen readers read its error (or helper). */
export function fieldAria(id: string, { error, helper }: { error?: string; helper?: unknown }) {
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : helper ? `${id}-helper` : undefined,
  }
}
