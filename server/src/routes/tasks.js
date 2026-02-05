import { Router } from 'express'

import { getSession } from '../services/sessionStore.js'
import { createTaskForOwner, listTasksForOwner, updateTaskForOwner } from '../services/taskStore.js'

export const tasksRouter = Router()

let hasWarnedAboutUnverifiedFirebaseTokens = false

const TASK_STATUSES = ['todo', 'in_progress', 'blocked', 'done']
const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical']

function getSessionToken(req) {
  const authHeader = req.header('authorization')
  if (typeof authHeader === 'string') {
    const match = authHeader.match(/^Bearer\s+(.+)$/i)
    if (match?.[1]) return match[1].trim()
  }

  // Convenience for non-browser clients (e.g. curl) when setting an Authorization header is annoying.
  const tokenHeader = req.header('x-session-token')
  if (typeof tokenHeader === 'string' && tokenHeader.trim() !== '') {
    return tokenHeader.trim()
  }

  return null
}

function requireSession(req, res, next) {
  const token = getSessionToken(req)
  const ownerEmail = token ? getOwnerEmailFromToken(token) : null
  if (!ownerEmail) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  res.locals.ownerEmail = ownerEmail
  next()
}

function getEmailFromJwt(token) {
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const payloadPart = parts[1]
  if (!payloadPart) return null

  try {
    const payloadText = Buffer.from(payloadPart, 'base64url').toString('utf8')
    const payload = JSON.parse(payloadText)
    if (!payload || typeof payload !== 'object') return null

    const maybeEmail = payload.email
    if (typeof maybeEmail === 'string' && maybeEmail.trim() !== '') {
      return maybeEmail.trim().toLowerCase()
    }

    const identityEmails = payload.firebase?.identities?.email
    if (Array.isArray(identityEmails)) {
      const first = identityEmails[0]
      if (typeof first === 'string' && first.trim() !== '') {
        return first.trim().toLowerCase()
      }
    }
  } catch {
    return null
  }

  return null
}

function getOwnerEmailFromToken(token) {
  const session = getSession(token)
  if (session) return session.email

  // Hackathon-only behavior: accept a Firebase ID token and derive the owner identity from its payload.
  // This does NOT validate the JWT signature; only enabled outside production.
  if (process.env.NODE_ENV !== 'production') {
    const emailFromJwt = getEmailFromJwt(token)
    if (emailFromJwt) {
      if (!hasWarnedAboutUnverifiedFirebaseTokens) {
        hasWarnedAboutUnverifiedFirebaseTokens = true
        console.warn(
          '[auth] Accepting Firebase ID tokens without signature verification (non-production only).'
        )
      }

      return emailFromJwt
    }
  }

  return null
}

function normalizeTitle(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function normalizeTaskStatus(value) {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()

  if (TASK_STATUSES.includes(normalized)) return normalized
  if (normalized === 'to do' || normalized === 'to-do') return 'todo'
  if (normalized === 'in progress' || normalized === 'in-progress') return 'in_progress'

  return null
}

function normalizeTaskPriority(value) {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  return TASK_PRIORITIES.includes(normalized) ? normalized : null
}

function normalizeAssigneeId(value) {
  // Contract:
  // - `undefined`/missing means "no value provided" (caller decides whether this implies "no change")
  // - empty string normalizes to `undefined` (used to clear assignment)
  // - non-string values are invalid (`null` return)
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

tasksRouter.get('/tasks', requireSession, async (req, res) => {
  const tasks = await listTasksForOwner({ ownerEmail: res.locals.ownerEmail })
  res.json({ ok: true, tasks })
})

tasksRouter.post('/tasks', requireSession, async (req, res) => {
  const title = normalizeTitle(req.body?.title)
  if (!title) {
    res.status(400).json({ error: "Missing 'title'" })
    return
  }

  const status =
    req.body?.status === undefined ? 'todo' : normalizeTaskStatus(req.body?.status)
  if (!status) {
    res.status(400).json({ error: "Invalid 'status'" })
    return
  }

  const priority =
    req.body?.priority === undefined ? 'medium' : normalizeTaskPriority(req.body?.priority)
  if (!priority) {
    res.status(400).json({ error: "Invalid 'priority'" })
    return
  }

  const assigneeInput = req.body?.assigneeId ?? req.body?.assignedTo
  const assigneeId = normalizeAssigneeId(assigneeInput)
  if (assigneeId === null) {
    res.status(400).json({ error: "Invalid 'assigneeId'" })
    return
  }

  const task = await createTaskForOwner({
    ownerEmail: res.locals.ownerEmail,
    title,
    status,
    priority,
    assigneeId,
  })

  res.status(201).json({ ok: true, task })
})

tasksRouter.put('/tasks/:id', requireSession, async (req, res) => {
  const id = typeof req.params.id === 'string' ? req.params.id.trim() : ''
  if (!id) {
    res.status(400).json({ error: "Missing 'id'" })
    return
  }

  const status = req.body?.status === undefined ? undefined : normalizeTaskStatus(req.body?.status)
  if (req.body?.status !== undefined && !status) {
    res.status(400).json({ error: "Invalid 'status'" })
    return
  }

  const priority = req.body?.priority === undefined ? undefined : normalizeTaskPriority(req.body?.priority)
  if (req.body?.priority !== undefined && !priority) {
    res.status(400).json({ error: "Invalid 'priority'" })
    return
  }

  const assigneeInput = req.body?.assigneeId ?? req.body?.assignedTo
  const assigneeId =
    assigneeInput === undefined ? undefined : normalizeAssigneeId(assigneeInput)
  if (assigneeId === null) {
    res.status(400).json({ error: "Invalid 'assigneeId'" })
    return
  }

  const patch = {}
  if (status !== undefined) patch.status = status
  if (priority !== undefined) patch.priority = priority

  // `assigneeId` supports clearing by sending an empty string (normalized to `undefined`).
  // We intentionally gate on the raw input so the client can clear the assignee.
  if (assigneeInput !== undefined) patch.assigneeId = assigneeId

  if (Object.keys(patch).length === 0) {
    res.status(400).json({ error: 'No updates provided' })
    return
  }

  const task = await updateTaskForOwner({
    ownerEmail: res.locals.ownerEmail,
    id,
    patch,
  })

  if (!task) {
    res.status(404).json({ error: 'Task not found' })
    return
  }

  res.json({ ok: true, task })
})
