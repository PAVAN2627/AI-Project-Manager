import { useMemo, useState } from 'react'

import type { Task } from '../../types/task'
import type { User } from '../../types/user'
import styles from './TeamAssignmentPanel.module.css'

type TeamAssignmentPanelProps = {
  tasks: Task[]
  users: User[]
  onUpdateTask: (task: Task) => void
}

export function TeamAssignmentPanel({ tasks, users, onUpdateTask }: TeamAssignmentPanelProps) {
  const [selectedTaskId, setSelectedTaskId] = useState('')

  const effectiveSelectedTaskId =
    selectedTaskId && tasks.some((t) => t.id === selectedTaskId) ? selectedTaskId : (tasks[0]?.id ?? '')

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === effectiveSelectedTaskId) ?? null,
    [effectiveSelectedTaskId, tasks],
  )

  if (tasks.length === 0) return null

  return (
    <section className={styles.panel} aria-label='Team assignment panel'>
      <header className={styles.header}>
        <h2 className={styles.title}>Assignment</h2>
        <p className={styles.subtitle}>Assign a task to a teammate</p>
      </header>

      <label className={styles.label}>
        Task
        <select
          className={styles.select}
          value={effectiveSelectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
        >
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.label}>
        Assignee
        <select
          className={styles.select}
          value={selectedTask?.assigneeId ?? ''}
          onChange={(e) => {
            if (!selectedTask) return
            const assigneeId = e.target.value.trim().length === 0 ? undefined : e.target.value
            onUpdateTask({ ...selectedTask, assigneeId })
          }}
        >
          <option value=''>Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}{user.role ? ` (${user.role})` : ''}
            </option>
          ))}
        </select>
      </label>
    </section>
  )
}
