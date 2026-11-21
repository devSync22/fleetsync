import type { DomainStatus } from '@/components/shared/statusTones'
import type { QuotationResponse } from './types'

/** The badge shown for how the customer answered a quotation. */
export function responseStatus(response: QuotationResponse): DomainStatus {
  switch (response.status) {
    case 'awaiting':
      return 'quoted'
    case 'accepted':
      return response.paid ? 'paid' : 'payment-failed'
    case 'declined':
      return 'declined'
    case 'expired':
      return 'quotation-expired'
  }
}
