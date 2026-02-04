import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

/**
* Minimal hackathon-only task store.
*
* - Persists to a local JSON file (`server/data/tasks.json`)
* - Tasks are scoped by the authenticated user's email
*/

const tasksFilePath = path.join(process.cwd(), 'server', 'data', 'tasks.json')

let writeLock = Promise.resolve()

function withWriteLock(fn) {
  const next = writeLock.then(fn, fn)
  // Keep the chain alive even if a write fails.
  writeLock = next.then(
    () => undefined,
    (error) => {
      console.error('Task store write failed:', error)
      return undefined
    },
  )
  return next
}

async function ensureTasksFile() {
  const dir = path.dirname(tasksFilePath)
  await fs.mkdir(dir, { recursive: true })

  try {
    await fs.access(tasksFilePath)
  } catch {
    await fs.writeFile(tasksFilePath, JSON.stringify([], null, 2) + '\n', 'utf8')
  }
}

async function readTasks() {
  await ensureTasksFile()
  const raw = await fs.readFile(tasksFilePath, 'utf8')

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    const backupPath = `${tasksFilePath}.${Date.now()}.bak`
    await fs.writeFile(backupPath, raw, 'utf8').catch(() => undefined)
    console.warn(
      `Failed to parse tasks JSON at ${tasksFilePath}; backed up to ${backupPath} and treating as empty list`,
    )
    return []
  }
}

async function writeTasks(tasks) {
  await ensureTasksFile()

  const dir = path.dirname(tasksFilePath)
  const tmpPath = path.join(dir, 'tasks.json.tmp')
  await fs.writeFile(tmpPath, JSON.stringify(tasks, null, 2) + '\n', 'utf8')
  await fs.rename(tmpPath, tasksFilePath)
}

function toPublicTask(stored) {
  const { ownerEmail: _ownerEmail, ...task } = stored
  return task
}

export async function listTasksForOwner({ ownerEmail }) {
  const tasks = await readTasks()
  return tasks.filter((t) => t.ownerEmail === ownerEmail).map(toPublicTask)
}

export async function createTaskForOwner({ ownerEmail, title, status, priority, assigneeId }) {
  return withWriteLock(async () => {
    const tasks = await readTasks()
    const now = new Date().toISOString()
    const task = {
      id: `t_${crypto.randomUUID()}`,
      title,
      status,
      priority,
      assigneeId,
      ownerEmail,
      createdAt: now,
      updatedAt: now,
    }

    tasks.push(task)
    await writeTasks(tasks)
    return toPublicTask(task)
  })
}

export async function updateTaskForOwner({ ownerEmail, id, patch }) {
  return withWriteLock(async () => {
    const tasks = await readTasks()
    const idx = tasks.findIndex((t) => t.id === id && t.ownerEmail === ownerEmail)
    if (idx === -1) return null

    const current = tasks[idx]
    const next = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    }

    tasks[idx] = next
    await writeTasks(tasks)
    return toPublicTask(next)
  })
}
