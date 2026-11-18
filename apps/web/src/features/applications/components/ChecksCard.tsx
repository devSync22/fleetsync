import { CircleCheck, TriangleAlert } from 'lucide-react'
import { SectionCard } from '@/components/shared/SectionCard'
import type { AutomaticCheck } from '../types'

/** "Automatic checks": run when the form was submitted; a warning means a manual check is needed. */
export function ChecksCard({ checks }: { checks: AutomaticCheck[] }) {
  return (
    <SectionCard title="Automatic checks" subtitle="Run when the form was submitted">
      <ul className="flex flex-col gap-2.5 px-5 py-4">
        {checks.map((check) => (
          <li key={check.label} className="flex items-start gap-2.5 text-[13px]">
            {check.passed ? (
              <CircleCheck className="mt-px size-4 shrink-0 text-success" aria-label="Passed" />
            ) : (
              <TriangleAlert className="mt-px size-4 shrink-0 text-pending" aria-label="Needs attention" />
            )}
            {check.label}
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
