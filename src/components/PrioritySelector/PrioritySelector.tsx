import { useMemo, useState } from 'react'

import type { Task, TaskPriority } from '../../types/task'
import { TASK_PRIORITY_LABEL, TASK_PRIORITY_ORDER } from '../../types/task'
import styles from './PrioritySelector.module.css'

type PrioritySelectorProps = {
  tasks: Task[]
  onUpdateTask: (task: Task) => void
}

export function PrioritySelector({ tasks, onUpdateTask }: PrioritySelectorProps) {
  const [selectedTaskId, setSelectedTaskId] = useState('')

  const effectiveSelectedTaskId =
    selectedTaskId && tasks.some((t) => t.id === selectedTaskId) ? selectedTaskId : (tasks[0]?.id ?? '')

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === effectiveSelectedTaskId) ?? null,
    [effectiveSelectedTaskId, tasks],
  )

  if (tasks.length === 0) return null

  return (
    <section className={styles.panel} aria-label='Priority selector'>
      <header className={styles.header}>
        <h2 className={styles.title}>Priority</h2>
        <p className={styles.subtitle}>Assign a priority to a task</p>
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
        Priority
        <select
          className={styles.select}
          value={selectedTask?.priority ?? 'medium'}
          onChange={(e) => {
            if (!selectedTask) return
            onUpdateTask({ ...selectedTask, priority: e.target.value as TaskPriority })
          }}
        >
          {TASK_PRIORITY_ORDER.map((priority) => (
            <option key={priority} value={priority}>
              {TASK_PRIORITY_LABEL[priority]}
            </option>
          ))}
        </select>
      </label>
    </section>
  )
}
