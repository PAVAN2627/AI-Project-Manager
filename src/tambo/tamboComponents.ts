import type { TamboComponent } from '@tambo-ai/react'
import { z } from 'zod'

import { KanbanBoard } from '../components/KanbanBoard/KanbanBoard'
import { PrioritySelector } from '../components/PrioritySelector/PrioritySelector'
import { TeamAssignmentPanel } from '../components/TeamAssignmentPanel/TeamAssignmentPanel'
import { NewTaskForm } from '../components/NewTaskForm/NewTaskForm'
import { TeamCreation } from '../components/TeamCreation/TeamCreation'
import { Analytics } from '../components/Analytics/Analytics'
import { IntentHistory } from '../components/IntentHistory/IntentHistory'

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['todo', 'in_progress', 'blocked', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  assigneeId: z.string().optional(),
})

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
})

const TeamMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string().optional(),
})

const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  members: z.array(TeamMemberSchema),
})

const IntentSchema = z.object({
  showKanban: z.boolean(),
  showPrioritySelector: z.boolean(),
  showTeamAssignment: z.boolean(),
  filterStatus: z.enum(['All', 'Todo', 'In Progress', 'Blocked', 'Done']),
})

const KanbanBoardPropsSchema = z.object({
  tasks: z.array(TaskSchema),
  users: z.array(UserSchema),
})

const PrioritySelectorPropsSchema = z.object({
  tasks: z.array(TaskSchema),
})

const TeamAssignmentPropsSchema = z.object({
  tasks: z.array(TaskSchema),
  teams: z.array(TeamSchema),
})

const NewTaskFormPropsSchema = z.object({
  isBusy: z.boolean().optional(),
  error: z.string().nullable().optional(),
})

const TeamCreationPropsSchema = z.object({
  existingTeams: z.array(TeamSchema).optional(),
})

const AnalyticsPropsSchema = z.object({
  tasks: z.array(TaskSchema),
  users: z.array(UserSchema),
  teams: z.array(TeamSchema),
})

const IntentHistoryPropsSchema = z.object({
  currentIntent: IntentSchema.nullable().optional(),
})

export const tamboComponents: TamboComponent[] = [
  {
    name: 'KanbanBoard',
    description:
      'A kanban board that displays tasks in columns: Todo, In Progress, Blocked, and Done. Essential for project visualization and task tracking. Use when users want to see all tasks, view project status, or manage workflow.',
    component: KanbanBoard,
    propsSchema: KanbanBoardPropsSchema,
  },
  {
    name: 'PrioritySelector',
    description:
      'A component for setting and managing task priorities (low, medium, high, critical). Use when users want to prioritize tasks, focus on urgent work, or organize by importance.',
    component: PrioritySelector,
    propsSchema: PrioritySelectorPropsSchema,
  },
  {
    name: 'TeamAssignmentPanel',
    description:
      'A panel for assigning tasks to team members and managing workload distribution. Use when users want to delegate work, assign tasks to specific people, manage team workload, or see task ownership.',
    component: TeamAssignmentPanel,
    propsSchema: TeamAssignmentPropsSchema,
  },
  {
    name: 'NewTaskForm',
    description:
      'A form for creating new tasks and adding work items to the project. Always useful for expanding the project scope and adding new work.',
    component: NewTaskForm,
    propsSchema: NewTaskFormPropsSchema,
  },
  {
    name: 'TeamCreation',
    description:
      'A comprehensive team management interface for creating teams, adding members, editing team details, and managing team structure. Use when users want to create teams, manage team members, or organize their workforce.',
    component: TeamCreation,
    propsSchema: TeamCreationPropsSchema,
  },
  {
    name: 'Analytics',
    description:
      'A dashboard showing project analytics, progress metrics, team performance, and completion statistics. Use when users want to see progress, analyze performance, view reports, or understand project metrics.',
    component: Analytics,
    propsSchema: AnalyticsPropsSchema,
  },
  {
    name: 'IntentHistory',
    description:
      'A history of previous AI interface generations and user intents. Shows past prompts and allows users to reapply previous configurations. Use when users want to see their history or reuse previous setups.',
    component: IntentHistory,
    propsSchema: IntentHistoryPropsSchema,
  },
]
