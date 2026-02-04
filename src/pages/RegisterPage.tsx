import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { register } from '../app/authApi'
import { setAuthSession } from '../app/authSession'
import styles from './AuthPage.module.css'

export function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Register</h1>
        <form
          className={styles.form}
          onSubmit={async (e) => {
            e.preventDefault()
            if (isSubmitting) return

            const trimmedEmail = email.trim().toLowerCase()
            const trimmedPassword = password.trim()
            if (!trimmedEmail || !trimmedPassword) return

            try {
              setIsSubmitting(true)
              setError(null)
              const session = await register({
                email: trimmedEmail,
                password: trimmedPassword,
              })

              setAuthSession(session)
              navigate('/dashboard')
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Registration failed')
            } finally {
              setIsSubmitting(false)
            }
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              type="password"
              required
            />
          </div>

          <div className={styles.actions}>
            <button className={styles.button} type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create account'}
            </button>
            <Link className={styles.link} to="/login">
              Back to login
            </Link>
          </div>
        </form>

        {error ? <p className={styles.helper}>{error}</p> : null}
      </div>
    </div>
  )
}
