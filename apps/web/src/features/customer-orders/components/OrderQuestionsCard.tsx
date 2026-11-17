import { Link } from 'react-router'
import { SectionCard } from '@/components/shared/SectionCard'
import { Button } from '@/components/ui/button'

/** "Questions about this order?" — links to the order's chat room in the chat module. */
export function OrderQuestionsCard({ orderId, hasTrip }: { orderId: string; hasTrip: boolean }) {
  return (
    <SectionCard title="Questions about this order?">
      <div className="flex flex-col gap-3 px-5 py-[18px]">
        <p className="text-[13px] leading-5 text-muted-foreground">
          {hasTrip
            ? 'Chat with the coordinator, driver or mechanic in this order’s chat room.'
            : 'Chat with the coordinator in this order’s chat room.'}
        </p>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to={`/customer/chat?order=${orderId}`}>Open chat</Link>
        </Button>
      </div>
    </SectionCard>
  )
}
