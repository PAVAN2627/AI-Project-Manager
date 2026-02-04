export type HackathonUser = {
  name?: string
  email: string
}

const STORAGE_KEY = 'ai_project_manager_hackathon_user'

function getStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    return window.localStorage
  } catch {
    return null
  }
}

export function setHackathonUser(user: HackathonUser) {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function getHackathonUser(): HackathonUser | null {
  const storage = getStorage()
  if (!storage) return null

  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (typeof parsed.email !== 'string' || parsed.email.trim() === '') return null

    return {
      email: parsed.email,
      name: typeof parsed.name === 'string' && parsed.name.trim() !== '' ? parsed.name : undefined,
    }
  } catch {
    return null
  }
}

export function clearHackathonUser() {
  const storage = getStorage()
  if (!storage) return
  storage.removeItem(STORAGE_KEY)
}
