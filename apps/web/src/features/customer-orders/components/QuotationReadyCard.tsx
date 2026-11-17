import { Link } from 'react-router'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatLKR } from '@/lib/utils'

/** Takes the Payment card's place while a quotation waits for the customer's reply. */
export function QuotationReadyCard({ orderId, amount }: { orderId: string; amount: number | null }) {
  return (
    <SectionCard title="Your quotation is ready" action={<StatusBadge status="quoted" />}>
      <div className="flex flex-col gap-3 px-5 py-[18px]">
        <p className="text-[13px] leading-5 text-muted-foreground">
          A coordinator quoted{' '}
          {amount === null ? 'a fare' : <span className="font-mono font-medium text-foreground">{formatLKR(amount)}</span>} for
          this order. Review it to accept and pay, or decline.
        </p>
        <Button asChild size="sm" className="w-full">
          <Link to={`/customer/quotations/${orderId}`}>Review quote</Link>
        </Button>
      </div>
    </SectionCard>
  )
}
