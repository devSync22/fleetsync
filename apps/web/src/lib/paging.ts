/** One page of a list, as the list endpoints return it. */
export type Paged<T> = { items: T[]; total: number; page: number; pageCount: number; pageSize: number }

/** Admin lists show 8 rows per page ("Rows per page: 8" in the frames). */
export const PAGE_SIZE = 8

/**
 * Cuts one page out of a full list, clamping the page into range.
 * Used by mock services; the real endpoints page on the server.
 */
export function paginate<T>(rows: T[], page: number, pageSize = PAGE_SIZE): Paged<T> {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const current = Math.min(Math.max(1, page), pageCount)
  return { items: rows.slice((current - 1) * pageSize, current * pageSize), total: rows.length, page: current, pageCount, pageSize }
}

/** Case-insensitive "contains" used by the mock search boxes. */
export function textMatches(text: string, search: string) {
  return text.toLowerCase().includes(search.trim().toLowerCase())
}
