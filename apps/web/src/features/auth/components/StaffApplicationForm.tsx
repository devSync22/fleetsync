import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { SelectField } from '@/components/shared/SelectField'
import { TextField } from '@/components/shared/TextField'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { ApiError } from '@/services/apiClient'
import type { LicenceClass, StaffApplicationFormInfo, StaffApplicationRequest, StaffRole } from '../types'
import { licenceClassLabels, staffRoleLabels } from '../utils/staffRoles'
import { authLinkClass, AuthFormHeader, AuthSectionLabel } from './AuthFormHeader'
import { CheckboxField } from './CheckboxField'
import { FileUpload } from './FileUpload'

type StaffApplicationFormProps = {
  /** Called with the validated application; the parent page sends it to the API. */
  onSubmit: (values: StaffApplicationRequest) => void | Promise<void>
  /** Disables the submit button and shows "Submitting…" while a request is in flight. */
  isSubmitting?: boolean
  /** Admin-generated form details; when present, shown in the info banner at the top. */
  applicationForm?: StaffApplicationFormInfo
  /** The last failed submit: field errors go under their inputs, anything else in a banner. */
  error?: ApiError
}

/** Options for the "Role you're applying for" dropdown, in the order of staffRoleLabels. */
const roleOptions = (Object.keys(staffRoleLabels) as StaffRole[]).map((value) => ({
  value,
  label: staffRoleLabels[value],
}))

const licenceClassOptions = (Object.keys(licenceClassLabels) as LicenceClass[]).map((value) => ({
  value,
  label: licenceClassLabels[value],
}))

/** Document rules from the design: PDF or JPG, up to 5 MB each. */
const DOCUMENT_TYPES = ['.pdf', '.jpg', '.jpeg']
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024

/**
 * Sri Lankan NIC: old format (9 digits + V or X) or new format (12 digits).
 * Used as the input's `pattern`, so the browser blocks invalid numbers.
 */
const NIC_PATTERN = '[0-9]{9}[VvXx]|[0-9]{12}'

/** Text fields of the form; keys match each input's `name` attribute. */
type TextValues = Pick<StaffApplicationRequest, 'fullName' | 'nic' | 'email' | 'mobile'> & { licenceNumber: string }

const initialValues: TextValues = { fullName: '', nic: '', email: '', mobile: '', licenceNumber: '' }

/**
 * Presentational staff account application (Figma "Auth — Staff account application", node 118:3655).
 * Text fields, role and NIC format use native browser validation; documents and the
 * confirmation checkbox are checked here before `onSubmit`.
 *
 * Licence number and class appear only for drivers. They are not in the Figma
 * frame, but the API requires them for driver applications (as the mobile form
 * collects them) — raised as a design issue.
 */
export function StaffApplicationForm({
  onSubmit,
  isSubmitting = false,
  applicationForm,
  error,
}: StaffApplicationFormProps) {
  const [values, setValues] = useState(initialValues)
  // Empty string = nothing chosen yet; `required` on the select blocks submission.
  const [role, setRole] = useState<StaffRole | ''>('')
  const [licenceClass, setLicenceClass] = useState<LicenceClass | ''>('')
  const [documents, setDocuments] = useState<File[]>([])
  const [confirmed, setConfirmed] = useState(false)
  // Shown only after a submit attempt.
  const [documentsError, setDocumentsError] = useState<string>()
  const [confirmError, setConfirmError] = useState(false)

  // One change handler for all text inputs: each input's `name` is a key of `values`.
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function handleDocumentsChange(files: File[]) {
    setDocuments(files)
    // Clear the "add a document" error as soon as something is added.
    if (files.length > 0) setDocumentsError(undefined)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const missingDocuments = documents.length === 0
    setDocumentsError(
      missingDocuments ? 'Add your NIC copy (and driving licence if you’re applying as a driver).' : undefined,
    )
    setConfirmError(!confirmed)
    // The select is `required`, so the browser guarantees a role here; this narrows the type.
    if (missingDocuments || !confirmed || !role) return

    const isDriver = role === 'driver'
    void onSubmit({
      applicationFormCode: applicationForm?.code,
      fullName: values.fullName.trim(),
      // NIC letters are stored upper-case (e.g. "…V") so the same NIC always matches.
      nic: values.nic.trim().toUpperCase(),
      email: values.email.trim(),
      mobile: values.mobile.trim(),
      role,
      licenceNumber: isDriver ? values.licenceNumber.trim().toUpperCase() : undefined,
      licenceClass: isDriver && licenceClass ? licenceClass : undefined,
      documents,
    })
  }

  /** Props that put a field into its error state when the API rejected it. */
  const serverErrorProps = (name: string) => {
    const message = error?.fieldError(name)
    return { invalid: Boolean(message), helperText: message }
  }

  return (
    <form className="flex w-full max-w-[480px] flex-col gap-4" onSubmit={handleSubmit}>
      <AuthFormHeader
        title="Apply for a staff account"
        subtitle="For drivers, mechanics and office staff. A Fleet Administrator reviews every application before an account is created."
      />

      {/* Tells the applicant which admin-generated form they are filling in and until when. */}
      {applicationForm && (
        <Banner
          tone="info"
          title={`Application form ${applicationForm.code}`}
          message={`This form was generated for you by the Fleet Administrator. It expires on ${formatDate(applicationForm.expiresOn)}.`}
        />
      )}

      {/* Errors that don't belong to one field (e.g. "Application already submitted"). */}
      {error && error.errorCode !== 'validation_failed' && <Banner title={error.title} message={error.detail} />}

      <AuthSectionLabel>Your details</AuthSectionLabel>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
        <TextField
          label="Full name"
          name="fullName"
          autoComplete="name"
          placeholder="First and last name"
          required
          value={values.fullName}
          onChange={handleChange}
          {...serverErrorProps('fullName')}
        />
        <TextField
          label="NIC number"
          name="nic"
          placeholder="200012345678"
          required
          monospace
          pattern={NIC_PATTERN}
          // Shown by the browser when the pattern doesn't match.
          title="Enter 12 digits, or 9 digits followed by V or X"
          value={values.nic}
          onChange={handleChange}
          {...serverErrorProps('nic')}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          required
          value={values.email}
          onChange={handleChange}
          {...serverErrorProps('email')}
        />
        <TextField
          label="Mobile"
          name="mobile"
          type="tel"
          autoComplete="tel"
          placeholder="07X XXX XXXX"
          required
          monospace
          value={values.mobile}
          onChange={handleChange}
          {...serverErrorProps('mobile')}
        />
      </div>

      <SelectField
        label="Role you’re applying for"
        name="role"
        required
        placeholder="Select a role"
        options={roleOptions}
        value={role}
        onChange={(event) => setRole(event.target.value as StaffRole)}
        error={error?.fieldError('role')}
      />

      {role === 'driver' && (
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
          <TextField
            label="Driving licence no."
            name="licenceNumber"
            placeholder="B1234567"
            required
            monospace
            value={values.licenceNumber}
            onChange={handleChange}
            {...serverErrorProps('licenceNumber')}
          />
          <SelectField
            label="Licence class"
            name="licenceClass"
            required
            placeholder="Select a class"
            options={licenceClassOptions}
            value={licenceClass}
            onChange={(event) => setLicenceClass(event.target.value as LicenceClass)}
            error={error?.fieldError('licenceClass')}
          />
        </div>
      )}

      {/* Supporting documents the administrator checks before approving the application. */}
      <AuthSectionLabel>Documents</AuthSectionLabel>

      <FileUpload
        label="Upload documents"
        files={documents}
        onChange={handleDocumentsChange}
        accept={DOCUMENT_TYPES}
        maxFileSize={MAX_DOCUMENT_SIZE}
        hint="NIC copy and driving licence · PDF or JPG · up to 5 MB each"
        error={documentsError ?? error?.fieldError('documents')}
      />

      <CheckboxField
        name="confirmDetails"
        size="md"
        checked={confirmed}
        onCheckedChange={(checked) => {
          setConfirmed(checked)
          if (checked) setConfirmError(false)
        }}
        error={confirmError ? 'Confirm that your details are correct' : undefined}
        label="The details I’ve given are correct"
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting…' : 'Submit application'}
      </Button>

      <p className="text-[13px] text-muted-foreground">
        Already have an account?{' '}
        <Link to="/auth/login" className={authLinkClass}>
          Sign in
        </Link>
      </p>
    </form>
  )
}
