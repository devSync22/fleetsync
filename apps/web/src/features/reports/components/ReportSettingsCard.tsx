import { useState, type ReactNode } from 'react'
import { FilterSelect } from '@/components/shared/FilterSelect'
import { SectionCard } from '@/components/shared/SectionCard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { bases, customers, periods, reportTypes } from '../reportOptions'
import { defaultSettings } from '../services/reportsApi'
import type { ReportSettings } from '../types'

type ReportSettingsCardProps = {
  generating: boolean
  onGenerate: (settings: ReportSettings) => void
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium">{label}</span>
      {children}
    </div>
  )
}

/** "Report settings": type, period, base and customer, then Generate report. */
export function ReportSettingsCard({ generating, onGenerate }: ReportSettingsCardProps) {
  const [settings, setSettings] = useState<ReportSettings>(defaultSettings)
  const set = <K extends keyof ReportSettings>(key: K, value: ReportSettings[K]) => setSettings((s) => ({ ...s, [key]: value }))

  return (
    <SectionCard title="Report settings">
      <div className="flex flex-col gap-4 px-5 py-[18px]">
        <Field label="Report type">
          <div role="radiogroup" aria-label="Report type" className="grid gap-2 lg:grid-cols-2 xl:grid-cols-1">
            {reportTypes.map((type) => {
              const checked = settings.type === type.id
              return (
                <label
                  key={type.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                    checked ? 'border-[1.5px] border-brand bg-brand-soft' : 'hover:bg-secondary/60',
                  )}
                >
                  <input
                    type="radio"
                    name="report-type"
                    value={type.id}
                    checked={checked}
                    onChange={() => set('type', type.id)}
                    className="mt-0.5 size-4 shrink-0 accent-brand"
                  />
                  <span className="flex flex-col gap-px">
                    <span className="text-sm font-medium">{type.label}</span>
                    <span className="text-xs text-muted-foreground">{type.description}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </Field>
        <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-1">
        <Field label="Period">
          <FilterSelect label="Period" value={settings.period} onChange={(v) => set('period', v)} options={periods} className="w-full" />
        </Field>
        <Field label="Base">
          <FilterSelect label="Base" value={settings.base} onChange={(v) => set('base', v)} options={bases} className="w-full" />
        </Field>
        <Field label="Customer">
          <FilterSelect label="Customer" value={settings.customer} onChange={(v) => set('customer', v)} options={customers} className="w-full" />
        </Field>
        </div>
        <Button type="button" className="w-full" onClick={() => onGenerate(settings)} disabled={generating}>
          {generating ? 'Generating…' : 'Generate report'}
        </Button>
      </div>
    </SectionCard>
  )
}
