import { CircleCheck, CircleX, Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

/** Visual tones of the Figma "Banner" component. */
export type BannerTone = 'danger' | 'info' | 'success'

type BannerProps = {
  /** Short bold headline, e.g. "Incorrect email or password". */
  title: string
  /** Supporting sentence explaining what happened or what to do next. Can contain links. */
  message: ReactNode
  /** `danger` for errors (default), `info` for neutral information, `success` for confirmations. */
  tone?: BannerTone
  className?: string
}

const toneIcons = {
  danger: CircleX,
  info: Info,
  success: CircleCheck,
} satisfies Record<BannerTone, unknown>

/**
 * Inline status banner (Figma "Banner"), built on shadcn's Alert.
 * The icon and title take the tone colour; the message stays in the body colour.
 */
export function Banner({ title, message, tone = 'danger', className }: BannerProps) {
  const Icon = toneIcons[tone]

  return (
    <Alert
      variant={tone}
      // Errors interrupt screen readers right away (alert); info and success wait politely (status).
      role={tone === 'danger' ? 'alert' : 'status'}
      className={className}
    >
      <Icon aria-hidden="true" className="size-[18px]" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
