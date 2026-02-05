import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'

import { auth } from '../firebase/firebase'
import { isFirebaseConfigured } from '../firebase/firebaseConfig'
import { ModernButton } from '../components/ModernButton/ModernButton'
import styles from './AuthPage.module.css'

export function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <div className={`${styles.page} bg-gradient-hero`}>
      <div className={styles.container}>
        <div className={`${styles.heroSection} animate-float`}>
          <div className="flex-center gap-4 mb-6">
            <span className="text-4xl animate-glow">✨</span>
            <h1 className={`${styles.heroTitle} text-gradient`}>Join the Future</h1>
          </div>
          <p className={styles.heroSubtitle}>
            Create your account and start building with <span className="text-gradient-secondary">AI-driven interfaces</span> that adapt to your needs
          </p>
        </div>
        
        <div className={`${styles.card} card-glass-lg card-hover animate-shimmer`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.title}>Create Account</h2>
            <p className={styles.subtitle}>Get started with your AI workspace</p>
          </div>
          
          <form
            className={styles.form}
            onSubmit={async (e) => {
              e.preventDefault()
              if (isSubmitting) return

              if (!isFirebaseConfigured) {
                setError('Firebase is not configured. Set `VITE_FIREBASE_*` in `.env.local`.')
                return
              }

            const trimmedEmail = email.trim().toLowerCase()
            const trimmedPassword = password.trim()
            if (!trimmedEmail || !trimmedPassword) return

            try {
              setIsSubmitting(true)
              setError(null)
              await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword)
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
            <ModernButton
              variant="gradient"
              size="lg"
              type="submit"
              disabled={isSubmitting || !isFirebaseConfigured}
              loading={isSubmitting}
              className="w-full"
              icon={!isSubmitting ? "✨" : undefined}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </ModernButton>
          </div>
          
          <div className={styles.footer}>
            <p className={styles.footerText}>
              Already have an account?{' '}
              <Link className={`${styles.link} text-gradient-secondary`} to="/login">
                Sign in here
              </Link>
            </p>
            <Link className={`${styles.backLink} flex-center gap-2`} to="/">
              <span>←</span> Back to Home
            </Link>
          </div>
        </form>

        {!isFirebaseConfigured && (
          <div className={styles.errorCard}>
            <span className={styles.errorIcon}>⚠️</span>
            <p className={styles.errorText}>Firebase isn't configured yet. Check your environment variables.</p>
          </div>
        )}

        {error && (
          <div className={styles.errorCard}>
            <span className={styles.errorIcon}>❌</span>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
