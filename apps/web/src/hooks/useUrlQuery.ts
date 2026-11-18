import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router'

/**
 * List state (tab, search, filters, page) kept in the URL query string, so refresh and Back keep the view.
 * Values equal to their default are left out of the URL. Changing anything except `page` goes back to page 1.
 *
 *   const [query, setQuery] = useUrlQuery({ search: '', role: 'all', page: '1' })
 *   setQuery('role', 'driver')
 *   setQuery('search', text, { replace: true })   // typing doesn't fill the history
 *   setQuery('event', id, { keepPage: true })     // selecting a row stays on the same page
 */
export function useUrlQuery<K extends string>(defaults: Record<K, string>) {
  const [searchParams, setSearchParams] = useSearchParams()
  // Callers pass an object literal; keep the first one so `setQuery` stays stable across renders.
  const [initial] = useState(defaults)

  const query = Object.fromEntries(
    (Object.keys(initial) as K[]).map((key) => [key, searchParams.get(key) ?? initial[key]]),
  ) as Record<K, string>

  const setQuery = useCallback(
    (key: K, value: string, options: { replace?: boolean; keepPage?: boolean } = {}) => {
      setSearchParams(
        (params) => {
          const next = new URLSearchParams(params)
          if (value === initial[key]) next.delete(key)
          else next.set(key, value)
          if (key !== 'page' && !options.keepPage) next.delete('page')
          return next
        },
        { replace: options.replace },
      )
    },
    [setSearchParams, initial],
  )

  return [query, setQuery] as const
}

/** Reads a 1-based page number from a query value, falling back to 1. */
export function parsePage(value: string) {
  return Math.max(1, Number.parseInt(value, 10) || 1)
}
