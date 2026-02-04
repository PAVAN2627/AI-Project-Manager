import { Router } from 'express'

import { getSession } from '../services/sessionStore.js'
import { createTaskForOwner, listTasksForOwner, updateTaskForOwner } from '../services/taskStore.js'

export const tasksRouter = Router()

const TASK_STATUSES = ['todo', 'in_progress', 'blocked', 'done']
const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical']

function getSessionToken(req) {
  const authHeader = req.header('authorization')
  if (typeof authHeader === 'string') {
    const match = authHeader.match(/^Bearer\s+(.+)$/i)
    if (match?.[1]) return match[1].trim()
  }

  const tokenHeader = req.header('x-session-token')
  if (typeof tokenHeader === 'string' && tokenHeader.trim() !== '') {
    return tokenHeader.trim()
  }

  return null
}

function requireSession(req, res, next) {
  const token = getSessionToken(req)
  const session = token ? getSession(token) : null
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  req.session = session
  next()
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
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

tasksRouter.get('/tasks', requireSession, async (req, res) => {
  const tasks = await listTasksForOwner({ ownerEmail: req.session.email })
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
    res.status(400).json({ error: "Invalid 'assignedTo'" })
    return
  }

  const task = await createTaskForOwner({
    ownerEmail: req.session.email,
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
    res.status(400).json({ error: "Invalid 'assignedTo'" })
    return
  }

  const patch = {
    ...(status !== undefined ? { status } : null),
    ...(priority !== undefined ? { priority } : null),
    ...(assigneeInput !== undefined ? { assigneeId } : null),
  }

  if (Object.keys(patch).length === 0) {
    res.status(400).json({ error: 'No updates provided' })
    return
  }

  const task = await updateTaskForOwner({
    ownerEmail: req.session.email,
    id,
    patch,
  })

  if (!task) {
    res.status(404).json({ error: 'Task not found' })
    return
  }

  res.json({ ok: true, task })
})
