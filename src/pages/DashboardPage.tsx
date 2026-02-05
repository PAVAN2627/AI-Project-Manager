import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { KanbanBoard } from '../components/KanbanBoard/KanbanBoard'
import { NewTaskForm } from '../components/NewTaskForm/NewTaskForm'
import { PrioritySelector } from '../components/PrioritySelector/PrioritySelector'
import { PromptBar } from '../components/PromptBar/PromptBar'
import { TeamAssignmentPanel } from '../components/TeamAssignmentPanel/TeamAssignmentPanel'
import { mockUsers } from '../data/mockUsers'
import { clearAuthSession, getAuthSession } from '../app/authSession'
import type { IntentFilterStatus, IntentInterpretation } from '../app/intentApi'
import { interpretIntent } from '../app/intentApi'
import { createTask, getTasks, updateTask } from '../app/taskApi'
import type { Task } from '../types/task'
import type { UIPlan } from '../tambo/types'
import styles from './DashboardPage.module.css'

const DEFAULT_PLAN: UIPlan = {
  kanban: { enabled: true },
  prioritySelector: { enabled: false },
  teamAssignment: { enabled: false },
}

function toKanbanFilterStatus(status: IntentFilterStatus): UIPlan['kanban']['filterStatus'] {
  switch (status) {
    case 'All':
      return undefined
    case 'Blocked':
      return 'blocked'
    case 'Done':
      return 'done'
    default: {
      const exhaustive: never = status
      return exhaustive
    }
  }
}

function toUIPlan(intent: IntentInterpretation): UIPlan {
  const filterStatus = toKanbanFilterStatus(intent.filterStatus)

  return {
    kanban: {
      enabled: intent.showKanban,
      ...(filterStatus ? { filterStatus } : {}),
    },
    prioritySelector: { enabled: intent.showPrioritySelector },
    teamAssignment: { enabled: intent.showTeamAssignment },
  }
}

export function DashboardPage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskError, setTaskError] = useState<string | null>(null)
  const [isTasksBusy, setIsTasksBusy] = useState(false)
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [intent, setIntent] = useState<IntentInterpretation | null>(null)
  const [intentError, setIntentError] = useState<string | null>(null)
  const [isInterpretingIntent, setIsInterpretingIntent] = useState(false)
  const session = useMemo(() => getAuthSession(), [])

  const [activePlan, setActivePlan] = useState<UIPlan>(DEFAULT_PLAN)
  const [hasAttemptedIntent, setHasAttemptedIntent] = useState(false)

  const visibleTasks = useMemo(() => {
    if (!activePlan.kanban.enabled) return tasks
    if (activePlan.kanban.filterStatus) {
      return tasks.filter((t) => t.status === activePlan.kanban.filterStatus)
    }
    return tasks
  }, [activePlan, tasks])

  useEffect(() => {
    if (!session) return
    let cancelled = false

    void getTasks(session)
      .then((next) => {
        if (cancelled) return
        setTasks(next)
      })
      .catch((error) => {
        if (cancelled) return
        setTaskError(error instanceof Error ? error.message : 'Failed to load tasks')
      })
      .finally(() => {
        if (cancelled) return
        setIsLoadingTasks(false)
      })

    return () => {
      cancelled = true
    }
  }, [session])

  function handleCreateTask(title: string) {
    if (!session) return

    setIsTasksBusy(true)
    setTaskError(null)
    void createTask(session, { title })
      .then((task) => {
        setTasks((prev) => [task, ...prev])
      })
      .catch((error) => {
        setTaskError(error instanceof Error ? error.message : 'Failed to create task')
      })
      .finally(() => {
        setIsTasksBusy(false)
      })
  }

  function handleUpdateTask(nextTask: Task) {
    if (!session) return

    const previousTask = tasks.find((t) => t.id === nextTask.id) ?? null

    const localPatch: Partial<Task> = {}
    const apiPatch: { status?: Task['status']; priority?: Task['priority']; assigneeId?: string } = {}

    if (!previousTask || previousTask.status !== nextTask.status) {
      localPatch.status = nextTask.status
      apiPatch.status = nextTask.status
    }

    if (!previousTask || previousTask.priority !== nextTask.priority) {
      localPatch.priority = nextTask.priority
      apiPatch.priority = nextTask.priority
    }

    if (!previousTask || previousTask.assigneeId !== nextTask.assigneeId) {
      localPatch.assigneeId = nextTask.assigneeId
      apiPatch.assigneeId = nextTask.assigneeId ?? ''
    }

    if (Object.keys(apiPatch).length === 0) return

    setTaskError(null)
    setTasks((prev) => prev.map((t) => (t.id === nextTask.id ? { ...t, ...localPatch } : t)))

    setIsTasksBusy(true)
    void updateTask(session, nextTask.id, apiPatch)
      .then((saved) => {
        setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)))
      })
      .catch((error) => {
        setTaskError(error instanceof Error ? error.message : 'Failed to update task')
        if (previousTask) {
          setTasks((prev) => prev.map((t) => (t.id === previousTask.id ? previousTask : t)))
        }
      })
      .finally(() => {
        setIsTasksBusy(false)
      })
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>AI Project Manager</h1>
          <p className={styles.subtitle}>Vite + React scaffold with a Tambo adapter boundary</p>
          {session ? (
            <p className={styles.userMeta}>
              Signed in as <strong>{session.email}</strong>
            </p>
          ) : null}
          <nav className={styles.nav}>
            <button
              className={styles.navButton}
              type="button"
              onClick={() => {
                clearAuthSession()
                navigate('/login')
              }}
            >
              Logout
            </button>
          </nav>
        </div>

        <PromptBar
          value={prompt}
          isBusy={isInterpretingIntent}
          onChange={setPrompt}
          onSubmit={async () => {
            const trimmed = prompt.trim()
            if (!trimmed) return

            setIntentError(null)
            setHasAttemptedIntent(true)
            setIsInterpretingIntent(true)
            try {
              const nextIntent = await interpretIntent(trimmed)
              setIntent(nextIntent)
              setActivePlan(toUIPlan(nextIntent))
            } catch (error) {
              setIntentError(error instanceof Error ? error.message : 'Failed to interpret intent')
            } finally {
              setIsInterpretingIntent(false)
            }
          }}
        />
      </header>

      <main className={styles.main}>
        {isLoadingTasks ? (
          <div className={styles.placeholder}>
            <p>Loading tasks…</p>
          </div>
        ) : activePlan.kanban.enabled ? (
          <KanbanBoard tasks={visibleTasks} users={mockUsers} onUpdateTask={handleUpdateTask} />
        ) : (
          <div className={styles.placeholder}>
            {intentError ? (
              <p>{intentError}</p>
            ) : hasAttemptedIntent ? (
              <p>Kanban board is hidden based on the AI decision plan.</p>
            ) : (
              <p>
                Enter a prompt above (example: <code>Show me blocked tasks and assign priorities</code>) to
                generate a UI plan.
              </p>
            )}
          </div>
        )}

        <section className={styles.sidePanel}>
          <NewTaskForm
            isBusy={isTasksBusy || isLoadingTasks}
            error={taskError}
            onCreateTask={(title) => {
              handleCreateTask(title)
            }}
          />

          {activePlan.prioritySelector.enabled ? (
            <PrioritySelector
              tasks={tasks}
              onUpdateTask={handleUpdateTask}
            />
          ) : null}

          {activePlan.teamAssignment.enabled ? (
            <TeamAssignmentPanel
              tasks={tasks}
              users={mockUsers}
              onUpdateTask={handleUpdateTask}
            />
          ) : null}

          {hasAttemptedIntent ? (
            <details className={styles.planDetails} open>
              <summary>AI UI Decision Plan</summary>
              <pre className={styles.planJson}>
                {intentError ? `Error: ${intentError}\n\n` : ''}
                {intent ? JSON.stringify(intent, null, 2) : 'No plan generated yet.'}
              </pre>
            </details>
          ) : null}
        </section>
      </main>
    </div>
  )
}
