import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'

import { auth } from '../firebase/firebase'
import { isFirebaseConfigured } from '../firebase/firebaseConfig'
import { ModernButton } from '../components/ModernButton/ModernButton'
import styles from './AuthPage.module.css'

export function LoginPage() {
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
            <span className="text-4xl animate-glow">🤖</span>
            <h1 className={`${styles.heroTitle} text-gradient`}>Welcome Back</h1>
          </div>
          <p className={styles.heroSubtitle}>
            Sign in to your <span className="text-gradient-secondary">AI Project Manager</span> and continue building amazing interfaces
          </p>
        </div>
        
        <div className={`${styles.card} card-glass-lg card-hover animate-shimmer`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.title}>Sign In</h2>
            <p className={styles.subtitle}>Access your AI-powered workspace</p>
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
                Email Address
              </label>
              <input
                id="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                type="email"
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
              <ModernButton
                variant="gradient"
                size="lg"
                type="submit"
                disabled={isSubmitting || !isFirebaseConfigured}
                loading={isSubmitting}
                className="w-full"
                icon={!isSubmitting ? "🚀" : undefined}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </ModernButton>
            </div>
            
            <div className={styles.footer}>
              <p className={styles.footerText}>
                Don't have an account?{' '}
                <Link className={`${styles.link} text-gradient-secondary`} to="/register">
                  Create one here
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
