import { Link } from 'react-router'
import { SectionCard } from '@/components/shared/SectionCard'
import { Button } from '@/components/ui/button'

type OrderQuestionsCardProps = {
  orderId: string
  hasTrip: boolean
  /** Overrides for other screens, e.g. Fare quotation's "Not sure about the price?". */
  title?: string
  description?: string
}

/** "Questions about this order?" — links to the order's chat room in the chat module. */
export function OrderQuestionsCard({ orderId, hasTrip, title = 'Questions about this order?', description }: OrderQuestionsCardProps) {
  const text =
    description ??
    (hasTrip
      ? 'Chat with the coordinator, driver or mechanic in this order’s chat room.'
      : 'Chat with the coordinator in this order’s chat room.')
  return (
    <SectionCard title={title}>
      <div className="flex flex-col gap-3 px-5 py-[18px]">
        <p className="text-[13px] leading-5 text-muted-foreground">{text}</p>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to={`/customer/chat?order=${orderId}`}>Open chat</Link>
        </Button>
      </div>
    </SectionCard>
  )
}
