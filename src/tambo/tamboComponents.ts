import type { TamboComponent } from '@tambo-ai/react'
import { z } from 'zod'

import { KanbanBoard } from '../components/KanbanBoard/KanbanBoard'

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['todo', 'in_progress', 'blocked', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  assigneeId: z.string().optional(),
})

const KanbanBoardPropsSchema = z.object({
  tasks: z.array(TaskSchema),
})

export const tamboComponents: TamboComponent[] = [
  {
    name: 'KanbanBoard',
    description:
      'A kanban board that displays tasks in Todo, In Progress, Blocked, and Done columns.',
    component: KanbanBoard,
    propsSchema: KanbanBoardPropsSchema,
  },
]
