import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { EmptyState } from '@/components/shared/EmptyState'
import { FilterSelect } from '@/components/shared/FilterSelect'
import { ListSearchBox } from '@/components/shared/ListSearchBox'
import { PageHeader } from '@/components/shared/PageHeader'
import { TablePagination } from '@/components/shared/TablePagination'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { SearchX } from 'lucide-react'
import { AuditTable } from '../components/AuditTable'
import { EventDetailsPanel } from '../components/EventDetailsPanel'
import { ExportAuditDialog } from '../components/ExportAuditDialog'
import { NoEventSelected } from '../components/NoEventSelected'
import { useAuditLog } from '../hooks/useAuditLog'
import { auditModules, periodOptions } from '../labels'

const resultOptions = [
  { id: 'all', label: 'All results' },
  { id: 'success', label: 'Success' },
  { id: 'failed', label: 'Failed' },
]
const moduleOptions = [{ id: 'all', label: 'All modules' }, ...auditModules.map((m) => ({ id: m, label: m }))]

/**
 * "Admin — Audit log" (95:1894) and its Export dialog (106:2706). Read-only.
 * `?export=1` (from the dashboard's "Export audit log") opens the export dialog straight away.
 */
export function AuditLogPage() {
  const { state, retry, query, setQuery } = useAuditLog()
  const [searchParams, setSearchParams] = useSearchParams()
  const [exporting, setExporting] = useState(searchParams.get('export') === '1')
  const [notice, setNotice] = useState<string | null>(null)
  const data = state.status === 'success' ? state.data : null
  // With nothing picked, show the first event of the page.
  const selectedId = query.event || data?.items[0]?.eventId || ''

  const periodLabel = periodOptions().find((p) => p.id === query.period)?.label.toLowerCase() ?? ''
  const first = data && data.total ? (data.page - 1) * data.pageSize + 1 : 0
  const last = data ? first + data.items.length - 1 : 0
  const summary = data
    ? `Showing ${first}–${last} of ${data.total.toLocaleString('en-LK')} events ${query.period === 'today' ? 'today' : `in the ${periodLabel}`}`
    : ''
  const userOptions = [{ id: 'all', label: 'All users' }, ...(data?.users ?? []).map((u) => ({ id: u, label: u }))]

  function closeExport() {
    setExporting(false)
    if (searchParams.has('export')) {
      setSearchParams((params) => {
        const next = new URLSearchParams(params)
        next.delete('export')
        return next
      }, { replace: true })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audit log"
        description="Every sign-in, create, update and delete across the system. Records are read-only and kept for 7 years."
        actions={
          <Button type="button" variant="outline" onClick={() => setExporting(true)}>
            Export report
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-3.5">
        <ListSearchBox
          value={query.search}
          onChange={(v) => setQuery('search', v, { replace: true })}
          placeholder="Search user, action or record ID"
          className="w-auto min-w-[260px] flex-1"
        />
        <div className="flex flex-wrap justify-end gap-3">
          <FilterSelect label="Period" value={query.period} options={periodOptions()} onChange={(v) => setQuery('period', v)} className="w-[150px]" />
          <FilterSelect label="User" value={query.user} options={userOptions} onChange={(v) => setQuery('user', v)} className="w-[150px]" />
          <FilterSelect label="Module" value={query.module} options={moduleOptions} onChange={(v) => setQuery('module', v)} className="w-[150px]" />
          <FilterSelect label="Result" value={query.result} options={resultOptions} onChange={(v) => setQuery('result', v)} className="w-[150px]" />
        </div>
      </div>

      {notice && <Banner tone="success" title="Report downloaded" message={notice} />}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="overflow-hidden rounded-xl border bg-card">
          {state.status === 'loading' && <TableSkeleton rows={8} withHeader={false} className="rounded-none border-0" />}
          {state.status === 'error' && (
            <div className="p-5">
              <Banner
                tone="danger"
                title="Couldn’t load the audit log"
                message={state.error.message}
                action={
                  <Button type="button" variant="outline" size="sm" onClick={retry}>
                    Try again
                  </Button>
                }
              />
            </div>
          )}
          {data &&
            (data.items.length > 0 ? (
              <>
                <AuditTable events={data.items} selectedId={selectedId} onSelect={(id) => setQuery('event', id, { keepPage: true })} />
                {data.pageCount > 1 ? (
                  <TablePagination
                    page={data.page}
                    pageCount={data.pageCount}
                    pageSize={data.pageSize}
                    onChange={(page) => setQuery('page', String(page))}
                    label={summary}
                  />
                ) : (
                  <p className="border-t px-5 py-3 text-[13px] text-muted-foreground">{summary}</p>
                )}
              </>
            ) : (
              <EmptyState bare icon={SearchX} title="No events found" description="Try a longer period or clear the filters." />
            ))}
        </section>

        {selectedId ? (
          <EventDetailsPanel key={selectedId} eventId={selectedId} onShowRecordEvents={(record) => setQuery('search', record)} />
        ) : (
          <NoEventSelected />
        )}
      </div>

      {exporting && (
        <ExportAuditDialog
          filters={{ user: query.user, module: query.module, result: query.result }}
          onClose={closeExport}
          onExported={(count) => {
            closeExport()
            setNotice(`${count.toLocaleString('en-LK')} events were exported. The export was recorded in the audit log.`)
          }}
        />
      )}
    </div>
  )
}
