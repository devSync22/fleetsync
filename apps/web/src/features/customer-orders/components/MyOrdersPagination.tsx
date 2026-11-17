import { Button } from '@/components/ui/button'

type MyOrdersPaginationProps = {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

/** "Page 1 of 2" with Previous / Next under the My orders table. */
export function MyOrdersPagination({ page, pageCount, onChange }: MyOrdersPaginationProps) {
  return (
    <nav aria-label="Pages" className="flex items-center gap-2 border-t px-5 py-3">
      <p className="flex-1 text-xs text-muted-foreground">
        Page {page} of {pageCount}
      </p>
      <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <Button type="button" variant="outline" size="sm" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </nav>
  )
}
