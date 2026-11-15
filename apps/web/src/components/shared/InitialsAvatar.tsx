import { cn } from '@/lib/utils'

type InitialsAvatarProps = {
  initials: string
  /** 32 = table rows, 36 = cards and lists, 40 = conversation header. */
  size?: 32 | 36 | 40
  /** Accent marks the selected person; surface sits on grey panels. */
  tone?: 'neutral' | 'accent' | 'surface'
  className?: string
}

const sizes = { 32: 'size-8 text-xs', 36: 'size-9 text-xs', 40: 'size-10 text-[13px]' }
const tones = {
  neutral: 'bg-secondary text-muted-foreground',
  accent: 'bg-brand-soft text-brand',
  surface: 'bg-card text-muted-foreground',
}

/** Round initials placeholder used for people (drivers, mechanics, customers). */
export function InitialsAvatar({ initials, size = 36, tone = 'neutral', className }: InitialsAvatarProps) {
  return (
    <div
      aria-hidden
      className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold', sizes[size], tones[tone], className)}
    >
      {initials}
    </div>
  )
}
