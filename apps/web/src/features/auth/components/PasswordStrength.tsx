import { CircleCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPasswordStrength, passwordRules } from '../utils/passwordRules'

type PasswordStrengthProps = {
  /** The password being typed; everything updates live as it changes. */
  password: string
  /**
   * Extra rules only the server can verify (e.g. "Not the same as your last
   * password"). Always shown as not yet checked.
   */
  serverRules?: string[]
}

/**
 * 4-bar strength meter + rules checklist under a new-password field
 * (Figma "Auth — Set new password", nodes 113:4410 and 113:4417).
 * Returns two sibling blocks so the parent form's gap spaces them like the design.
 */
export function PasswordStrength({ password, serverRules = [] }: PasswordStrengthProps) {
  const strength = getPasswordStrength(password)
  // Red for weak/fair, green for strong/very strong.
  const strong = strength.score >= 3

  return (
    <>
      {/* The meter only appears once the user starts typing. */}
      {strength.score > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1" aria-hidden="true">
            {[1, 2, 3, 4].map((bar) => (
              <span
                key={bar}
                className={cn(
                  'h-1 flex-1 rounded-sm',
                  bar > strength.score ? 'bg-line' : strong ? 'bg-success' : 'bg-danger',
                )}
              />
            ))}
          </div>
          {/* aria-live announces strength changes to screen-reader users as they type. */}
          <p className={cn('text-xs font-medium', strong ? 'text-success' : 'text-danger')} aria-live="polite">
            {strength.label} password
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-1.5">
        {passwordRules.map((rule) => {
          const met = rule.test(password)
          return (
            <li key={rule.id} className="flex items-center gap-2 text-xs text-muted-foreground">
              <CircleCheck aria-hidden="true" className={cn('size-3.5', met ? 'text-success' : 'text-line')} />
              {rule.label}
              {/* Visible state is only the icon colour, so spell it out for screen readers. */}
              <span className="sr-only">{met ? ' (done)' : ' (not yet)'}</span>
            </li>
          )
        })}
        {/* Server-only rules stay grey; a violation comes back as an error after submitting. */}
        {serverRules.map((label) => (
          <li key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
            <CircleCheck aria-hidden="true" className="size-3.5 text-line" />
            {label}
          </li>
        ))}
      </ul>
    </>
  )
}
