import type { ReactNode } from 'react'
import logoIcon from '@/assets/logo-icon.svg'
import checkCircleIcon from '@/assets/icons/check-circle.svg'
import styles from './AuthLayout.module.css'

const highlights = [
  'Real-time vehicle and driver availability',
  'Preventive service alerts from odometer readings',
  'Role-based dashboards for every user',
]

type AuthLayoutProps = {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <aside className={styles.brandPanel}>
        <div className={styles.brand}>
          <img src={logoIcon} width={40} height={40} alt="" />
          <span className={styles.wordmark}>
            Fleet<span className={styles.wordmarkAccent}>Sync</span>
          </span>
        </div>

        <div className={styles.pitch}>
          <h2 className={styles.headline}>
            Every vehicle, trip and service — in one place.
          </h2>
          <p className={styles.description}>
            Plan trips, assign drivers, track maintenance and see fleet
            performance without spreadsheets or phone calls.
          </p>
          <ul className={styles.highlights}>
            {highlights.map((highlight) => (
              <li key={highlight} className={styles.highlight}>
                <img src={checkCircleIcon} width={18} height={18} alt="" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className={styles.formPanel}>{children}</main>
    </div>
  )
}
