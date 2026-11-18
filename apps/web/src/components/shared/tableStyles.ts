/**
 * Class names for the admin-style tables (Admin frames): grey header row with small uppercase labels,
 * 20px padding at the row edges. Shared so every admin list lines up the same way.
 */
export const tableStyles = {
  table: 'w-full text-left text-[13px]',
  headRow: 'border-b bg-background',
  /** Header cell: 11px semibold uppercase, muted, letter-spaced. */
  th: 'px-3 py-2.5 text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-muted-foreground uppercase first:pl-5 last:pr-5',
  row: 'border-b transition-colors last:border-b-0 hover:bg-secondary/50',
  td: 'px-3 py-3 align-middle first:pl-5 last:pr-5',
} as const
