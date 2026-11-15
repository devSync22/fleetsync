import { Button } from '@/components/ui/button'

type DownloadInvoiceButtonProps = { size?: 'default' | 'sm'; className?: string }

/** Shown only for paid orders. */
export function DownloadInvoiceButton({ size = 'default', className }: DownloadInvoiceButtonProps) {
  // TODO(payments step): download the invoice PDF once the payments module provides it.
  return (
    <Button type="button" variant="outline" size={size} className={className}>
      Download invoice
    </Button>
  )
}
