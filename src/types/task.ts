export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done'

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Task {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId?: string
}

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  done: 'Done',
}

export const TASK_STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'done']

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export const TASK_PRIORITY_ORDER: TaskPriority[] = ['low', 'medium', 'high', 'critical']
