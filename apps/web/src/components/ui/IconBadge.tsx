import styles from './IconBadge.module.css'

type IconBadgeProps = {
  /** Imported 20px SVG (e.g. key or lock icon). */
  icon: string
}

/**
 * Decorative round icon shown above a page title (Figma: 44px circle with
 * an accent-soft fill, e.g. on "Forgot password" and "Set new password").
 */
export function IconBadge({ icon }: IconBadgeProps) {
  return (
    <div className={styles.badge} aria-hidden="true">
      <img src={icon} width={20} height={20} alt="" />
    </div>
  )
}
