import { MousePointerClick } from 'lucide-react'

/** Shown in the panel's place before a row is picked. */
export function NoEventSelected() {
  return (
    <section className="flex flex-col items-center gap-2 rounded-xl border bg-card px-6 py-10 text-center">
      <MousePointerClick className="size-6 text-faint" aria-hidden />
      <p className="text-sm font-semibold">Pick an event</p>
      <p className="text-[13px] text-muted-foreground">Select a row to see who did what, what changed and from where.</p>
    </section>
  )
}
