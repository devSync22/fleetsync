import { Fragment } from 'react'
import { ChevronRight } from 'lucide-react'

const steps = [
  { title: 'Submitted', detail: 'Applicant fills the generated application form' },
  { title: 'Review', detail: 'Check details, documents and automatic checks' },
  { title: 'Decision', detail: 'Approve or reject' },
  { title: 'Provision', detail: 'Account created and setup link emailed' },
]

/** The four-step "how applications work" strip at the top of the Applications page. */
export function ProcessSteps() {
  return (
    <ol className="grid gap-4 rounded-xl border bg-card px-5 py-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
      {steps.map((step, i) => (
        <Fragment key={step.title}>
          {i > 0 && <ChevronRight className="hidden size-4 text-faint md:block" aria-hidden />}
          <li className="flex items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
              {i + 1}
            </span>
            <span className="flex flex-col">
              <span className="text-[13px] font-semibold">{step.title}</span>
              <span className="text-xs text-muted-foreground">{step.detail}</span>
            </span>
          </li>
        </Fragment>
      ))}
    </ol>
  )
}
