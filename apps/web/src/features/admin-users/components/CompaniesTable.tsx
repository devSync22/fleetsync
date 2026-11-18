import { Building2, FileText } from 'lucide-react'
import { Link } from 'react-router'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { RowActionsMenu } from '@/components/shared/RowActionsMenu'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { tableStyles as t } from '@/components/shared/tableStyles'
import { Button } from '@/components/ui/button'
import { formatLKR, initialsOf } from '@/lib/utils'
import type { CustomerCompany } from '../types'

type CompaniesTableProps = {
  companies: CustomerCompany[]
  onView: (company: CustomerCompany) => void
  onReactivate: (company: CustomerCompany) => void
  reactivatingId: string | null
}

/**
 * "Customer companies" tab table (69:1216). The main button depends on the company:
 * a pending applicant links to its application review, a suspended company can be reactivated,
 * everyone else opens the company details.
 */
export function CompaniesTable({ companies, onView, onReactivate, reactivatingId }: CompaniesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={t.table}>
        <thead className={t.headRow}>
          <tr>
            <th scope="col" className={t.th}>Company</th>
            <th scope="col" className={t.th}>Primary contact</th>
            <th scope="col" className={t.th}>Orders</th>
            <th scope="col" className={t.th}>Outstanding</th>
            <th scope="col" className={t.th}>Status</th>
            <th scope="col" className={`${t.th} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.companyId} className={t.row}>
              <td className={t.td}>
                <div className="flex items-center gap-3">
                  <InitialsAvatar initials={initialsOf(company.name)} />
                  <div className="flex flex-col whitespace-nowrap">
                    <span className="text-[13px] font-medium">{company.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{company.brNumber}</span>
                  </div>
                </div>
              </td>
              <td className={t.td}>
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-[13px]">{company.contactName}</span>
                  <span className="text-xs text-muted-foreground">{company.contactEmail}</span>
                </div>
              </td>
              <td className={t.td}>
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-[13px]">{company.ordersThisMonth} this month</span>
                  <span className="text-xs text-muted-foreground">{company.ordersNote}</span>
                </div>
              </td>
              <td className={t.td}>
                {company.outstanding == null ? (
                  <span className="text-muted-foreground">–</span>
                ) : (
                  <div className="flex flex-col items-start gap-1 whitespace-nowrap">
                    <span className={company.outstanding > 0 ? 'font-mono font-medium' : 'font-mono text-muted-foreground'}>
                      {formatLKR(company.outstanding)}
                    </span>
                    {company.balanceFlag && <StatusBadge tone={company.balanceFlag.tone}>{company.balanceFlag.label}</StatusBadge>}
                  </div>
                )}
              </td>
              <td className={t.td}>
                <StatusBadge status={company.status} />
              </td>
              <td className={t.td}>
                <div className="flex items-center justify-end gap-2">
                  {company.applicationId ? (
                    <Button asChild size="sm">
                      <Link to={`/admin/applications/${company.applicationId}`}>Review application</Link>
                    </Button>
                  ) : company.status === 'suspended' ? (
                    <Button type="button" size="sm" disabled={reactivatingId === company.companyId} onClick={() => onReactivate(company)}>
                      {reactivatingId === company.companyId ? 'Reactivating…' : 'Reactivate'}
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" size="sm" onClick={() => onView(company)}>
                      View company
                    </Button>
                  )}
                  <RowActionsMenu
                    label={`More actions for ${company.name}`}
                    title={company.name}
                    subtitle={company.brNumber}
                    actions={[
                      { label: 'View company', description: 'Contact, billing and orders', icon: Building2, onSelect: () => onView(company) },
                      {
                        label: 'Copy billing address',
                        description: company.billingAddress,
                        icon: FileText,
                        onSelect: () => void navigator.clipboard?.writeText(company.billingAddress),
                      },
                    ]}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
