import type { AuthSession } from './authSession'
import type { Task, TaskPriority, TaskStatus } from '../types/task'

const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'done']
const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical']

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false
  const maybe = value as {
    id?: unknown
    title?: unknown
    status?: unknown
    priority?: unknown
    assigneeId?: unknown
  }

  if (typeof maybe.id !== 'string' || maybe.id.trim() === '') return false
  if (typeof maybe.title !== 'string' || maybe.title.trim() === '') return false
  if (typeof maybe.status !== 'string' || !TASK_STATUSES.includes(maybe.status as TaskStatus)) return false
  if (typeof maybe.priority !== 'string' || !TASK_PRIORITIES.includes(maybe.priority as TaskPriority)) {
    return false
  }

  if (maybe.assigneeId !== undefined) {
    if (typeof maybe.assigneeId !== 'string') return false
    if (maybe.assigneeId.trim() === '') return false
  }

  return true
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

function getAuthHeaders(session: AuthSession) {
  return {
    authorization: `Bearer ${session.token}`,
  }
}

export async function getTasks(session: AuthSession): Promise<Task[]> {
  const response = await fetch('/api/tasks', {
    headers: {
      ...getAuthHeaders(session),
    },
  })

  const data = (await response.json().catch(() => null)) as unknown
  if (!response.ok) {
    throw new Error(getErrorMessage(data, `Request failed (${response.status})`))
  }

  const tasksValue = (data as { tasks?: unknown } | null)?.tasks
  if (!Array.isArray(tasksValue) || !tasksValue.every(isTask)) {
    throw new Error('Invalid tasks response')
  }

  return tasksValue
}

export async function createTask(
  session: AuthSession,
  body: {
    title: string
    status?: TaskStatus
    priority?: TaskPriority
    assigneeId?: string
  },
): Promise<Task> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...getAuthHeaders(session),
    },
    body: JSON.stringify(body),
  })

  const data = (await response.json().catch(() => null)) as unknown
  if (!response.ok) {
    throw new Error(getErrorMessage(data, `Request failed (${response.status})`))
  }

  const taskValue = (data as { task?: unknown } | null)?.task
  if (!isTask(taskValue)) {
    throw new Error('Invalid task response')
  }

  return taskValue
}

export async function updateTask(
  session: AuthSession,
  id: string,
  patch: {
    status?: TaskStatus
    priority?: TaskPriority
    assigneeId?: string | undefined
  },
): Promise<Task> {
  const response = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      ...getAuthHeaders(session),
    },
    body: JSON.stringify(patch),
  })

  const data = (await response.json().catch(() => null)) as unknown
  if (!response.ok) {
    throw new Error(getErrorMessage(data, `Request failed (${response.status})`))
  }

  const taskValue = (data as { task?: unknown } | null)?.task
  if (!isTask(taskValue)) {
    throw new Error('Invalid task response')
  }

  return taskValue
}
