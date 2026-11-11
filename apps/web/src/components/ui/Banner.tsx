import xCircleIcon from '@/assets/icons/x-circle.svg'
import styles from './Banner.module.css'

type BannerProps = {
  /** Short bold headline, e.g. "Incorrect email or password". */
  title: string
  /** Supporting sentence explaining what happened or what to do next. */
  message: string
  className?: string
}

/**
 * Inline status banner (Figma component "Banner", tone = Danger).
 * Only the danger tone exists in the design so far; add a `tone` prop
 * when success/warning variants are designed.
 */
export function Banner({ title, message, className }: BannerProps) {
  return (
    // role="alert" makes screen readers announce the banner as soon as it appears.
    <div role="alert" className={[styles.banner, className].filter(Boolean).join(' ')}>
      <img src={xCircleIcon} width={18} height={18} alt="" className={styles.icon} />
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  )
}
