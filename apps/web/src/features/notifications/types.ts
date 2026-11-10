export type NotificationKind = 'new-order' | 'payment' | 'vehicle-issue' | 'trip-update' | 'mail'

export type AppNotification = {
  id: string
  kind: NotificationKind
  title: string
  message: string
  timeLabel: string
  group: 'today' | 'earlier'
  unread: boolean
  /** Where clicking the notification takes the coordinator. */
  to: string
}
