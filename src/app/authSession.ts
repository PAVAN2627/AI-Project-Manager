export type AuthSession = {
  email: string
  token: string
}

const STORAGE_KEY = 'ai_project_manager_session'

function getStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    return window.localStorage
  } catch {
    return null
  }
}

export function setAuthSession(session: AuthSession) {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function getAuthSession(): AuthSession | null {
  const storage = getStorage()
  if (!storage) return null

  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (typeof parsed.email !== 'string' || parsed.email.trim() === '') return null
    if (typeof parsed.token !== 'string' || parsed.token.trim() === '') return null

    return {
      email: parsed.email,
      token: parsed.token,
    }
  } catch {
    return null
  }
}

export function clearAuthSession() {
  const storage = getStorage()
  if (!storage) return
  storage.removeItem(STORAGE_KEY)
}
