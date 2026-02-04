import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import styles from './AuthPage.module.css'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault()
            navigate('/dashboard')
          }}
        >
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <div className={styles.actions}>
            <button className={styles.button} type="submit">
              Continue
            </button>
            <Link className={styles.link} to="/register">
              Create account
            </Link>
          </div>
        </form>

        <p className={styles.helper}>
          Hackathon-only flow: this form doesn’t validate credentials.
        </p>
      </div>
    </div>
  )
}
