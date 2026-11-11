import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { FileUpload } from '@/components/ui/FileUpload'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'
import type {
  StaffApplicationFormInfo,
  StaffApplicationRequest,
  StaffRole,
} from '../types/auth'
import styles from './AuthForm.module.css'

type StaffApplicationFormProps = {
  /** Called with the validated application; the parent page sends it to the API. */
  onSubmit: (values: StaffApplicationRequest) => void | Promise<void>
  /** Disables the submit button and shows "Submitting…" while a request is in flight. */
  isSubmitting?: boolean
  /** Admin-generated form details; when present, shown in the info banner at the top. */
  applicationForm?: StaffApplicationFormInfo
}

/** Roles shown in the "Role you're applying for" dropdown. */
const roleOptions: { value: StaffRole; label: string }[] = [
  { value: 'driver', label: 'Driver' },
  { value: 'mechanic', label: 'Mechanic' },
  { value: 'coordinator', label: 'Coordinator' },
]

/** Document rules from the design: PDF or JPG, up to 5 MB each. */
const DOCUMENT_TYPES = ['.pdf', '.jpg', '.jpeg']
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024

/**
 * Sri Lankan NIC: old format (9 digits + V or X) or new format (12 digits).
 * Used as the input's `pattern`, so the browser blocks invalid numbers.
 */
const NIC_PATTERN = '[0-9]{9}[VvXx]|[0-9]{12}'

/** Text fields of the form; keys match each input's `name` attribute. */
type TextValues = Pick<StaffApplicationRequest, 'fullName' | 'nic' | 'email' | 'mobile'>

const initialValues: TextValues = { fullName: '', nic: '', email: '', mobile: '' }

/** "2026-10-26" → "26 Oct 2026", the date style used across the designs. */
function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Presentational staff account application (Figma "Auth — Staff account application").
 * Text fields, role, NIC format and the confirmation checkbox use native browser
 * validation; the "at least one document" rule is checked here before `onSubmit`.
 */
export function StaffApplicationForm({
  onSubmit,
  isSubmitting = false,
  applicationForm,
}: StaffApplicationFormProps) {
  const [values, setValues] = useState(initialValues)
  // Empty string = nothing chosen yet; `required` on the select blocks submission.
  const [role, setRole] = useState<StaffRole | ''>('')
  const [documents, setDocuments] = useState<File[]>([])
  // Only shown after a submit attempt without any documents.
  const [documentsError, setDocumentsError] = useState<string>()

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

    if (documents.length === 0) {
      setDocumentsError('Add your NIC copy (and driving licence if you’re applying as a driver).')
      return
    }
    // The select is `required`, so the browser guarantees a role here; this narrows the type.
    if (!role) return

    void onSubmit({
      applicationFormCode: applicationForm?.code,
      fullName: values.fullName.trim(),
      // NIC letters are stored upper-case (e.g. "…V") so the same NIC always matches.
      nic: values.nic.trim().toUpperCase(),
      email: values.email.trim(),
      mobile: values.mobile.trim(),
      role,
      documents,
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h1 className={styles.title}>Apply for a staff account</h1>
        <p className={styles.subtitle}>
          For drivers, mechanics and office staff. A Fleet Administrator reviews every
          application before an account is created.
        </p>
      </div>

      {/* Tells the applicant which admin-generated form they are filling in and until when. */}
      {applicationForm && (
        <Banner
          tone="info"
          title={`Application form ${applicationForm.code}`}
          message={`This form was generated for you by the Fleet Administrator. It expires on ${formatDate(applicationForm.expiresOn)}.`}
        />
      )}

      <h2 className={styles.sectionLabel}>Your details</h2>

      <div className={styles.row}>
        <TextField
          label="Full name"
          name="fullName"
          autoComplete="name"
          placeholder="First and last name"
          required
          value={values.fullName}
          onChange={handleChange}
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
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          required
          value={values.email}
          onChange={handleChange}
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
        />
      </div>

      <Select
        label="Role you’re applying for"
        name="role"
        required
        placeholder="Select a role"
        options={roleOptions}
        value={role}
        onChange={(event) => setRole(event.target.value as StaffRole)}
      />

      {/* Supporting documents the administrator checks before approving the application. */}
      <h2 className={styles.sectionLabel}>Documents</h2>

      <FileUpload
        label="Upload documents"
        files={documents}
        onChange={handleDocumentsChange}
        accept={DOCUMENT_TYPES}
        maxFileSize={MAX_DOCUMENT_SIZE}
        hint="NIC copy and driving licence · PDF or JPG · up to 5 MB each"
        error={documentsError}
      />

      {/* `required` makes the browser block submission until the applicant confirms. */}
      <Checkbox
        name="confirmDetails"
        required
        className={styles.terms}
        label="The details I’ve given are correct"
      />

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Submitting…' : 'Submit application'}
      </Button>

      <p className={styles.footer}>
        Already have an account?{' '}
        <a href="/" className={styles.link}>
          Sign in
        </a>
      </p>
    </form>
  )
}
