import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { KanbanBoard } from '../components/KanbanBoard/KanbanBoard'
import { PrioritySelector } from '../components/PrioritySelector/PrioritySelector'
import { PromptBar } from '../components/PromptBar/PromptBar'
import { TeamAssignmentPanel } from '../components/TeamAssignmentPanel/TeamAssignmentPanel'
import { mockTasks } from '../data/mockTasks'
import { mockUsers } from '../data/mockUsers'
import { getHackathonUser } from '../app/hackathonAuth'
import type { Task } from '../types/task'
import { useGenerativeUI } from '../tambo/useGenerativeUI'
import type { UIPlan } from '../tambo/types'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [prompt, setPrompt] = useState('')
  const user = useMemo(() => getHackathonUser(), [])

  const { plan, isPlanning, defaultPlan } = useGenerativeUI()
  const [activePlan, setActivePlan] = useState<UIPlan>(defaultPlan)
  const [hasGeneratedPlan, setHasGeneratedPlan] = useState(false)

  const visibleTasks = useMemo(() => {
    if (!activePlan.kanban.enabled) return tasks
    if (activePlan.kanban.filterStatus) {
      return tasks.filter((t) => t.status === activePlan.kanban.filterStatus)
    }
    return tasks
  }, [activePlan, tasks])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>AI Project Manager</h1>
          <p className={styles.subtitle}>Vite + React scaffold with a Tambo adapter boundary</p>
          {user ? (
            <p className={styles.userMeta}>
              Signed in as <strong>{user.name ?? user.email}</strong>
            </p>
          ) : null}
          <nav className={styles.nav}>
            <Link className={styles.navLink} to="/login">
              Login
            </Link>
            <Link className={styles.navLink} to="/register">
              Register
            </Link>
          </nav>
        </div>

        <PromptBar
          value={prompt}
          isBusy={isPlanning}
          onChange={setPrompt}
          onSubmit={async () => {
            const nextPlan = await plan(prompt)
            setActivePlan(nextPlan)
            setHasGeneratedPlan(true)
          }}
        />
      </header>

      <main className={styles.main}>
        {activePlan.kanban.enabled ? (
          <KanbanBoard tasks={visibleTasks} />
        ) : (
          <div className={styles.placeholder}>
            <p>
              Enter a prompt above (example: <code>Show me blocked tasks and assign priorities</code>) to
              simulate a Generative UI plan.
            </p>
          </div>
        )}

        <section className={styles.sidePanel}>
          {activePlan.prioritySelector.enabled ? (
            <PrioritySelector
              tasks={tasks}
              onUpdateTask={(updated) => {
                setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
              }}
            />
          ) : null}

          {activePlan.teamAssignment.enabled ? (
            <TeamAssignmentPanel
              tasks={tasks}
              users={mockUsers}
              onUpdateTask={(updated) => {
                setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
              }}
            />
          ) : null}

          {hasGeneratedPlan ? (
            <details className={styles.planDetails}>
              <summary>UI plan (mock Tambo)</summary>
              <pre className={styles.planJson}>{JSON.stringify(activePlan, null, 2)}</pre>
            </details>
          ) : null}
        </section>
      </main>
    </div>
  )
}
