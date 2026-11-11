import checkCircleSuccessIcon from '@/assets/icons/check-circle-success.svg'
import infoCircleIcon from '@/assets/icons/info-circle.svg'
import xCircleIcon from '@/assets/icons/x-circle.svg'
import styles from './Banner.module.css'

/** Visual tones available in the Figma "Banner" component. */
type BannerTone = 'danger' | 'info' | 'success'

type BannerProps = {
  /** Short bold headline, e.g. "Incorrect email or password". */
  title: string
  /** Supporting sentence explaining what happened or what to do next. */
  message: string
  /** `danger` for errors (default), `info` for neutral information, `success` for confirmations. */
  tone?: BannerTone
  className?: string
}

/** Icon shown for each tone; each SVG already has the tone's colour baked in. */
const toneIcons: Record<BannerTone, string> = {
  danger: xCircleIcon,
  info: infoCircleIcon,
  success: checkCircleSuccessIcon,
}

/** Inline status banner (Figma component "Banner"). */
export function Banner({ title, message, tone = 'danger', className }: BannerProps) {
  return (
    <div
      // Errors interrupt screen readers right away (alert); info waits politely (status).
      role={tone === 'danger' ? 'alert' : 'status'}
      className={[styles.banner, styles[tone], className].filter(Boolean).join(' ')}
    >
      <img src={toneIcons[tone]} width={18} height={18} alt="" className={styles.icon} />
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  )
}
