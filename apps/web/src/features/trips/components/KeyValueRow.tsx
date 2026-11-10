import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type KeyValueRowProps = {
  label: string
  children: ReactNode
  /** JetBrains Mono for IDs, plates and amounts. */
  mono?: boolean
}

/** "Label ........ value" row used in the detail side cards. */
export function KeyValueRow({ label, children, mono = false }: KeyValueRowProps) {
  return (
    <div className="flex items-start gap-3 text-[13px]">
      <dt className="min-w-0 flex-1 text-muted-foreground">{label}</dt>
      <dd className={cn('text-right font-medium', mono && 'font-mono')}>{children}</dd>
    </div>
  )
}
