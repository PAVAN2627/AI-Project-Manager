import {
  addDoc,
  collection,
  deleteField,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'

import { firestore } from '../firebase/firebase'
import type { Task, TaskPriority, TaskStatus } from '../types/task'
import { TASK_PRIORITY_LABEL, TASK_STATUS_LABEL } from '../types/task'

type FirestoreTaskDoc = {
  title: string
  status: string
  priority: string
  assignedTo?: string
  createdAt?: unknown
}

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase()
}

const STATUS_BY_LABEL = new Map<string, TaskStatus>(
  Object.entries(TASK_STATUS_LABEL).map(([key, label]) => [normalizeLabel(label), key as TaskStatus]),
)

const PRIORITY_BY_LABEL = new Map<string, TaskPriority>(
  Object.entries(TASK_PRIORITY_LABEL).map(([key, label]) => [normalizeLabel(label), key as TaskPriority]),
)

const STATUS_LABELS = new Set<string>(Object.values(TASK_STATUS_LABEL).map(normalizeLabel))
const PRIORITY_LABELS = new Set<string>(Object.values(TASK_PRIORITY_LABEL).map(normalizeLabel))

function isFirestoreTaskDoc(value: unknown): value is FirestoreTaskDoc {
  if (!value || typeof value !== 'object') return false

  const maybe = value as {
    title?: unknown
    status?: unknown
    priority?: unknown
    assignedTo?: unknown
    createdAt?: unknown
  }

  if (typeof maybe.title !== 'string' || maybe.title.trim() === '') return false
  if (typeof maybe.status !== 'string' || !STATUS_LABELS.has(normalizeLabel(maybe.status))) return false
  if (typeof maybe.priority !== 'string' || !PRIORITY_LABELS.has(normalizeLabel(maybe.priority))) return false

  if (maybe.assignedTo !== undefined) {
    if (typeof maybe.assignedTo !== 'string') return false
    if (maybe.assignedTo.trim() === '') return false
  }

  void maybe.createdAt

  return true
}

function toTask(id: string, data: FirestoreTaskDoc): Task {
  const status = STATUS_BY_LABEL.get(normalizeLabel(data.status)) ?? 'todo'
  const priority = PRIORITY_BY_LABEL.get(normalizeLabel(data.priority)) ?? 'medium'
  const assigneeId = data.assignedTo?.trim().length ? data.assignedTo.trim() : undefined

  return {
    id,
    title: data.title,
    status,
    priority,
    assigneeId,
  }
}

function tasksCollection(userId: string) {
  return collection(firestore, 'users', userId, 'tasks')
}

export function subscribeTasks(
  userId: string,
  onChange: (tasks: Task[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const tasksQuery = query(tasksCollection(userId), orderBy('createdAt', 'desc'))

  return onSnapshot(
    tasksQuery,
    (snapshot) => {
      const tasks: Task[] = []
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data() as unknown
        if (!isFirestoreTaskDoc(data)) continue
        tasks.push(toTask(docSnap.id, data))
      }
      onChange(tasks)
    },
    (error) => {
      onError?.(error)
    },
  )
}

export async function getTasksOnce(userId: string): Promise<Task[]> {
  const tasksQuery = query(tasksCollection(userId), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(tasksQuery)
  const tasks: Task[] = []

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data() as unknown
    if (!isFirestoreTaskDoc(data)) continue
    tasks.push(toTask(docSnap.id, data))
  }

  return tasks
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

  const docRef = await addDoc(tasksCollection(userId), {
    title: body.title,
    status: TASK_STATUS_LABEL[status],
    priority: TASK_PRIORITY_LABEL[priority],
    assignedTo: body.assigneeId?.trim().length ? body.assigneeId : undefined,
    createdAt: serverTimestamp(),
  })

  return {
    id: docRef.id,
    title: body.title,
    status,
    priority,
    assigneeId: body.assigneeId?.trim().length ? body.assigneeId : undefined,
  }
}

export async function updateTask(
  userId: string,
  id: string,
  patch: {
    status?: TaskStatus
    priority?: TaskPriority
    assigneeId?: string | null
  },
): Promise<void> {
  const updates: Record<string, unknown> = {}

  if (patch.status) {
    updates.status = TASK_STATUS_LABEL[patch.status]
  }

  if (patch.priority) {
    updates.priority = TASK_PRIORITY_LABEL[patch.priority]
  }

  if (patch.assigneeId !== undefined) {
    if (patch.assigneeId === null) {
      updates.assignedTo = deleteField()
    } else if (patch.assigneeId.trim().length > 0) {
      updates.assignedTo = patch.assigneeId
    }
  }

  if (Object.keys(updates).length === 0) return

  await updateDoc(doc(tasksCollection(userId), id), updates)
}
