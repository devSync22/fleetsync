import { Check } from 'lucide-react'
import logoIcon from '@/assets/logo-icon.svg'
import { SectionCard } from '@/components/shared/SectionCard'

type DriverNotificationPreviewProps = {
  title: string
  body: string
  /** What happens on the driver's side, shown as a checklist next to the preview. */
  effects: string[]
}

/** "What the driver sees": a mock push notification as it appears on the Driver app. */
export function DriverNotificationPreview({ title, body, effects }: DriverNotificationPreviewProps) {
  return (
    <SectionCard title="What the driver sees" subtitle="Preview of the push notification on the Driver app">
      <div className="flex flex-wrap items-center gap-6 p-5">
        <div className="w-full max-w-[380px] rounded-[14px] bg-secondary p-5">
          <div className="flex gap-3 rounded-[10px] border bg-card p-3 shadow-sm">
            <img src={logoIcon} alt="" width={36} height={36} className="size-9 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>FleetSync</span>
                <span className="text-faint">now</span>
              </div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-[13px] leading-[18px]">{body}</p>
            </div>
          </div>
        </div>
        <ul className="flex min-w-[220px] flex-1 flex-col gap-2.5 text-[13px]">
          {effects.map((effect) => (
            <li key={effect} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              {effect}
            </li>
          ))}
        </ul>
      </div>
    </SectionCard>
  )
}
