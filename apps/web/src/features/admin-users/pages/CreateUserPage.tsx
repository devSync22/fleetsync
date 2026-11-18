import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { OptionCard } from '@/components/shared/OptionCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { SelectField } from '@/components/shared/SelectField'
import { TextField } from '@/components/shared/TextField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useAction } from '@/hooks/useAction'
import { useCreateUserOptions } from '../hooks/useCreateUserOptions'
import { createRoleDescriptions, roleInfo } from '../roles'
import { createUser } from '../services/adminUsersApi'
import type { CreateUserInput, StaffRole } from '../types'

const staffRoles: StaffRole[] = ['driver', 'mechanic', 'coordinator', 'fleet-administrator', 'owner']
const isStaffRole = (value: string | null): value is StaffRole => staffRoles.includes(value as StaffRole)

type Form = {
  fullName: string
  nic: string
  email: string
  mobile: string
  depot: string
  role: StaffRole
  signIn: CreateUserInput['signIn']
  licenceNumber: string
  licenceClass: string
  licenceExpiry: string
  licenceFileName: string | null
}

type Errors = Partial<Record<keyof Form, string>>

/** Client-side checks; the API validates again. Sri Lankan NIC: 9 digits + V/X, or 12 digits. */
function validate(form: Form): Errors {
  const errors: Errors = {}
  if (!form.fullName.trim()) errors.fullName = 'Enter the full name'
  if (!/^(\d{9}[VvXx]|\d{12})$/.test(form.nic.trim())) errors.nic = 'Enter a valid NIC (e.g. 199208765432)'
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Enter a valid email address'
  if (form.mobile.replace(/\D/g, '').length !== 10) errors.mobile = 'Enter a 10-digit mobile number'
  if (form.role === 'driver') {
    if (!form.licenceNumber.trim()) errors.licenceNumber = 'Enter the licence number'
    if (!form.licenceExpiry) errors.licenceExpiry = 'Pick the expiry date'
    else if (new Date(form.licenceExpiry) <= new Date()) errors.licenceExpiry = 'This licence has already expired'
    if (!form.licenceFileName) errors.licenceFileName = 'Upload a copy of the licence'
  }
  return errors
}

function FormSection({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border bg-card">
      <header className="flex flex-col gap-0.5 border-b px-6 py-4">
        <h2 className="text-base leading-6 font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </header>
      <div className="px-6 py-5">{children}</div>
    </section>
  )
}

/**
 * "Admin — User accounts / Create user" (109:2970). Administrators add staff directly; customer companies
 * register themselves. `?role=driver` pre-selects a role (used by "Add driver").
 */
export function CreateUserPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const presetRole = searchParams.get('role')
  const options = useCreateUserOptions()
  const { run, pending, error } = useAction(createUser)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<Form>({
    fullName: '',
    nic: '',
    email: '',
    mobile: '',
    depot: '',
    role: isStaffRole(presetRole) ? presetRole : 'driver',
    signIn: 'setup-link',
    licenceNumber: '',
    licenceClass: '',
    licenceExpiry: '',
    licenceFileName: null,
  })

  const data = options.state.status === 'success' ? options.state.data : null
  // Default selects to the first option once the options arrive.
  const depot = form.depot || data?.depots[0] || ''
  const licenceClass = form.licenceClass || data?.licenceClasses[0] || ''
  const errors = submitted ? validate(form) : {}
  const firstName = form.fullName.trim().split(' ')[0] || 'They'

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(validate(form)).length > 0) return
    const result = await run({
      fullName: form.fullName,
      nic: form.nic,
      email: form.email,
      mobile: form.mobile,
      depot,
      role: form.role,
      signIn: form.signIn,
      driver:
        form.role === 'driver'
          ? { licenceNumber: form.licenceNumber, licenceClass, licenceExpiry: form.licenceExpiry, licenceFileName: form.licenceFileName }
          : null,
    })
    // Open the new account's profile on the list.
    if (result) navigate(`/admin/users?user=${result.userId}`)
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Breadcrumbs items={[{ label: 'User accounts', to: '/admin/users' }, { label: 'Create user' }]} />
        <PageHeader
          title="Create user"
          description="Add a staff member directly. Customer companies register themselves or apply through Applications."
        />
      </div>

      {options.state.status === 'error' && (
        <Banner
          tone="danger"
          title="Couldn’t load the form"
          message={options.state.error.message}
          action={
            <Button type="button" variant="outline" size="sm" onClick={options.retry}>
              Try again
            </Button>
          }
        />
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <FormSection title="Personal details">
            <div className="grid gap-x-4 gap-y-4 md:grid-cols-2">
              <TextField
                label="Full name"
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                placeholder="Pradeep Kumara"
                invalid={!!errors.fullName}
                helperText={errors.fullName}
                autoComplete="off"
              />
              <TextField
                label="NIC number"
                monospace
                value={form.nic}
                onChange={(e) => set('nic', e.target.value)}
                placeholder="199208765432"
                invalid={!!errors.nic}
                helperText={errors.nic}
              />
              <TextField
                label="Work email"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="pradeep.k@fms.lk"
                invalid={!!errors.email}
                helperText={errors.email ?? 'Used to sign in'}
              />
              <TextField
                label="Mobile"
                type="tel"
                monospace
                value={form.mobile}
                onChange={(e) => set('mobile', e.target.value)}
                placeholder="077 900 3344"
                invalid={!!errors.mobile}
                helperText={errors.mobile}
              />
              {data ? (
                <TextField label="Employee ID" monospace value={data.nextEmployeeId} readOnly helperText="Generated automatically" />
              ) : (
                <Skeleton className="h-[66px] rounded-lg" />
              )}
              <SelectField
                label="Depot"
                options={(data?.depots ?? []).map((d) => ({ value: d, label: d }))}
                value={depot}
                onChange={(e) => set('depot', e.target.value)}
                disabled={!data}
              />
            </div>
          </FormSection>

          <FormSection title="Role" subtitle="Decides what this person can see and do">
            <fieldset className="grid gap-3 md:grid-cols-2">
              <legend className="sr-only">Role</legend>
              {staffRoles.map((role) => (
                <OptionCard
                  key={role}
                  name="role"
                  value={role}
                  checked={form.role === role}
                  onSelect={(value) => set('role', value as StaffRole)}
                  title={roleInfo[role].label}
                  description={createRoleDescriptions[role]}
                />
              ))}
            </fieldset>
          </FormSection>

          {form.role === 'driver' && (
            <FormSection title="Driver details" subtitle="Shown because the role is Driver">
              <div className="grid gap-x-4 gap-y-4 md:grid-cols-2">
                <TextField
                  label="Licence number"
                  monospace
                  value={form.licenceNumber}
                  onChange={(e) => set('licenceNumber', e.target.value)}
                  placeholder="B1122334"
                  invalid={!!errors.licenceNumber}
                  helperText={errors.licenceNumber}
                />
                <SelectField
                  label="Licence class"
                  options={(data?.licenceClasses ?? []).map((c) => ({ value: c, label: c }))}
                  value={licenceClass}
                  onChange={(e) => set('licenceClass', e.target.value)}
                  disabled={!data}
                />
                <TextField
                  label="Licence expiry"
                  type="date"
                  value={form.licenceExpiry}
                  onChange={(e) => set('licenceExpiry', e.target.value)}
                  invalid={!!errors.licenceExpiry}
                  helperText={errors.licenceExpiry}
                />
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="licence-copy">Licence copy</Label>
                  {/* TODO: upload to document storage once the endpoint exists; only the file name is sent for now. */}
                  <Input
                    id="licence-copy"
                    type="file"
                    accept=".pdf,image/*"
                    aria-invalid={errors.licenceFileName ? true : undefined}
                    onChange={(e) => set('licenceFileName', e.target.files?.[0]?.name ?? null)}
                  />
                  <p className={errors.licenceFileName ? 'text-xs text-danger' : 'text-xs text-muted-foreground'}>
                    {errors.licenceFileName ?? (form.licenceFileName ? 'Uploaded' : 'PDF or photo, up to 5 MB')}
                  </p>
                </div>
              </div>
            </FormSection>
          )}

          {error && <Banner tone="danger" title="Couldn’t create the user" message={error.message} />}

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/admin/users">Cancel</Link>
            </Button>
            <Button type="submit" disabled={pending || !data}>
              {pending ? 'Creating…' : 'Create user'}
            </Button>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <FormSection title="Sign-in setup">
            <fieldset className="flex flex-col gap-3">
              <legend className="sr-only">Sign-in setup</legend>
              <OptionCard
                name="sign-in"
                value="setup-link"
                checked={form.signIn === 'setup-link'}
                onSelect={() => set('signIn', 'setup-link')}
                title="Email a setup link"
                description="They choose their own password"
              />
              <OptionCard
                name="sign-in"
                value="temporary-password"
                checked={form.signIn === 'temporary-password'}
                onSelect={() => set('signIn', 'temporary-password')}
                title="Create a temporary password"
                description="Must be changed at first sign-in"
              />
            </fieldset>
          </FormSection>

          <FormSection title="What happens next">
            <ol className="flex flex-col gap-3 text-[13px] leading-5">
              {[
                `The account is created as Active with the ${roleInfo[form.role].label} role.`,
                form.signIn === 'setup-link'
                  ? `${firstName} gets an email with a link to set a password.`
                  : `${firstName} signs in with the temporary password and must change it.`,
                'The creation is recorded in the audit log.',
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </FormSection>
        </div>
      </div>
    </form>
  )
}
