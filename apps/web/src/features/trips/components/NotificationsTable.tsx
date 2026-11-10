import type { ReactNode } from 'react'
import { InfoNote } from '@/components/shared/InfoNote'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import type { SentNotification } from '../types'

type NotificationsTableProps = {
  title: string
  subtitle: string
  notifications: SentNotification[]
  footnote: ReactNode
}

const headCell = 'px-4 py-2.5 text-xs font-medium text-muted-foreground'

/** Who was told about the trip, where, when, and whether they opened it. */
export function NotificationsTable({ title, subtitle, notifications, footnote }: NotificationsTableProps) {
  return (
    <SectionCard title={title} subtitle={subtitle}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b bg-background">
            <tr>
              <th scope="col" className={`${headCell} pl-5`}>Recipient</th>
              <th scope="col" className={headCell}>Sent to</th>
              <th scope="col" className={headCell}>Sent</th>
              <th scope="col" className={headCell}>Status</th>
              <th scope="col" className={`${headCell} pr-5`}><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n.name} className="border-b">
                <td className="py-3 pr-4 pl-5">
                  <div className="flex items-center gap-2.5">
                    <InitialsAvatar initials={n.initials} />
                    <div className="flex flex-col whitespace-nowrap">
                      <span className="text-sm font-medium">{n.name}</span>
                      <span className="text-xs text-muted-foreground">{n.role}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">{n.sentTo}</td>
                <td className="px-4 py-3 font-mono text-sm">{n.sentAt}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={n.status} />
                </td>
                <td className="py-3 pr-5 pl-4 text-right">
                  {n.status === 'not-opened' && (
                    // TODO: call the resend-notification endpoint once it exists
                    <Button type="button" variant="outline" size="sm">
                      Resend
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <InfoNote className="px-5 py-3">{footnote}</InfoNote>
    </SectionCard>
  )
}
