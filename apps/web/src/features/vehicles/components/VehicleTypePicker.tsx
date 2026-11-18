import { Check, ChevronDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { vehicleTypes } from '../vehicleLabels'
import type { VehicleType } from '../types'

/**
 * "Vehicle type" select with a hint under each option (Add vehicle, 378:7357).
 * A menu rather than a native select, because native options can't show the second line.
 */
export function VehicleTypePicker({ value, onChange }: { value: VehicleType; onChange: (type: VehicleType) => void }) {
  const selected = vehicleTypes.find((t) => t.id === value) ?? vehicleTypes[0]
  return (
    <div className="flex flex-col gap-1.5">
      <Label id="vehicle-type-label">Vehicle type</Label>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-labelledby="vehicle-type-label vehicle-type-value"
          className="flex h-[42px] w-full items-center justify-between rounded-lg border border-input bg-card px-3.5 text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:border-brand aria-expanded:ring-3 aria-expanded:ring-ring/30"
        >
          <span id="vehicle-type-value">{selected.label}</span>
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width) p-1.5">
          {vehicleTypes.map((type) => {
            const isSelected = type.id === value
            return (
              <DropdownMenuItem
                key={type.id}
                onSelect={() => onChange(type.id)}
                className={cn('items-center justify-between px-2.5 py-2', isSelected && 'bg-brand-soft focus:bg-brand-soft')}
              >
                <span className="flex flex-col">
                  <span className={cn('text-sm', isSelected && 'font-semibold text-brand')}>{type.label}</span>
                  <span className="text-xs text-muted-foreground">{type.hint}</span>
                </span>
                {isSelected && <Check className="size-4 text-brand" aria-hidden />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
