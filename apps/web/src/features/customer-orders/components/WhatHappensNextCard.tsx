const steps = [
  'A coordinator reviews your order.',
  'You get a fare quotation by email and here.',
  'Accept it and pay online. Your trip is then scheduled.',
]

/** "What happens next" side card of New transport order. */
export function WhatHappensNextCard() {
  return (
    <section className="flex flex-col gap-2.5 rounded-xl border bg-card px-5 py-4">
      <h2 className="text-[13px] font-semibold">What happens next</h2>
      <ol className="flex flex-col gap-2.5">
        {steps.map((text, i) => (
          <li key={text} className="flex items-start gap-2.5">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-muted-foreground">
              {i + 1}
            </span>
            <span className="text-[13px] leading-5">{text}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
