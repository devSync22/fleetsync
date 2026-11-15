import type { DomainStatus } from '@/components/shared/statusTones'
import type { CustomerQuotation, QuotationStatus } from './types'

/**
 * The status to show: an "awaiting" quotation whose validUntil has passed is expired,
 * even if the server has not marked it yet.
 */
export function effectiveStatus(quotation: Pick<CustomerQuotation, 'status' | 'validUntil'>, now: Date): QuotationStatus {
  if (quotation.status === 'awaiting' && new Date(quotation.validUntil) <= now) return 'expired'
  return quotation.status
}

/** Badge next to the page title. */
export const quotationBadge: Record<QuotationStatus, DomainStatus> = {
  awaiting: 'quoted',
  accepted: 'accepted',
  declined: 'quote-declined',
  expired: 'quotation-expired',
}

export const DECLINE_REASON_MAX = 500
