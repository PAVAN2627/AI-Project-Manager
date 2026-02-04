export type HackathonUser = {
  name?: string
  email: string
}

const STORAGE_KEY = 'ai_project_manager_hackathon_user'

export function setHackathonUser(user: HackathonUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function getHackathonUser(): HackathonUser | null {
  const raw = localStorage.getItem(STORAGE_KEY)
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
  localStorage.removeItem(STORAGE_KEY)
}
