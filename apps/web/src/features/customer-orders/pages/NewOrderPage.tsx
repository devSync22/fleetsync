import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { Link } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { CargoStep } from '../components/CargoStep'
import { NewOrderStepper } from '../components/NewOrderStepper'
import { OrderSoFarCard } from '../components/OrderSoFarCard'
import { ReviewStep } from '../components/ReviewStep'
import { RouteStep } from '../components/RouteStep'
import { WhatHappensNextCard } from '../components/WhatHappensNextCard'
import { useNewOrderWizard } from '../hooks/useNewOrderWizard'
import { newOrderSteps } from '../newOrderOptions'

/** "Customer — New order" wizard: 1 Route (152:5434), 2 Cargo (155:5503 + packing variants), 3 Review (156:5595). */
export function NewOrderPage() {
  const wizard = useNewOrderWizard()
  const { step, draft, errors } = wizard
  const topRef = useRef<HTMLDivElement>(null)

  // Each step starts at the top of the page.
  useEffect(() => {
    topRef.current?.scrollIntoView({ block: 'start' })
  }, [step])

  return (
    <div ref={topRef} className="flex scroll-mt-6 flex-col gap-6">
      <PageHeader title="New transport order" description={newOrderSteps[step - 1].description} />
      <NewOrderStepper current={step} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <form
          noValidate
          className="flex min-w-0 flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            if (step === 3) void wizard.submitOrder()
            else wizard.next()
          }}
        >
          {step === 1 && (
            <RouteStep
              pickup={draft.pickup}
              destination={draft.destination}
              errors={errors}
              onPickupChange={wizard.setPickup}
              onDestinationChange={wizard.setDestination}
            />
          )}
          {step === 2 && (
            <CargoStep cargo={draft.cargo} errors={errors} onChange={wizard.setCargo} onToggleHandling={wizard.toggleHandling} />
          )}
          {step === 3 && (
            <ReviewStep
              draft={draft}
              onEdit={wizard.goTo}
              confirmed={wizard.confirmed}
              confirmError={wizard.confirmError}
              onConfirmedChange={wizard.setConfirmed}
            />
          )}

          {wizard.submitError && (
            <Banner
              tone="danger"
              title="Couldn’t submit your order"
              message={`${wizard.submitError.message} Everything you typed is still here.`}
            />
          )}

          <div className="flex items-center gap-2">
            {step === 1 ? (
              <Button asChild variant="ghost" className="text-brand hover:text-brand">
                <Link to="/customer/orders">Cancel</Link>
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={wizard.back} disabled={wizard.submitting}>
                Back
              </Button>
            )}
            <span className="flex-1" />
            <Button type="submit" disabled={wizard.submitting}>
              {step === 1 && 'Next: cargo details'}
              {step === 2 && 'Next: review order'}
              {step === 3 &&
                (wizard.submitting ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden />
                    Submitting…
                  </>
                ) : (
                  'Submit order'
                ))}
            </Button>
          </div>
        </form>

        <aside className="flex flex-col gap-5">
          {step < 3 && <OrderSoFarCard draft={draft} step={step} />}
          <WhatHappensNextCard />
        </aside>
      </div>
    </div>
  )
}
