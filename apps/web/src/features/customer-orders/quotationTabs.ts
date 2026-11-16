import { CircleCheck, Clock, FileText, Hourglass, XCircle, type LucideIcon } from 'lucide-react'
import type { DomainStatus } from '@/components/shared/statusTones'
import type { QuotationListRow, QuotationListTab, QuotationStatus } from './types'

type QuotationTabConfig = {
  id: QuotationListTab
  label: string
  /** The (effective) quotation statuses this tab lists. */
  statuses: QuotationStatus[] | 'any'
  empty: { icon: LucideIcon; title: string; description: string }
}

export const quotationTabs: QuotationTabConfig[] = [
  {
    id: 'awaiting',
    label: 'Awaiting answer',
    statuses: ['awaiting'],
    empty: {
      icon: Clock,
      title: 'No quotations waiting for your answer',
      description: 'When a coordinator prices one of your orders, the quotation appears here.',
    },
  },
  {
    id: 'accepted',
    label: 'Accepted',
    statuses: ['accepted'],
    empty: { icon: CircleCheck, title: 'No accepted quotations', description: 'Quotations you accept appear here.' },
  },
  {
    id: 'declined',
    label: 'Declined',
    statuses: ['declined'],
    empty: { icon: XCircle, title: 'No declined quotations', description: 'Quotations you decline appear here.' },
  },
  {
    id: 'expired',
    label: 'Expired',
    statuses: ['expired'],
    empty: {
      icon: Hourglass,
      title: 'No expired quotations',
      description: 'Quotations that weren’t answered before they expired appear here.',
    },
  },
  {
    id: 'all',
    label: 'All',
    statuses: 'any',
    empty: { icon: FileText, title: 'No quotations yet', description: 'Fare quotations for your orders appear here.' },
  },
]

export const DEFAULT_QUOTATION_TAB: QuotationListTab = 'awaiting'

export function parseQuotationTab(value: string | null): QuotationListTab {
  return quotationTabs.find((tab) => tab.id === value)?.id ?? DEFAULT_QUOTATION_TAB
}

/** Badge for a row: accepted quotations show "Paid" once the order is paid. */
export function quotationRowBadge(row: Pick<QuotationListRow, 'status' | 'paid'>): DomainStatus {
  switch (row.status) {
    case 'awaiting':
      return 'quoted'
    case 'accepted':
      return row.paid ? 'paid' : 'accepted'
    case 'declined':
      return 'quote-declined'
    case 'expired':
      return 'quotation-expired'
  }
}
