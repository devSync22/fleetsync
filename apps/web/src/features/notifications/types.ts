export type NotificationRole = 'coordinator' | 'customer' | 'admin' | 'owner'

export type NotificationKind =
  | 'new-order'
  | 'payment'
  | 'vehicle-issue'
  | 'trip-update'
  | 'mail'
  | 'quotation'
  | 'trip-started'
  | 'message'
  | 'payment-received'
  | 'account-application'
  | 'profile-change'
  | 'licence-expiring'
  | 'document-uploaded'
  | 'security'
  | 'service-overdue'
  | 'payment-overdue'
  | 'trip-cancelled'
  | 'utilisation'

export type AppNotification = {
  id: string
  kind: NotificationKind
  title: string
  message: string
  timeLabel: string
  group: 'today' | 'earlier'
  unread: boolean
  /** Where clicking the notification takes the user. */
  to: string
}
