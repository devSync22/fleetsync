import { useState } from 'react'
import { Check, CircleCheck, Circle } from 'lucide-react'
import { Banner } from '@/components/shared/Banner'
import { SectionCard } from '@/components/shared/SectionCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ApiError } from '@/services/apiClient'
import { cn } from '@/lib/utils'
import { passwordRules } from '../profileFields'
import type { Security } from '../types'
import { FormField } from './FormField'

type ChangePasswordCardProps = {
  security: Security
  email: string
  updating: boolean
  error: ApiError | null
  onUpdate: (current: string, next: string) => Promise<boolean>
}

function signedOutSummary(count: number) {
  if (count === 0) return ''
  return ` ${count} other ${count === 1 ? 'device was' : 'devices were'} signed out, and`
}

/** "Change password", plus the "Password updated" state (456:10519) once it succeeds. */
export function ChangePasswordCard({ security, email, updating, error, onUpdate }: ChangePasswordCardProps) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')

  const rules = passwordRules.map((rule) => ({ ...rule, met: rule.test(next) }))
  const strong = rules.every((r) => r.met)
  const matches = confirm.length > 0 && confirm === next
  const canSubmit = current.length > 0 && strong && matches && !updating
  const touched = current || next || confirm
  const updated = security.passwordChange

  const clear = () => {
    setCurrent('')
    setNext('')
    setConfirm('')
  }

  return (
    <SectionCard title="Change password" subtitle="Use at least 8 characters with a number and a capital letter">
      <form
        className="flex flex-col gap-3.5 px-6 py-5"
        onSubmit={async (event) => {
          event.preventDefault()
          if (canSubmit && (await onUpdate(current, next))) clear()
        }}
      >
        {updated && !touched && (
          <Banner
            tone="success"
            title="Password updated"
            message={`You are still signed in on this device.${signedOutSummary(updated.signedOut.length)} a confirmation email was sent to ${email}.`}
          />
        )}
        {error && <Banner tone="danger" title="Couldn’t update your password" message={error.message} />}

        <FormField id="pw-current" label="Current password">
          <Input
            id="pw-current"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="pw-new"
            label="New password"
            helper={
              next &&
              (strong ? (
                <>
                  <CircleCheck className="size-3.5 text-success" aria-hidden />
                  Strong password
                </>
              ) : (
                'Doesn’t meet all the rules yet'
              ))
            }
          >
            <Input
              id="pw-new"
              type="password"
              autoComplete="new-password"
              value={next}
              aria-describedby="pw-rules"
              onChange={(e) => setNext(e.target.value)}
              className={cn('font-mono', strong && 'border-success focus-visible:border-success')}
            />
          </FormField>
          <FormField
            id="pw-confirm"
            label="Confirm new password"
            helper={confirm && (matches ? 'Passwords match' : 'Passwords don’t match')}
          >
            <Input
              id="pw-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              aria-invalid={confirm.length > 0 && !matches}
              onChange={(e) => setConfirm(e.target.value)}
              className="font-mono"
            />
          </FormField>
        </div>

        {updated && !touched ? (
          <p className="text-xs text-muted-foreground">Password last changed: {security.passwordLastChanged}.</p>
        ) : (
          <>
            <ul id="pw-rules" className="flex flex-col gap-1.5 rounded-lg bg-secondary px-3.5 py-3" aria-label="Password rules">
              {rules.map((rule) => (
                <li key={rule.id} className="flex items-center gap-2 text-[13px]">
                  {rule.met ? (
                    <Check className="size-3.5 text-success" aria-hidden />
                  ) : (
                    <Circle className="size-3.5 text-faint" aria-hidden />
                  )}
                  <span className={cn(!rule.met && 'text-muted-foreground')}>{rule.label}</span>
                  <span className="sr-only">{rule.met ? '(met)' : '(not met yet)'}</span>
                </li>
              ))}
              <li className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <Circle className="size-3.5 text-faint" aria-hidden />
                Not the same as your last 3 passwords
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">
              You stay signed in on this device. You are signed out everywhere else and get an email about the change.
            </p>
          </>
        )}

        <div className="flex justify-end gap-2">
          {touched && (
            <Button type="button" variant="outline" onClick={clear} disabled={updating}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={!canSubmit}>
            {updating ? 'Updating…' : 'Update password'}
          </Button>
        </div>
      </form>
    </SectionCard>
  )
}
