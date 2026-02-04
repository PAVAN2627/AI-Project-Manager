import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { setAuthSession } from '../app/authSession'
import styles from './AuthPage.module.css'

type AuthSessionResponse = {
  ok: true
  session: { email: string; token: string }
}

async function postAuth(path: '/api/login' | '/api/register', body: unknown) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = (await response.json().catch(() => null)) as unknown
  if (!response.ok || !data || typeof data !== 'object') {
    const error =
      data && typeof (data as { error?: unknown }).error === 'string'
        ? (data as { error: string }).error
        : `Request failed (${response.status})`
    throw new Error(error)
  }

  return data as AuthSessionResponse
}

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

            try {
              setIsSubmitting(true)
              setError(null)
              const data = await postAuth('/api/login', {
                email: trimmedEmail,
                password: trimmedPassword,
              })

              setAuthSession(data.session)
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
            <button className={styles.button} type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Login'}
            </button>
            <Link className={styles.link} to="/register">
              Create account
            </Link>
          </div>
        </form>

        {error ? <p className={styles.helper}>{error}</p> : null}
      </div>
    </div>
  )
}
