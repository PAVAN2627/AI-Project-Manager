import { useMemo, useState } from 'react'

import type { Task, TaskPriority } from '../../types/task'
import { TASK_PRIORITY_LABEL } from '../../types/task'
import styles from './PrioritySelector.module.css'

type PrioritySelectorProps = {
  tasks: Task[]
  onUpdateTask: (task: Task) => void
}

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical']

export function PrioritySelector({ tasks, onUpdateTask }: PrioritySelectorProps) {
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?.id ?? '')

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks],
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
          value={selectedTaskId}
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
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {TASK_PRIORITY_LABEL[priority]}
            </option>
          ))}
        </select>
      </label>
    </section>
  )
}
