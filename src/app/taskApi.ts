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
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'

import { firestore } from '../firebase/firebase'
import type { Task, TaskPriority, TaskStatus } from '../types/task'
import { TASK_PRIORITY_LABEL, TASK_STATUS_LABEL } from '../types/task'

type FirestoreTaskDoc = {
  title: string
  status: string
  priority: string
  assignedTo?: string
  createdAt?: Timestamp | null
}

const STATUS_BY_LABEL = new Map<string, TaskStatus>(
  Object.entries(TASK_STATUS_LABEL).map(([key, label]) => [label, key as TaskStatus]),
)

const PRIORITY_BY_LABEL = new Map<string, TaskPriority>(
  Object.entries(TASK_PRIORITY_LABEL).map(([key, label]) => [label, key as TaskPriority]),
)

const STATUS_LABELS = new Set<string>(Object.values(TASK_STATUS_LABEL))
const PRIORITY_LABELS = new Set<string>(Object.values(TASK_PRIORITY_LABEL))

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
  if (typeof maybe.status !== 'string' || !STATUS_LABELS.has(maybe.status)) return false
  if (typeof maybe.priority !== 'string' || !PRIORITY_LABELS.has(maybe.priority)) return false

  if (maybe.assignedTo !== undefined) {
    if (typeof maybe.assignedTo !== 'string') return false
    if (maybe.assignedTo.trim() === '') return false
  }

  if (maybe.createdAt !== undefined && maybe.createdAt !== null && !(maybe.createdAt instanceof Timestamp)) {
    return false
  }

  return true
}

function toTask(id: string, data: FirestoreTaskDoc): Task | null {
  const status = STATUS_BY_LABEL.get(data.status)
  const priority = PRIORITY_BY_LABEL.get(data.priority)

  if (!status || !priority) {
    console.error('[firestore] Invalid task state', {
      id,
      status: data.status,
      priority: data.priority,
    })
    return null
  }

  const assigneeId = data.assignedTo?.trim().length ? data.assignedTo.trim() : undefined

  return {
    id,
    title: data.title,
    status,
    priority,
    assigneeId,
  }
}

function mapDocsToTasks(docs: QueryDocumentSnapshot<DocumentData>[]): Task[] {
  const tasks: Task[] = []

  for (const docSnap of docs) {
    const data = docSnap.data() as unknown
    if (!isFirestoreTaskDoc(data)) {
      console.warn(`[firestore] Invalid task document shape: ${docSnap.id}`)
      continue
    }
    const task = toTask(docSnap.id, data)
    if (task) {
      tasks.push(task)
    }
  }

  return tasks
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
      onChange(mapDocsToTasks(snapshot.docs))
    },
    (error) => {
      onError?.(error)
    },
  )
}

export async function getTasksOnce(userId: string): Promise<Task[]> {
  const tasksQuery = query(tasksCollection(userId), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(tasksQuery)

  return mapDocsToTasks(snapshot.docs)
}

export async function createTask(
  userId: string,
  body: {
    title: string
    status?: TaskStatus
    priority?: TaskPriority
    assigneeId?: string
  },
): Promise<void> {
  const status: TaskStatus = body.status ?? 'todo'
  const priority: TaskPriority = body.priority ?? 'medium'

  await addDoc(tasksCollection(userId), {
    title: body.title,
    status: TASK_STATUS_LABEL[status],
    priority: TASK_PRIORITY_LABEL[priority],
    assignedTo: body.assigneeId?.trim().length ? body.assigneeId : undefined,
    createdAt: serverTimestamp(),
  })
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
    const trimmed = patch.assigneeId?.trim() ?? ''
    updates.assignedTo = trimmed.length === 0 ? deleteField() : trimmed
  }

  if (Object.keys(updates).length === 0) return

  await updateDoc(doc(tasksCollection(userId), id), updates)
}
