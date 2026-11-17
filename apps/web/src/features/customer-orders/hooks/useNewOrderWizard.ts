import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAction } from '@/hooks/useAction'
import { emptyDraft, fieldId } from '../newOrderOptions'
import { validateStep } from '../newOrderValidation'
import { createOrder } from '../services/customerOrdersApi'
import type {
  HandlingFlag,
  NewOrderCargo,
  NewOrderDestination,
  NewOrderDraft,
  NewOrderErrors,
  NewOrderField,
  NewOrderPickup,
  NewOrderStep,
} from '../types'

const noAttempts: Record<NewOrderStep, boolean> = { 1: false, 2: false, 3: false }

function focusFirst(errors: NewOrderErrors) {
  const first = Object.keys(errors)[0] as NewOrderField | undefined
  if (first) document.getElementById(fieldId(first))?.focus()
}

/**
 * State of the New transport order wizard. The draft lives here (not globally), so Back,
 * Next and the Review "Edit" links keep everything typed until the page is left.
 *
 * Errors appear for a step once Next was pressed on it, then update as the user types.
 */
export function useNewOrderWizard() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<NewOrderDraft>(emptyDraft)
  const [step, setStep] = useState<NewOrderStep>(1)
  const [attempted, setAttempted] = useState(noAttempts)
  const [confirmed, setConfirmed] = useState(false)
  const [confirmError, setConfirmError] = useState(false)
  const submit = useAction(createOrder)

  const errors: NewOrderErrors = {
    ...(attempted[1] || attempted[3] ? validateStep(1, draft) : {}),
    ...(attempted[2] || attempted[3] ? validateStep(2, draft) : {}),
  }

  const setPickup = useCallback(<K extends keyof NewOrderPickup>(key: K, value: NewOrderPickup[K]) => {
    setDraft((d) => ({ ...d, pickup: { ...d.pickup, [key]: value } }))
  }, [])

  const setDestination = useCallback(<K extends keyof NewOrderDestination>(key: K, value: NewOrderDestination[K]) => {
    setDraft((d) => ({ ...d, destination: { ...d.destination, [key]: value } }))
  }, [])

  const setCargo = useCallback(<K extends keyof NewOrderCargo>(key: K, value: NewOrderCargo[K]) => {
    setDraft((d) => ({ ...d, cargo: { ...d.cargo, [key]: value } }))
  }, [])

  const toggleHandling = useCallback((flag: HandlingFlag) => {
    setDraft((d) => {
      const has = d.cargo.handling.includes(flag)
      const handling = has ? d.cargo.handling.filter((f) => f !== flag) : [...d.cargo.handling, flag]
      return { ...d, cargo: { ...d.cargo, handling } }
    })
  }, [])

  /** Shows this step's errors and moves on only when there are none. */
  function next() {
    setAttempted((a) => ({ ...a, [step]: true }))
    const stepErrors = validateStep(step, draft)
    if (Object.keys(stepErrors).length > 0) {
      focusFirst(stepErrors)
      return
    }
    if (step < 3) setStep((step + 1) as NewOrderStep)
  }

  function back() {
    if (step > 1) setStep((step - 1) as NewOrderStep)
  }

  /** Review → "Edit" jumps straight to a step; what was typed stays. */
  function goTo(target: NewOrderStep) {
    setStep(target)
  }

  function setConfirmedValue(value: boolean) {
    setConfirmed(value)
    if (value) setConfirmError(false)
  }

  async function submitOrder() {
    setAttempted({ 1: true, 2: true, 3: true })
    // The draft may have become invalid since its step was passed (e.g. the pickup time is now in the past).
    for (const s of [1, 2] as const) {
      const stepErrors = validateStep(s, draft)
      if (Object.keys(stepErrors).length > 0) {
        setStep(s)
        return
      }
    }
    if (!confirmed) {
      setConfirmError(true)
      return
    }
    const created = await submit.run(draft)
    if (created) navigate(`/customer/orders/${created.orderId}`)
    // On failure useAction keeps the error and the draft stays as typed.
  }

  return {
    draft,
    step,
    errors,
    setPickup,
    setDestination,
    setCargo,
    toggleHandling,
    next,
    back,
    goTo,
    confirmed,
    confirmError,
    setConfirmed: setConfirmedValue,
    submitOrder,
    submitting: submit.pending,
    submitError: submit.error,
  }
}
