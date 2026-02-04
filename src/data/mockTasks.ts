import type { Task } from '../types/task'

export const mockTasks: Task[] = [
  {
    id: 't_1',
    title: 'Set up Vite + React baseline',
    status: 'done',
    priority: 'medium',
    assigneeId: 'u_4',
  },
  {
    id: 't_2',
    title: 'Draft KanbanBoard component',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'u_1',
  },
  {
    id: 't_3',
    title: 'Add PrioritySelector dropdown',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'u_2',
  },
  {
    id: 't_4',
    title: 'Investigate Tambo Generative UI SDK integration',
    status: 'blocked',
    priority: 'critical',
  },
  {
    id: 't_5',
    title: 'Create TeamAssignmentPanel',
    status: 'todo',
    priority: 'low',
    assigneeId: 'u_3',
  },
]
