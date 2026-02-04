import { Router } from 'express'

import { createSession } from '../services/sessionStore.js'
import { createUser, verifyUserPassword } from '../services/userStore.js'

export const authRouter = Router()

const MIN_PASSWORD_LENGTH = 4

function normalizeEmail(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().toLowerCase()
  return trimmed ? trimmed : null
}

function normalizePassword(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

authRouter.post('/register', async (req, res) => {
  const email = normalizeEmail(req.body?.email)
  const password = normalizePassword(req.body?.password)

  if (!email || !password) {
    res.status(400).json({ error: "Missing 'email' or 'password'" })
    return
  }

  if (!email.includes('@')) {
    res.status(400).json({ error: "Invalid 'email'" })
    return
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    res
      .status(400)
      .json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` })
    return
  }

  try {
    await createUser({ email, password })
    const session = createSession({ email })
    res.json({ ok: true, session })
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_EXISTS') {
      res.status(409).json({ error: 'User already exists' })
      return
    }

    res.status(500).json({ error: 'Failed to register user' })
  }
})

authRouter.post('/login', async (req, res) => {
  const email = normalizeEmail(req.body?.email)
  const password = normalizePassword(req.body?.password)

  if (!email || !password) {
    res.status(400).json({ error: "Missing 'email' or 'password'" })
    return
  }

  if (!email.includes('@')) {
    res.status(400).json({ error: "Invalid 'email'" })
    return
  }

  const ok = await verifyUserPassword({ email, password })
  if (!ok) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const session = createSession({ email })
  res.json({ ok: true, session })
})
