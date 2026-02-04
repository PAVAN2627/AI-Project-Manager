import crypto from 'node:crypto'

/**
* Hackathon-only session store.
*
* - Stored in memory (server restart clears sessions)
* - Tokens are random UUIDs
*/

const sessions = new Map()

export function createSession({ email }) {
  const token = crypto.randomUUID()
  const session = {
    token,
    email,
    createdAt: new Date().toISOString(),
  }

  sessions.set(token, session)
  return session
}

export function getSession(token) {
  if (typeof token !== 'string' || token.trim() === '') return null
  return sessions.get(token) ?? null
}

export function clearSession(token) {
  if (typeof token !== 'string' || token.trim() === '') return
  sessions.delete(token)
}
