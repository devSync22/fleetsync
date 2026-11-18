import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Label over value, as in the profile and company sheets ("Email / kasun.p@fms.lk"). */
export function ProfileField({ label, children, mono = false }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn('text-sm break-words', mono && 'font-mono')}>{children}</dd>
    </div>
  )
}
