import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { InfoNote } from '@/components/shared/InfoNote'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusTabs } from '@/components/shared/StatusTabs'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { useAction } from '@/hooks/useAction'
import { LookupItemDialog } from '../components/LookupItemDialog'
import { LookupTable } from '../components/LookupTable'
import { ServiceTypeDialog } from '../components/ServiceTypeDialog'
import { ServiceTypesTable } from '../components/ServiceTypesTable'
import { useReferenceData } from '../hooks/useReferenceData'
import { setLookupItemActive, setServiceTypeActive } from '../services/referenceDataApi'
import { isReferenceTab, lookupCopy, referenceTabs } from '../tabs'
import type { LookupItem, ReferenceData, ServiceType } from '../types'

/** Which add / edit dialog is open: `item` is undefined when adding. */
type Editing = { kind: 'service'; item?: ServiceType } | { kind: 'lookup'; item?: LookupItem } | null

/**
 * "Admin — Reference data / Service types" (113:3243) and the other lookup lists every screen uses.
 * The tab lives in the URL (`?tab=depots`).
 */
export function ReferenceDataPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const tab = isReferenceTab(tabParam) ? tabParam : 'service-types'
  const tabInfo = referenceTabs.find((t) => t.id === tab)!

  const { state, retry } = useReferenceData()
  // Local copy so switches and saves update in place without reloading the whole page.
  const [local, setLocal] = useState<ReferenceData | null>(null)
  const data = local ?? (state.status === 'success' ? state.data : null)
  const [editing, setEditing] = useState<Editing>(null)
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())
  const toggleService = useAction(setServiceTypeActive)
  const toggleLookup = useAction(setLookupItemActive)

  function update(change: (draft: ReferenceData) => void) {
    if (!data) return
    const next = structuredClone(data)
    change(next)
    setLocal(next)
  }

  function upsert<T extends { id: string }>(list: T[], item: T) {
    const index = list.findIndex((x) => x.id === item.id)
    if (index >= 0) list[index] = item
    else list.push(item)
  }

  /** Runs a save while marking the row's switch as busy. */
  async function withSaving<T>(id: string, work: () => Promise<T | undefined>) {
    setSavingIds((ids) => new Set(ids).add(id))
    const result = await work()
    setSavingIds((ids) => {
      const next = new Set(ids)
      next.delete(id)
      return next
    })
    return result
  }

  async function onToggleService(s: ServiceType, active: boolean) {
    const saved = await withSaving(s.id, () => toggleService.run(s.id, active))
    if (saved) update((d) => upsert(d.serviceTypes, saved))
  }

  async function onToggleLookup(item: LookupItem, active: boolean) {
    if (tab === 'service-types') return
    const saved = await withSaving(item.id, () => toggleLookup.run(tab, item.id, active))
    if (saved) update((d) => upsert(d.lists[tab], saved))
  }

  const tabs = referenceTabs.map((t) => ({
    id: t.id,
    label: t.label,
    count: data ? (t.id === 'service-types' ? data.serviceTypes.length : data.lists[t.id].length) : undefined,
  }))
  const toggleError = toggleService.error ?? toggleLookup.error

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reference data"
        description="The lists every other screen uses — service types, vehicle types, cargo types, depots and licence classes."
        actions={
          <Button type="button" onClick={() => setEditing(tab === 'service-types' ? { kind: 'service' } : { kind: 'lookup' })} disabled={!data}>
            <Plus aria-hidden />
            Add {tabInfo.singular}
          </Button>
        }
      />
      <StatusTabs label="Reference lists" tabs={tabs} activeId={tab} onChange={(id) => setSearchParams(id === 'service-types' ? {} : { tab: id })} />

      {tab === 'service-types' && (
        <Banner
          tone="info"
          title="Service intervals drive maintenance alerts"
          message="Upcoming and overdue services are worked out from each vehicle’s odometer readings and these intervals — whichever limit comes first."
        />
      )}
      {toggleError && <Banner tone="danger" title="Couldn’t save the change" message={toggleError.message} />}

      {state.status === 'loading' && <TableSkeleton rows={6} />}
      {state.status === 'error' && (
        <Banner
          tone="danger"
          title="Couldn’t load reference data"
          message={state.error.message}
          action={
            <Button type="button" variant="outline" size="sm" onClick={retry}>
              Try again
            </Button>
          }
        />
      )}

      {data && tab === 'service-types' && (
        <>
          <ServiceTypesTable
            serviceTypes={data.serviceTypes}
            onEdit={(item) => setEditing({ kind: 'service', item })}
            onToggle={onToggleService}
            savingIds={savingIds}
          />
          <InfoNote>Turning a type off hides it from new maintenance records. Past records keep it. Every change is recorded in the audit log.</InfoNote>
        </>
      )}
      {data && tab !== 'service-types' && (
        <>
          <LookupTable
            items={data.lists[tab]}
            nameHeader={lookupCopy[tab].nameHeader}
            detailHeader={lookupCopy[tab].detailHeader}
            onEdit={(item) => setEditing({ kind: 'lookup', item })}
            onToggle={onToggleLookup}
            savingIds={savingIds}
          />
          <InfoNote>{lookupCopy[tab].note} Turned-off entries stay on past records. Every change is recorded in the audit log.</InfoNote>
        </>
      )}

      {editing?.kind === 'service' && (
        <ServiceTypeDialog
          serviceType={editing.item}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            update((d) => upsert(d.serviceTypes, saved))
            setEditing(null)
          }}
        />
      )}
      {editing?.kind === 'lookup' && tab !== 'service-types' && (
        <LookupItemDialog
          list={tab}
          singular={tabInfo.singular}
          nameLabel={lookupCopy[tab].nameHeader}
          detailLabel={lookupCopy[tab].detailHeader}
          item={editing.item}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            update((d) => upsert(d.lists[tab], saved))
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}
