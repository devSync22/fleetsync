import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type TablePaginationProps = {
  page: number
  pageCount: number
  pageSize: number
  onChange: (page: number) => void
}

/**
 * Page numbers to show: all of them when there are few, otherwise the first three,
 * an ellipsis and the last page (as in the Admin → User accounts frame: 1 2 3 … 11).
 * The current page is always included.
 */
function visiblePages(page: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, i) => i + 1)
  const pages = new Set([1, 2, 3, page, pageCount])
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b)
  const result: (number | 'gap')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('gap')
    result.push(p)
  })
  return result
}

const squareButton =
  'flex size-8 items-center justify-center rounded-md border border-line bg-card text-[13px] font-medium transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50'

/** Table footer: "Rows per page: 8" and numbered pages with previous / next arrows. */
export function TablePagination({ page, pageCount, pageSize, onChange }: TablePaginationProps) {
  return (
    <nav aria-label="Pages" className="flex items-center gap-2 border-t px-5 py-3">
      <p className="flex-1 text-[13px] text-muted-foreground">Rows per page: {pageSize}</p>
      <button
        type="button"
        className={squareButton}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      {visiblePages(page, pageCount).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className={cn(squareButton, 'pointer-events-none')} aria-hidden>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(squareButton, p === page && 'border-primary bg-primary text-primary-foreground hover:bg-primary')}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className={squareButton}
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  )
}
