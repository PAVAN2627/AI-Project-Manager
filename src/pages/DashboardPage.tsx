import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { KanbanBoard } from '../components/KanbanBoard/KanbanBoard'
import { NewTaskForm } from '../components/NewTaskForm/NewTaskForm'
import { PrioritySelector } from '../components/PrioritySelector/PrioritySelector'
import { PromptBar } from '../components/PromptBar/PromptBar'
import { TeamAssignmentPanel } from '../components/TeamAssignmentPanel/TeamAssignmentPanel'
import { mockUsers } from '../data/mockUsers'
import { clearAuthSession, getAuthSession } from '../app/authSession'
import { createTask, getTasks, updateTask } from '../app/taskApi'
import { DEFAULT_INTENT } from '../app/intentApi'
import type { IntentFilterStatus, IntentInterpretation } from '../app/intentApi'
import { interpretIntent } from '../app/intentApi'
import type { Task } from '../types/task'
import styles from './DashboardPage.module.css'

function toKanbanFilterStatus(status: IntentFilterStatus): Task['status'] | undefined {
  switch (status) {
    case 'All':
      return undefined
    case 'Blocked':
      return 'blocked'
    case 'Done':
      return 'done'
    default: {
      const exhaustive: never = status
      console.warn('Unhandled intent filterStatus value:', exhaustive)
      return undefined
    }
  }
}

export function DashboardPage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskError, setTaskError] = useState<string | null>(null)
  const [isTasksBusy, setIsTasksBusy] = useState(false)
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [prompt, setPrompt] = useState('')
  const session = useMemo(() => getAuthSession(), [])

  const [isIntentBusy, setIsIntentBusy] = useState(false)
  const [intentError, setIntentError] = useState<string | null>(null)
  const [intent, setIntent] = useState<IntentInterpretation | null>(null)
  const [hasAttemptedIntent, setHasAttemptedIntent] = useState(false)

  const effectiveIntent = intent ?? DEFAULT_INTENT

  const visibleTasks = useMemo(() => {
    if (!effectiveIntent.showKanban) return tasks
    const filterStatus = toKanbanFilterStatus(effectiveIntent.filterStatus)
    if (filterStatus) {
      return tasks.filter((t) => t.status === filterStatus)
    }
    return tasks
  }, [effectiveIntent.filterStatus, effectiveIntent.showKanban, tasks])

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
          isBusy={isIntentBusy}
          onChange={setPrompt}
          onSubmit={async (rawInput) => {
            if (!rawInput) return
            setIsIntentBusy(true)
            setIntentError(null)
            try {
              const nextIntent = await interpretIntent(rawInput)
              setIntent(nextIntent)
            } catch (error) {
              setIntentError(error instanceof Error ? error.message : 'Failed to interpret intent')
            } finally {
              setHasAttemptedIntent(true)
              setIsIntentBusy(false)
            }
          }}
        />
      </header>

      <main className={styles.main}>
        {isLoadingTasks ? (
          <div className={styles.placeholder}>
            <p>Loading tasks…</p>
          </div>
        ) : effectiveIntent.showKanban ? (
          <KanbanBoard tasks={visibleTasks} users={mockUsers} onUpdateTask={handleUpdateTask} />
        ) : (
          <div className={styles.placeholder}>
            <p>
              Enter a prompt above (example: <code>Show me blocked tasks and assign priorities</code>) and
              click <strong>Generate Interface</strong>.
            </p>
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

          {effectiveIntent.showPrioritySelector ? (
            <PrioritySelector tasks={tasks} onUpdateTask={handleUpdateTask} />
          ) : null}

          {effectiveIntent.showTeamAssignment ? (
            <TeamAssignmentPanel
              tasks={tasks}
              users={mockUsers}
              onUpdateTask={handleUpdateTask}
            />
          ) : null}

          {hasAttemptedIntent ? (
            <section className={styles.planPanel} aria-label='AI UI Decision Plan'>
              <header className={styles.planHeader}>
                <h2 className={styles.planTitle}>AI UI Decision Plan</h2>
                <p className={styles.planSubtitle}>
                  Response from <code>/api/interpret-intent</code>
                </p>
              </header>

              {intentError ? (
                <p className={styles.planError}>{intentError}</p>
              ) : null}

              {intentError && intent ? <p className={styles.planHint}>Showing the last successful plan:</p> : null}

              {intent ? (
                <pre className={styles.planJson}>{JSON.stringify(intent, null, 2)}</pre>
              ) : (
                <p className={styles.planHint}>No successful plan yet.</p>
              )}
            </section>
          ) : null}
        </section>
      </main>
    </div>
  )
}
