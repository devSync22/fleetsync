import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { TextField } from '@/components/ui/TextField'
import type { CustomerRegistrationRequest } from '../types'
import styles from '@/features/auth/shared/styles/AuthForm.module.css'

type CustomerRegistrationFormProps = {
  /** Called with the validated details; the parent page performs the actual registration. */
  onSubmit: (values: CustomerRegistrationRequest) => void | Promise<void>
  /** Disables the submit button and shows "Creating account…" while a request is in flight. */
  isSubmitting?: boolean
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
 * Presentational customer sign-up form (Figma "Auth — Customer registration").
 * Required fields and the terms checkbox use native browser validation; the
 * password match is checked here before `onSubmit` is called.
 */
export function CustomerRegistrationForm({
  onSubmit,
  isSubmitting = false,
}: CustomerRegistrationFormProps) {
  const [values, setValues] = useState(initialValues)
  // Kept outside `values` because it is only used for the match check and never sent.
  const [confirmPassword, setConfirmPassword] = useState('')
  // Only shown after a submit attempt, so the user isn't warned while still typing.
  const [passwordMismatch, setPasswordMismatch] = useState(false)

  // One change handler for all text inputs: each input's `name` is a key of `values`.
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (values.password !== confirmPassword) {
      setPasswordMismatch(true)
      return
    }

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

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create a customer account</h1>
        <p className={styles.subtitle}>
          Register your company to place transport orders, get fare quotations and pay online.
        </p>
      </div>

      {/* Company details: the customer account belongs to a company, not a person. */}
      <h2 className={styles.sectionLabel}>Company</h2>

      <div className={styles.row}>
        <TextField
          label="Company name"
          name="companyName"
          autoComplete="organization"
          placeholder="Company (Pvt) Ltd"
          required
          value={values.companyName}
          onChange={handleChange}
        />
        <TextField
          label="Business registration no."
          name="businessRegistrationNo"
          placeholder="PV 00000000"
          required
          monospace
          value={values.businessRegistrationNo}
          onChange={handleChange}
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
      />

      {/* Contact person: the user who will sign in and manage orders for the company. */}
      <h2 className={styles.sectionLabel}>Contact person</h2>

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

      <TextField
        label="Work email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="name@company.lk"
        required
        helperText="You’ll sign in with this email"
        value={values.email}
        onChange={handleChange}
      />

      {/* TODO: add password strength rules once the backend password policy is defined. */}
      <div className={styles.row}>
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••••"
          required
          value={values.password}
          onChange={handleChange}
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

      {/* `required` makes the browser block submission until the terms are accepted. */}
      <Checkbox
        name="acceptTerms"
        required
        className={styles.terms}
        label={
          <>
            I agree to the{' '}
            {/* TODO: the /terms page doesn't exist yet. */}
            <a href="/terms" className={styles.link} target="_blank" rel="noreferrer">
              terms of service
            </a>
          </>
        }
      />

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : 'Create account'}
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
