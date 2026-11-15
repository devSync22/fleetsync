import { Download, FileText } from 'lucide-react'
import { SectionCard } from '@/components/shared/SectionCard'
import { Button } from '@/components/ui/button'
import type { ReportExport } from '../types'

export function RecentExportsCard({ exports }: { exports: ReportExport[] }) {
  return (
    <SectionCard title="Recent exports">
      {exports.length === 0 ? (
        <p className="px-5 py-4 text-[13px] text-muted-foreground">Exported reports will be listed here.</p>
      ) : (
        <ul>
          {exports.slice(0, 5).map((item) => (
            <li key={item.id} className="flex items-center gap-2.5 border-b px-5 py-3 last:border-b-0">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <FileText className="size-4" aria-hidden />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-px">
                <span className="text-[13px] font-medium">{item.title}</span>
                <span className="text-xs text-muted-foreground">
                  {item.format} · {item.by} · {item.dateLabel}
                </span>
              </span>
              {/* TODO: download the file once the reports endpoint returns one */}
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Download ${item.title}`} className="text-brand">
                <Download className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
