import {
  addDoc,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'

import { firestore } from '../firebase/firebase'
import type { Task, TaskPriority, TaskStatus } from '../types/task'

type FirestoreTask = {
  title: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo?: string
  createdAt?: number
}

const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'done']
const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical']

function isFirestoreTask(value: unknown): value is FirestoreTask {
  if (!value || typeof value !== 'object') return false

  const maybe = value as {
    title?: unknown
    status?: unknown
    priority?: unknown
    assignedTo?: unknown
    createdAt?: unknown
  }

  if (typeof maybe.title !== 'string' || maybe.title.trim() === '') return false
  if (typeof maybe.status !== 'string' || !TASK_STATUSES.includes(maybe.status as TaskStatus)) return false
  if (typeof maybe.priority !== 'string' || !TASK_PRIORITIES.includes(maybe.priority as TaskPriority)) {
    return false
  }
  if (maybe.createdAt !== undefined) {
    if (typeof maybe.createdAt !== 'number' || !Number.isFinite(maybe.createdAt)) return false
  }

  if (maybe.assignedTo !== undefined) {
    if (typeof maybe.assignedTo !== 'string') return false
    if (maybe.assignedTo.trim() === '') return false
  }

  return true
}

function toTask(id: string, data: FirestoreTask): Task {
  return {
    id,
    title: data.title,
    status: data.status,
    priority: data.priority,
    assigneeId: data.assignedTo,
  }
}

function getTasksCollection(userId: string) {
  return collection(firestore, 'users', userId, 'tasks')
}

export async function getTasks(userId: string): Promise<Task[]> {
  const tasksSnapshot = await getDocs(query(getTasksCollection(userId), orderBy('createdAt', 'desc')))

  return tasksSnapshot.docs.map((snap) => {
    const data = snap.data() as unknown
    if (!isFirestoreTask(data)) {
      throw new Error('Invalid task document')
    }

    return toTask(snap.id, data)
  })
}

export async function createTask(
  userId: string,
  body: {
    title: string
    status?: TaskStatus
    priority?: TaskPriority
    assigneeId?: string
  },
): Promise<Task> {
  const status: TaskStatus = body.status ?? 'todo'
  const priority: TaskPriority = body.priority ?? 'medium'

  const taskData: FirestoreTask = {
    title: body.title,
    status,
    priority,
    createdAt: Date.now(),
    ...(body.assigneeId ? { assignedTo: body.assigneeId } : {}),
  }

  const docRef = await addDoc(getTasksCollection(userId), taskData)

  return {
    id: docRef.id,
    title: body.title,
    status,
    priority,
    assigneeId: body.assigneeId,
  }
}

export async function updateTask(
  userId: string,
  id: string,
  patch: {
    status?: TaskStatus
    priority?: TaskPriority
    assigneeId?: string | undefined
  },
): Promise<Task> {
  const taskRef = doc(firestore, 'users', userId, 'tasks', id)

  const firestorePatch: Record<string, unknown> = {}

  if (patch.status) {
    firestorePatch.status = patch.status
  }

  if (patch.priority) {
    firestorePatch.priority = patch.priority
  }

  if (patch.assigneeId !== undefined) {
    const trimmed = patch.assigneeId.trim()
    firestorePatch.assignedTo = trimmed.length > 0 ? trimmed : deleteField()
  }

  if (Object.keys(firestorePatch).length === 0) {
    const existing = await getDoc(taskRef)
    const existingData = existing.data() as unknown
    if (!existing.exists() || !isFirestoreTask(existingData)) {
      throw new Error('Task not found')
    }
    return toTask(existing.id, existingData)
  }

  await updateDoc(taskRef, firestorePatch)

  const updated = await getDoc(taskRef)
  const updatedData = updated.data() as unknown

  if (!updated.exists() || !isFirestoreTask(updatedData)) {
    throw new Error('Task not found')
  }

  return toTask(updated.id, updatedData)
}
