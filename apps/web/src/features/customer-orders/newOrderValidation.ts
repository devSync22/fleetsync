import { combine, parseDate, parseNumber } from './newOrderFormat'
import { DESCRIPTION_MAX, packingTypes } from './newOrderOptions'
import type { NewOrderDraft, NewOrderErrors, NewOrderStep } from './types'

/*
 * Validation for the New transport order wizard: one function per step, each returning
 * field → message for every problem it finds (empty object when the step is fine).
 */

const PHONE_HINT = 'Enter a 10-digit number starting with 0, e.g. 077 214 5590.'

/** Sri Lankan phone: 10 digits starting with 0; spaces and dashes are ignored. */
export function isSriLankanPhone(value: string) {
  return /^0\d{9}$/.test(value.replace(/[\s-]/g, ''))
}

function phoneError(value: string) {
  if (!value.trim()) return 'Enter a phone number.'
  return isSriLankanPhone(value) ? undefined : PHONE_HINT
}

const required = (value: string, message: string) => (value.trim() ? undefined : message)

const tooLong = (value: string) =>
  value.length > DESCRIPTION_MAX ? `Keep it to ${DESCRIPTION_MAX} characters (now ${value.length}).` : undefined

/** Drops fields without a message so `Object.keys(errors).length` counts real errors. */
function clean(errors: NewOrderErrors): NewOrderErrors {
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as NewOrderErrors
}

/** Step 1 — pickup and destination. `now` is a parameter so the rules can be tested. */
export function validateRoute({ pickup, destination }: NewOrderDraft, now = new Date()): NewOrderErrors {
  const errors: NewOrderErrors = {
    'pickup.address': required(pickup.address, 'Enter the pickup address.'),
    'pickup.city': required(pickup.city, 'Choose the pickup city.'),
    'pickup.date': required(pickup.date, 'Choose a pickup date.'),
    'pickup.time': required(pickup.time, 'Choose a pickup time.'),
    'pickup.contactName': required(pickup.contactName, 'Enter the contact person’s name.'),
    'pickup.contactPhone': phoneError(pickup.contactPhone),
    'destination.address': required(destination.address, 'Enter the destination address.'),
    'destination.city': required(destination.city, 'Choose the destination city.'),
    'destination.receiverName': required(destination.receiverName, 'Enter the receiver’s name.'),
    'destination.receiverPhone': phoneError(destination.receiverPhone),
  }

  // Pickup in the future: a past day is a date error; today at a time that has passed is a time error.
  const pickupDay = parseDate(pickup.date)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (pickupDay && pickupDay < today) {
    errors['pickup.date'] = 'Choose a date from today onwards.'
  } else if (pickupDay && pickup.time) {
    const pickupAt = combine(pickup.date, pickup.time)
    if (pickupAt && pickupAt <= now) errors['pickup.time'] = 'This time has already passed. Choose a later time.'
  }

  // Deliver-by (optional) must be after pickup. A time without a date means the pickup day.
  if (destination.deliverByDate || destination.deliverByTime) {
    const pickupAt = combine(pickup.date, pickup.time)
    const deliverDate = destination.deliverByDate || pickup.date
    const deliverAt = combine(deliverDate, destination.deliverByTime, '23:59')
    if (destination.deliverByDate && !parseDate(destination.deliverByDate)) {
      errors['destination.deliverByDate'] = 'Choose a valid date.'
    } else if (pickupAt && deliverAt && deliverAt <= pickupAt) {
      errors['destination.deliverByDate'] = 'Deliver-by must be after the pickup date and time.'
    }
  }

  return clean(errors)
}

/** Step 2 — cargo and handling. */
export function validateCargo({ cargo }: NewOrderDraft): NewOrderErrors {
  const unit = cargo.packing ? packingTypes[cargo.packing].unit[1] : 'units'
  const weight = parseNumber(cargo.weightKg)
  const quantity = parseNumber(cargo.quantity)

  return clean({
    'cargo.cargoType': required(cargo.cargoType, 'Choose the cargo type.'),
    'cargo.packing': cargo.packing ? undefined : 'Choose how the cargo is packed.',
    'cargo.weightKg': !cargo.weightKg.trim()
      ? 'Enter the total weight.'
      : Number.isFinite(weight) && weight > 0
        ? undefined
        : 'Enter a weight above 0 kg, e.g. 8000.',
    'cargo.quantity': !cargo.quantity.trim()
      ? `Enter the number of ${unit}.`
      : Number.isInteger(quantity) && quantity > 0
        ? undefined
        : 'Enter a whole number above 0.',
    'cargo.description': tooLong(cargo.description),
    'cargo.noteForCoordinator': tooLong(cargo.noteForCoordinator),
  })
}

/** Errors for one step; the Review step re-checks everything. */
export function validateStep(step: NewOrderStep, draft: NewOrderDraft, now = new Date()): NewOrderErrors {
  if (step === 1) return validateRoute(draft, now)
  if (step === 2) return validateCargo(draft)
  return { ...validateRoute(draft, now), ...validateCargo(draft) }
}
