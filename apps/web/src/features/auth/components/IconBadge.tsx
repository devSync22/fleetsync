import type { LucideIcon } from 'lucide-react'

type IconBadgeProps = {
  /** lucide-react icon shown in the circle, e.g. KeyRound or Lock. */
  icon: LucideIcon
}

/**
 * Decorative 44px accent-soft circle with an icon, shown above a page title
 * (Figma nodes 113:4303 / 113:4397, e.g. "Forgot password", "Set new password").
 */
export function IconBadge({ icon: Icon }: IconBadgeProps) {
  return (
    <div aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft">
      <Icon className="size-5 text-brand" />
    </div>
  )
}
