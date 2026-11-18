import { ApiError } from '@/services/apiClient'
import { mockRequest } from '@/services/mockRequest'
import { referenceDataMock } from '../mocks/referenceDataMock'
import type { LookupItem, LookupItemInput, LookupListId, ReferenceData, ServiceType, ServiceTypeInput } from '../types'

/*
 * Mocked until the reference-data endpoints exist. Planned calls (admin only, every change audited):
 *   getReferenceData  → apiClient.get<ReferenceData>('/reference-data')
 *   saveServiceType   → apiClient.post('/reference-data/service-types', input) / .put(`…/${id}`, input)
 *   setServiceTypeActive → apiClient.put(`/reference-data/service-types/${id}/active`, { active })
 *   saveLookupItem / setLookupItemActive → the same under `/reference-data/${list}`
 * Changes are kept in memory for the session. In dev, `?mock=error` previews the error state.
 */

const data: ReferenceData = structuredClone(referenceDataMock)
let nextId = 100

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

export async function getReferenceData(): Promise<ReferenceData> {
  await mockRequest()
  return structuredClone(data)
}

/** Creates a service type, or updates it when `id` is given. Names must be unique. */
export async function saveServiceType(input: ServiceTypeInput, id?: string): Promise<ServiceType> {
  await mockRequest()
  if (input.everyKm == null && input.everyMonths == null) {
    throw new ApiError('Give a distance, a time, or both — otherwise the service is never due.', 422)
  }
  if (data.serviceTypes.some((s) => s.id !== id && sameName(s.name, input.name))) {
    throw new ApiError(`A service type called “${input.name.trim()}” already exists.`, 409)
  }
  if (id) {
    const existing = data.serviceTypes.find((s) => s.id === id)
    if (!existing) throw new ApiError('That service type no longer exists.', 404)
    Object.assign(existing, input, { name: input.name.trim() })
    return { ...existing }
  }
  const created: ServiceType = { ...input, name: input.name.trim(), id: `SVC-${nextId++}`, active: true }
  data.serviceTypes.push(created)
  return created
}

export async function setServiceTypeActive(id: string, active: boolean): Promise<ServiceType> {
  await mockRequest()
  const existing = data.serviceTypes.find((s) => s.id === id)
  if (!existing) throw new ApiError('That service type no longer exists.', 404)
  existing.active = active
  return { ...existing }
}

export async function saveLookupItem(list: LookupListId, input: LookupItemInput, id?: string): Promise<LookupItem> {
  await mockRequest()
  const items = data.lists[list]
  if (items.some((item) => item.id !== id && sameName(item.name, input.name))) {
    throw new ApiError(`“${input.name.trim()}” is already in this list.`, 409)
  }
  if (id) {
    const existing = items.find((item) => item.id === id)
    if (!existing) throw new ApiError('That item no longer exists.', 404)
    Object.assign(existing, { name: input.name.trim(), detail: input.detail.trim() })
    return { ...existing }
  }
  const created: LookupItem = { id: `${list}-${nextId++}`, name: input.name.trim(), detail: input.detail.trim(), active: true }
  items.push(created)
  return created
}

export async function setLookupItemActive(list: LookupListId, id: string, active: boolean): Promise<LookupItem> {
  await mockRequest()
  const existing = data.lists[list].find((item) => item.id === id)
  if (!existing) throw new ApiError('That item no longer exists.', 404)
  existing.active = active
  return { ...existing }
}
