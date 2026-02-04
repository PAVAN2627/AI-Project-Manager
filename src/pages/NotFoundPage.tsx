import { Link } from 'react-router-dom'

import styles from './AuthPage.module.css'

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.helper}>That route doesn’t exist.</p>
        <Link className={styles.link} to="/dashboard">
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
