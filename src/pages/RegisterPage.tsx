import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { setHackathonUser } from '../app/hackathonAuth'
import styles from './AuthPage.module.css'

export function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Register</h1>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault()
            const trimmedName = name.trim()
            const trimmedEmail = email.trim()
            if (!trimmedEmail) return

            setHackathonUser({ name: trimmedName || undefined, email: trimmedEmail })
            navigate('/dashboard')
          }}
        >
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Name
            </label>
            <input
              id="name"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex"
              autoComplete="name"
              required
            />
          </div>

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

          <div className={styles.actions}>
            <button className={styles.button} type="submit">
              Create account
            </button>
            <Link className={styles.link} to="/login">
              Back to login
            </Link>
          </div>
        </form>

        <p className={styles.helper}>
          Hackathon-only flow: this form doesn’t create a real account.
        </p>
      </div>
    </div>
  )
}
