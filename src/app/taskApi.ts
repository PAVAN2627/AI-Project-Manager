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

  if (maybe.createdAt !== undefined && maybe.createdAt !== null && !(maybe.createdAt instanceof Timestamp)) {
    return false
  }

  return true
}

function toTask(id: string, data: FirestoreTaskDoc): Task {
  const normalizedStatus = normalizeLabel(data.status)
  const normalizedPriority = normalizeLabel(data.priority)

  const status = STATUS_BY_LABEL.get(normalizedStatus)
  const priority = PRIORITY_BY_LABEL.get(normalizedPriority)

  if (!status) {
    console.warn(`[firestore] Unknown task status label (${id}): ${data.status}`)
  }

  if (!priority) {
    console.warn(`[firestore] Unknown task priority label (${id}): ${data.priority}`)
  }

  const assigneeId = data.assignedTo?.trim().length ? data.assignedTo.trim() : undefined

  return {
    id,
    title: data.title,
    status: status ?? 'todo',
    priority: priority ?? 'medium',
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
    tasks.push(toTask(docSnap.id, data))
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
    const normalizedAssignee = patch.assigneeId === null ? null : patch.assigneeId.trim()
    if (normalizedAssignee === null || normalizedAssignee.length === 0) {
      updates.assignedTo = deleteField()
    } else {
      updates.assignedTo = normalizedAssignee
    }
  }

  if (Object.keys(updates).length === 0) return

  await updateDoc(doc(tasksCollection(userId), id), updates)
}
