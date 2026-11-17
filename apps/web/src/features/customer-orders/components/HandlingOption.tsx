import { cn } from '@/lib/utils'
import { CheckboxMark } from './CheckboxMark'

type HandlingOptionProps = { label: string; checked: boolean; onToggle: () => void }

/** One "Handling and transport needs" tick: a checkbox drawn as a chip. */
export function HandlingOption({ label, checked, onToggle }: HandlingOptionProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-[9px] text-sm select-none has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
        checked ? 'border-[1.5px] border-brand bg-brand-soft font-medium' : 'border border-line bg-card hover:bg-secondary',
      )}
    >
      <input type="checkbox" className="sr-only" checked={checked} onChange={onToggle} />
      <CheckboxMark checked={checked} />
      {label}
    </label>
  )
}
