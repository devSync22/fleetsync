import { Check } from 'lucide-react'
import logoIcon from '@/assets/logo-icon.svg'
import { SectionCard } from '@/components/shared/SectionCard'

type NotificationPreviewProps = {
  /** Who receives it, e.g. "driver" → "What the driver sees". */
  audience: 'driver' | 'customer'
  title: string
  body: string
  /** What happens on their side, shown as a checklist next to the preview. */
  effects: string[]
}

const subtitles = {
  driver: 'Preview of the push notification on the Driver app',
  customer: 'Preview of the notification in the customer’s account',
}

/** "What the driver / customer sees": a mock FleetSync notification next to what it does. */
export function NotificationPreview({ audience, title, body, effects }: NotificationPreviewProps) {
  return (
    <SectionCard title={`What the ${audience} sees`} subtitle={subtitles[audience]}>
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
