import { cn } from '@/lib/utils'

/**
 * "CURRENT 077 123 4567" / "NEW 076 882 3301" boxes. The old value is grey and never struck through
 * (team UI rule); the new one is on accent-soft.
 */
export function ValueBox({ label, value, tone, mono = false }: { label: 'Current' | 'New'; value: string; tone: 'old' | 'new'; mono?: boolean }) {
  return (
    <div className={cn('flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg px-3 py-2', tone === 'old' ? 'bg-secondary' : 'bg-brand-soft')}>
      <span className={cn('text-[10px] font-semibold tracking-[0.06em] uppercase', tone === 'old' ? 'text-muted-foreground' : 'text-brand')}>{label}</span>
      <span className={cn('text-sm break-words', tone === 'old' ? 'text-muted-foreground' : 'font-medium', mono && 'font-mono')}>{value}</span>
    </div>
  )
}
