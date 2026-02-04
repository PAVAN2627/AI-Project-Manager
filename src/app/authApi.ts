import type { AuthSession } from './authSession'

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') return false
  const maybe = value as { email?: unknown; token?: unknown }
  return (
    typeof maybe.email === 'string' &&
    maybe.email.trim() !== '' &&
    typeof maybe.token === 'string' &&
    maybe.token.trim() !== ''
  )
}

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === 'object') {
    const maybe = data as { error?: unknown }
    if (typeof maybe.error === 'string' && maybe.error.trim() !== '') {
      return maybe.error
    }
  }

  return fallback
}

async function postAuth(path: '/api/login' | '/api/register', body: unknown): Promise<AuthSession> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = (await response.json().catch(() => null)) as unknown
  if (!response.ok) {
    throw new Error(getErrorMessage(data, `Request failed (${response.status})`))
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Invalid auth response')
  }

  const maybeSession = (data as { session?: unknown }).session
  if (!isAuthSession(maybeSession)) {
    throw new Error('Invalid auth response')
  }

  return maybeSession
}

export async function register({ email, password }: { email: string; password: string }) {
  return postAuth('/api/register', { email, password })
}

export async function login({ email, password }: { email: string; password: string }) {
  return postAuth('/api/login', { email, password })
}
