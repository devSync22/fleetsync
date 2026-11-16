import { CreditCard, Lock } from 'lucide-react'

const brands = ['VISA', 'Mastercard', 'Amex']

/**
 * "Pay by debit or credit card". Deliberately has no card fields (unlike the Figma frame):
 * card details are entered only in PayHere's own window, never in FleetSync.
 */
export function CardPaymentCard() {
  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <CreditCard className="size-5 shrink-0" aria-hidden />
        <h2 className="min-w-0 flex-1 text-base font-semibold">Pay by debit or credit card</h2>
        <ul className="flex gap-2.5" aria-label="Accepted cards">
          {brands.map((brand) => (
            <li key={brand} className="rounded border px-2 py-[3px] text-[11px] font-semibold text-muted-foreground">
              {brand}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-sm leading-5">You’ll enter your card details in PayHere’s secure window.</p>
      <p className="flex items-center gap-2.5 rounded-lg bg-background px-3.5 py-2.5 text-xs leading-[18px] text-muted-foreground">
        <Lock className="size-4 shrink-0" aria-hidden />
        Card details go straight to the payment gateway over a secure connection. FleetSync never stores your full card number.
      </p>
    </section>
  )
}
