import { SectionCard } from '@/components/shared/SectionCard'
import type { ApplicationDetail } from '../types'
import { DetailField } from './DetailField'

/** "Applicant details": what the applicant typed into the generated application form. */
export function ApplicantDetailsCard({ application: a }: { application: ApplicationDetail }) {
  return (
    <SectionCard title="Applicant details" subtitle="From the generated application form">
      <dl className="grid gap-x-6 gap-y-4 px-5 py-4 sm:grid-cols-2">
        <DetailField label={a.company ? 'Company name' : 'Full name'}>{a.fullName}</DetailField>
        {a.company ? (
          <DetailField label="Business registration no." mono>
            {a.company.brNumber}
          </DetailField>
        ) : (
          <DetailField label="NIC number" mono>
            {a.nic}
          </DetailField>
        )}
        {a.company && <DetailField label="Primary contact">{a.company.contactName}</DetailField>}
        <DetailField label="Email">{a.email}</DetailField>
        <DetailField label="Mobile" mono>
          {a.mobile}
        </DetailField>
        <DetailField label={a.company ? 'Billing address' : 'Address'}>{a.address}</DetailField>
        <DetailField label="Date applied">{a.submittedAt}</DetailField>
      </dl>
    </SectionCard>
  )
}
