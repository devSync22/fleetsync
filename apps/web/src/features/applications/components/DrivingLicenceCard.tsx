import { CircleCheck, CircleX } from 'lucide-react'
import { SectionCard } from '@/components/shared/SectionCard'
import { SelectField } from '@/components/shared/SelectField'
import { TextField } from '@/components/shared/TextField'
import { cn } from '@/lib/utils'
import type { ApplicationDetail, LicenceDetails } from '../types'
import { expiryProblem } from '../licenceRules'
import { DetailField } from './DetailField'
import { LicencePhotoCard } from './LicencePhotoCard'

type DrivingLicenceCardProps = {
  application: ApplicationDetail
  licence: LicenceDetails
  onChange: (licence: LicenceDetails) => void
  licenceClasses: string[]
  /** Shown after an approve attempt with missing details. */
  showErrors: boolean
  readOnly: boolean
}

/**
 * "Driving licence" (driver applicants): requested role, the uploaded photos, and the licence details the
 * administrator enters after checking them. Required before approving.
 */
export function DrivingLicenceCard({ application, licence, onChange, licenceClasses, showErrors, readOnly }: DrivingLicenceCardProps) {
  const problem = expiryProblem(licence.licenceExpiry)
  const numberMissing = !licence.licenceNumber.trim()

  return (
    <SectionCard title="Driving licence" subtitle="Check the licence photos, then enter the details. Required before you approve.">
      <div className="flex flex-col gap-5 px-5 py-4">
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <DetailField label="Requested role">Driver</DetailField>
          <DetailField label="Depot">Assigned when approved</DetailField>
        </dl>

        <div className="flex flex-col gap-3 border-t pt-4">
          <h3 className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            Licence photos · uploaded by the applicant
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {application.licencePhotos.map((photo) => (
              <LicencePhotoCard key={photo.side} photo={photo} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t pt-4">
          <h3 className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            Licence details · entered by you
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Licence type"
              options={licenceClasses.map((c) => ({ value: c, label: c }))}
              value={licence.licenceClass}
              onChange={(e) => onChange({ ...licence, licenceClass: e.target.value })}
              disabled={readOnly}
            />
            <TextField
              label="Licence number"
              monospace
              value={licence.licenceNumber}
              onChange={(e) => onChange({ ...licence, licenceNumber: e.target.value })}
              placeholder="B3344556"
              invalid={showErrors && numberMissing}
              helperText={showErrors && numberMissing ? 'Enter the licence number' : undefined}
              readOnly={readOnly}
            />
            <div className="flex flex-col gap-1.5">
              <TextField
                label="Licence expiry"
                type="date"
                monospace
                value={licence.licenceExpiry}
                onChange={(e) => onChange({ ...licence, licenceExpiry: e.target.value })}
                invalid={showErrors && !!problem}
                readOnly={readOnly}
                // A valid date gets the green "success" border from the frame.
                className={cn(!problem && '[&_input]:border-success')}
              />
              {licence.licenceExpiry && !problem ? (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CircleCheck className="size-3.5 text-success" aria-hidden />
                  Valid for more than 6 months
                </p>
              ) : (
                (showErrors || licence.licenceExpiry) &&
                problem && (
                  <p className="flex items-center gap-1.5 text-xs text-danger">
                    <CircleX className="size-3.5" aria-hidden />
                    {problem}
                  </p>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
