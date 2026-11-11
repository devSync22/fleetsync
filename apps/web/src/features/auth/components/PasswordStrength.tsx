import checkCircleSmallIcon from '@/assets/icons/check-circle-sm.svg'
import { getPasswordStrength, passwordRules } from '../utils/passwordRules'
import styles from './PasswordStrength.module.css'

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
  const tone = strength.score >= 3 ? styles.strong : styles.weak

  return (
    <>
      {/* The meter only appears once the user starts typing. */}
      {strength.score > 0 && (
        <div className={[styles.meter, tone].join(' ')}>
          <div className={styles.bars} aria-hidden="true">
            {[1, 2, 3, 4].map((bar) => (
              <span
                key={bar}
                className={[styles.bar, bar <= strength.score && styles.filled]
                  .filter(Boolean)
                  .join(' ')}
              />
            ))}
          </div>
          {/* aria-live announces strength changes to screen-reader users as they type. */}
          <p className={styles.label} aria-live="polite">
            {strength.label} password
          </p>
        </div>
      )}

      <ul className={styles.rules}>
        {passwordRules.map((rule) => {
          const met = rule.test(password)
          return (
            <li key={rule.id} className={[styles.rule, met && styles.met].filter(Boolean).join(' ')}>
              <img src={checkCircleSmallIcon} width={14} height={14} alt="" />
              {rule.label}
              {/* Visible state is only the icon colour, so spell it out for screen readers. */}
              <span className={styles.srOnly}>{met ? ' (done)' : ' (not yet)'}</span>
            </li>
          )
        })}
        {/* Server-only rules stay grey; a violation comes back as an error after submitting. */}
        {serverRules.map((label) => (
          <li key={label} className={styles.rule}>
            <img src={checkCircleSmallIcon} width={14} height={14} alt="" />
            {label}
          </li>
        ))}
      </ul>
    </>
  )
}
