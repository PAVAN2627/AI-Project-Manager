import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { signInWithEmailAndPassword } from 'firebase/auth'

import { auth } from '../firebase/firebase'
import { isFirebaseConfigured } from '../firebase/firebaseConfig'
import styles from './AuthPage.module.css'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>
        <form
          className={styles.form}
          onSubmit={async (e) => {
            e.preventDefault()
            if (isSubmitting) return

            const trimmedEmail = email.trim().toLowerCase()
            const trimmedPassword = password.trim()
            if (!trimmedEmail || !trimmedPassword) return
            if (!isFirebaseConfigured) return

            try {
              setIsSubmitting(true)
              setError(null)
              await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword)
              navigate('/dashboard')
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Login failed')
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
              autoComplete="current-password"
              type="password"
              required
            />
          </div>

          <div className={styles.actions}>
            <button
              className={styles.button}
              type="submit"
              disabled={isSubmitting || !isFirebaseConfigured}
            >
              {isSubmitting ? 'Signing in…' : 'Login'}
            </button>
            <Link className={styles.link} to="/register">
              Create account
            </Link>
          </div>
        </form>

        {!isFirebaseConfigured ? (
          <p className={styles.helper}>Firebase isn’t configured yet. Set `VITE_FIREBASE_*` in `.env.local`.</p>
        ) : null}

        {error ? <p className={styles.helper}>{error}</p> : null}
      </div>
    </div>
  )
}
