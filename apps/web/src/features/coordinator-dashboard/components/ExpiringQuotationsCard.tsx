import { Clock } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatLKR } from '@/lib/utils'
import { formatMinutes, plural } from '../format'
import type { ExpiringQuotation } from '../types'
import { DashboardCard } from './DashboardCard'
import { ListCell } from './ListCell'

/** Under an hour left turns the badge from pending to danger. */
const URGENT_MINUTES = 60

export function ExpiringQuotationsCard({ quotations }: { quotations: ExpiringQuotation[] }) {
  return (
    <DashboardCard
      title="Quotations expiring soon"
      subtitle="The customer has not answered · shown 2 hours before the quotation expires"
      link={{ label: 'All quoted orders', to: '/coordinator/orders?status=quoted' }}
    >
      {quotations.length === 0 ? (
        <EmptyState
          bare
          icon={Clock}
          title="No quotations expiring soon"
          description="Quotations the customer hasn't answered show here 2 hours before they expire."
        />
      ) : (
        <ul>
          {quotations.map((q) => (
            <li
              key={q.orderId}
              className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b px-5 py-3 last:border-b-0"
            >
              <ListCell mono className="w-[130px]" primary={q.orderId} secondary={q.sentLabel} />
              <ListCell className="w-[200px]" primary={q.customerName} secondary={q.route} />
              <ListCell
                mono
                className="w-[150px]"
                primary={formatLKR(q.amount)}
                secondary={q.timesOpened === 0 ? 'Not opened yet' : `Opened ${plural(q.timesOpened, 'time')}`}
              />
              <div className="shrink-0 xl:w-[190px]">
                <StatusBadge tone={q.expiresInMinutes < URGENT_MINUTES ? 'danger' : 'pending'}>
                  Expires in {formatMinutes(q.expiresInMinutes)}
                </StatusBadge>
              </div>
              <div className="ml-auto flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/coordinator/chat?order=${q.orderId}`}>Open chat</Link>
                </Button>
                {/* TODO: call the resend-quotation endpoint once it exists */}
                <Button type="button" variant="outline" size="sm">
                  Resend
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  )
}
