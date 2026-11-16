import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

type DownloadInvoiceButtonProps = { invoiceId: string; size?: 'default' | 'sm'; className?: string }

/** Shown only for paid orders: opens the invoice on the Payments page, where it can be downloaded. */
export function DownloadInvoiceButton({ invoiceId, size = 'default', className }: DownloadInvoiceButtonProps) {
  return (
    <Button asChild variant="outline" size={size} className={className}>
      <Link to={`/customer/payments?invoice=${invoiceId}`}>Download invoice</Link>
    </Button>
  )
}
