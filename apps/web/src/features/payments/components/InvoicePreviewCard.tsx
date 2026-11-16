import { FileText, Loader2 } from 'lucide-react'
import logoIcon from '@/assets/logo-icon.svg'
import { Banner } from '@/components/shared/Banner'
import { EmptyState } from '@/components/shared/EmptyState'
import { KeyValueRow } from '@/components/shared/KeyValueRow'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatLKR } from '@/lib/utils'
import type { ApiError } from '@/services/apiClient'
import type { InvoicePreview } from '../types'

const amount = new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 })

/*
 * "Download invoice (PDF)" prints the page; this print CSS hides everything except the invoice,
 * so the browser's "Save as PDF" gives just the invoice.
 */
const printCss = `
@media print {
  body * { visibility: hidden !important; }
  #invoice-print, #invoice-print * { visibility: visible !important; }
  #invoice-print { position: absolute; inset: 0 auto auto 0; width: 100%; border: 0; }
}`

type InvoicePreviewCardProps = {
  /** null while loading. */
  invoice: InvoicePreview | null
  loading: boolean
  error: ApiError | null
  onRetry: () => void
  onDownload: () => void
  downloading: boolean
  downloadError: ApiError | null
}

/** "Invoice preview": the selected payment's tax invoice and "Download invoice (PDF)". */
export function InvoicePreviewCard({ invoice, loading, error, onRetry, onDownload, downloading, downloadError }: InvoicePreviewCardProps) {
  return (
    <section id="invoice-print" className="flex flex-col overflow-hidden rounded-xl border bg-card" aria-busy={loading || undefined}>
      <style>{printCss}</style>
      <header className="flex items-center gap-2.5 border-b px-5 py-3.5">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="text-[15px] font-semibold">Invoice preview</h2>
          {invoice && <p className="text-xs text-muted-foreground">Selected: {invoice.orderId}</p>}
        </div>
        {invoice && <StatusBadge status={invoice.status} />}
      </header>

      {loading && (
        <div className="flex flex-col gap-3.5 p-5" aria-label="Loading invoice">
          <Skeleton className="h-8 w-32 rounded-full" />
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-3.5 w-full rounded-full" />
          ))}
          <Skeleton className="h-[42px] w-full rounded-lg" />
        </div>
      )}

      {!loading && error && (
        <div className="p-5">
          <Banner
            tone="danger"
            title="Couldn’t load the invoice"
            message={error.message}
            action={
              <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
            }
          />
        </div>
      )}

      {!loading && !error && !invoice && (
        <EmptyState bare icon={FileText} title="No invoice selected" description="Choose a paid payment to see its invoice." />
      )}

      {!loading && !error && invoice && (
        <div className="flex flex-col gap-3.5 p-5">
          <div className="flex items-center gap-2.5">
            <img src={logoIcon} alt="" className="size-8" />
            <div className="flex flex-col gap-px">
              <p className="text-[13px] font-semibold">FleetSync</p>
              <p className="text-xs text-muted-foreground">Tax invoice</p>
            </div>
          </div>
          <hr className="border-border" />
          <dl className="flex flex-col gap-3.5">
            <KeyValueRow label="Invoice no." mono>
              {invoice.invoiceNumber}
            </KeyValueRow>
            <KeyValueRow label="Issued">{invoice.issuedLabel}</KeyValueRow>
            <KeyValueRow label="Billed to">{invoice.billedTo}</KeyValueRow>
            <KeyValueRow label="Order">
              {invoice.orderId} · {invoice.tripLabel}
            </KeyValueRow>
          </dl>
          <hr className="border-border" />
          <ul className="flex flex-col gap-3.5">
            {invoice.lines.map((line) => (
              <li key={line.label} className="flex items-start gap-3 text-[13px]">
                <span className="min-w-0 flex-1">{line.label}</span>
                <span className="font-mono whitespace-nowrap">{amount.format(line.amount)}</span>
              </li>
            ))}
          </ul>
          <hr className="border-border" />
          <div className="flex items-center">
            <p className="flex-1 text-sm font-semibold">Total paid</p>
            <p className="font-mono text-base font-medium whitespace-nowrap">{formatLKR(invoice.total)}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Card ending {invoice.cardLast4} · ref {invoice.reference}
          </p>
          {downloadError && <Banner tone="danger" title="Couldn’t download the invoice" message={downloadError.message} />}
          <Button type="button" className="w-full print:hidden" onClick={onDownload} disabled={downloading}>
            {downloading ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Preparing invoice…
              </>
            ) : (
              'Download invoice (PDF)'
            )}
          </Button>
        </div>
      )}
    </section>
  )
}
