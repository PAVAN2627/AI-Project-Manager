import type { Task } from '../../types/task'
import { TASK_PRIORITY_LABEL, TASK_STATUS_LABEL, TASK_STATUS_ORDER } from '../../types/task'
import styles from './KanbanBoard.module.css'

type KanbanBoardProps = {
  tasks: Task[]
}

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  return (
    <section className={styles.board} aria-label='Kanban board'>
      {TASK_STATUS_ORDER.map((status) => {
        const columnTasks = tasks.filter((t) => t.status === status)

        return (
          <div key={status} className={styles.column}>
            <header className={styles.columnHeader}>
              <h2 className={styles.columnTitle}>{TASK_STATUS_LABEL[status]}</h2>
              <span className={styles.count}>{columnTasks.length}</span>
            </header>

            <div className={styles.cards}>
              {columnTasks.map((task) => (
                <article key={task.id} className={styles.card}>
                  <div className={styles.cardTitle}>{task.title}</div>
                  <div className={styles.cardMeta}>
                    <span className={styles.badge}>{TASK_PRIORITY_LABEL[task.priority]}</span>
                    {task.assigneeId ? <span className={styles.badge}>@{task.assigneeId}</span> : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}
