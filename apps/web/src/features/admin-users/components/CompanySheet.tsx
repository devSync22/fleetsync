import { SideSheet } from '@/components/shared/SideSheet'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatLKR, initialsOf } from '@/lib/utils'
import type { CustomerCompany } from '../types'
import { ProfileField } from './ProfileField'
import { ProfileSection } from './ProfileSection'

/**
 * Company details opened from "View company". There is no dedicated frame, so it reuses the
 * View profile sheet layout with the facts the Customer companies table already lists.
 */
export function CompanySheet({ company, onClose }: { company: CustomerCompany; onClose: () => void }) {
  return (
    <SideSheet
      open
      onClose={onClose}
      heading="Customer company"
      footer={
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <div aria-hidden className="flex size-16 shrink-0 items-center justify-center rounded-full bg-secondary text-xl font-semibold text-muted-foreground">
            {initialsOf(company.name)}
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <h2 className="text-xl leading-7 font-semibold">{company.name}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={company.status} />
              <span className="font-mono text-xs text-muted-foreground">{company.brNumber}</span>
            </div>
          </div>
        </div>

        <ProfileSection title="Primary contact">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            <ProfileField label="Name">{company.contactName}</ProfileField>
            <ProfileField label="Phone" mono>
              {company.phone}
            </ProfileField>
            <div className="col-span-2">
              <ProfileField label="Email">{company.contactEmail}</ProfileField>
            </div>
          </dl>
        </ProfileSection>

        <ProfileSection title="Billing">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="col-span-2">
              <ProfileField label="Billing address">{company.billingAddress}</ProfileField>
            </div>
            <ProfileField label="Outstanding" mono>
              {company.outstanding == null ? '–' : formatLKR(company.outstanding)}
            </ProfileField>
            <ProfileField label="Balance">
              {company.balanceFlag ? <StatusBadge tone={company.balanceFlag.tone}>{company.balanceFlag.label}</StatusBadge> : 'Settled'}
            </ProfileField>
          </dl>
        </ProfileSection>

        <ProfileSection title="Orders">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            <ProfileField label="This month">{company.ordersThisMonth} orders</ProfileField>
            <ProfileField label="Total">{company.ordersNote}</ProfileField>
          </dl>
        </ProfileSection>
      </div>
    </SideSheet>
  )
}
