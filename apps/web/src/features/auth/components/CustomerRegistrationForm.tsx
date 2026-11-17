import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { TextField } from '@/components/shared/TextField'
import { Button } from '@/components/ui/button'
import type { ApiError } from '@/services/apiClient'
import type { CustomerRegistrationRequest } from '../types'
import { authLinkClass, AuthFormHeader, AuthSectionLabel } from './AuthFormHeader'
import { CheckboxField } from './CheckboxField'

type CustomerRegistrationFormProps = {
  /** Called with the validated details; the parent page performs the actual registration. */
  onSubmit: (values: CustomerRegistrationRequest) => void | Promise<void>
  /** Disables the submit button and shows "Creating account…" while a request is in flight. */
  isSubmitting?: boolean
  /** The last failed submit: field errors go under their inputs, anything else in a banner. */
  error?: ApiError
}

/** Empty form values; keys match the `name` attribute of each input. */
const initialValues: CustomerRegistrationRequest = {
  companyName: '',
  businessRegistrationNo: '',
  billingAddress: '',
  fullName: '',
  mobile: '',
  email: '',
  password: '',
}

/**
 * Presentational customer sign-up form (Figma "Auth — Customer registration", node 118:3518).
 * Required fields use native browser validation; the password match and the terms
 * checkbox are checked here before `onSubmit` is called.
 */
export function CustomerRegistrationForm({ onSubmit, isSubmitting = false, error }: CustomerRegistrationFormProps) {
  const [values, setValues] = useState(initialValues)
  // Kept outside `values` because it is only used for the match check and never sent.
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  // These two only appear after a submit attempt, so the user isn't warned while still typing.
  const [passwordMismatch, setPasswordMismatch] = useState(false)
  const [termsError, setTermsError] = useState(false)

  // One change handler for all text inputs: each input's `name` is a key of `values`.
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const matches = values.password === confirmPassword
    setPasswordMismatch(!matches)
    setTermsError(!acceptedTerms)
    if (!matches || !acceptedTerms) return

    // Trim everything except the password so stray spaces don't end up in the account.
    void onSubmit({
      companyName: values.companyName.trim(),
      businessRegistrationNo: values.businessRegistrationNo.trim(),
      billingAddress: values.billingAddress.trim(),
      fullName: values.fullName.trim(),
      mobile: values.mobile.trim(),
      email: values.email.trim(),
      password: values.password,
    })
  }

  /** The API's message for a field, if the last submit was rejected for it. */
  const fieldError = (name: keyof CustomerRegistrationRequest) => error?.fieldError(name)

  /** Props that put a field into its error state when the API rejected it. */
  const serverErrorProps = (name: keyof CustomerRegistrationRequest, hint?: string) => {
    const message = fieldError(name)
    return { invalid: Boolean(message), helperText: message ?? hint }
  }

  return (
    <form className="flex w-full max-w-[480px] flex-col gap-4" onSubmit={handleSubmit}>
      <AuthFormHeader
        title="Create a customer account"
        subtitle="Register your company to place transport orders, get fare quotations and pay online."
      />

      {/* Errors that don't belong to one field (e.g. "Email already in use"). */}
      {error && error.errorCode !== 'validation_failed' && <Banner tone="danger" title={error.title} message={error.detail} />}

      {/* Company details: the customer account belongs to a company, not a person. */}
      <AuthSectionLabel>Company</AuthSectionLabel>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
        <TextField
          label="Company name"
          name="companyName"
          autoComplete="organization"
          placeholder="Company (Pvt) Ltd"
          required
          value={values.companyName}
          onChange={handleChange}
          {...serverErrorProps('companyName')}
        />
        <TextField
          label="Business registration no."
          name="businessRegistrationNo"
          placeholder="PV 00000000"
          required
          monospace
          value={values.businessRegistrationNo}
          onChange={handleChange}
          {...serverErrorProps('businessRegistrationNo')}
        />
      </div>

      <TextField
        label="Billing address"
        name="billingAddress"
        autoComplete="street-address"
        placeholder="No., street, city"
        required
        value={values.billingAddress}
        onChange={handleChange}
        {...serverErrorProps('billingAddress')}
      />

      {/* Contact person: the user who will sign in and manage orders for the company. */}
      <AuthSectionLabel>Contact person</AuthSectionLabel>

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

      <TextField
        label="Work email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="name@company.lk"
        required
        value={values.email}
        onChange={handleChange}
        {...serverErrorProps('email', 'You’ll sign in with this email')}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••••"
          required
          value={values.password}
          onChange={handleChange}
          {...serverErrorProps('password')}
        />
        <TextField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••••"
          required
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value)
            // Hide the mismatch error as soon as the user starts correcting it.
            setPasswordMismatch(false)
          }}
          invalid={passwordMismatch}
          helperText={passwordMismatch ? 'Passwords don’t match' : undefined}
        />
      </div>

      <CheckboxField
        name="acceptTerms"
        size="md"
        checked={acceptedTerms}
        onCheckedChange={(checked) => {
          setAcceptedTerms(checked)
          if (checked) setTermsError(false)
        }}
        error={termsError ? 'Accept the terms of service to continue' : undefined}
        label={
          <>
            I agree to the{' '}
            {/* TODO: the /terms page doesn't exist yet. */}
            <a href="/terms" className={authLinkClass} target="_blank" rel="noreferrer">
              terms of service
            </a>
          </>
        }
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : 'Create account'}
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
