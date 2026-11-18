import type { ReactNode } from 'react'

/** Uppercase section heading with an optional link on the right (e.g. RECENT ACTIVITY · View all). */
export function ProfileSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}
