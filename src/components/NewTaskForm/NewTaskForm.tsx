import { useState } from 'react'

import styles from './NewTaskForm.module.css'

type NewTaskFormProps = {
  isBusy: boolean
  error: string | null
  onCreateTask: (title: string) => void
}

export function NewTaskForm({ isBusy, error, onCreateTask }: NewTaskFormProps) {
  const [title, setTitle] = useState('')

  return (
    <section className={styles.panel} aria-label='New task form'>
      <header className={styles.header}>
        <h2 className={styles.title}>New task</h2>
        <p className={styles.subtitle}>Create a task for your board</p>
      </header>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault()
          const trimmed = title.trim()
          if (!trimmed) return
          onCreateTask(trimmed)
          setTitle('')
        }}
      >
        <label className={styles.label}>
          Title
          <input
            className={styles.input}
            value={title}
            placeholder='e.g. Review PR #6'
            disabled={isBusy}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <div className={styles.actions}>
          <button className={styles.button} type='submit' disabled={isBusy || title.trim().length === 0}>
            Add task
          </button>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}
      </form>
    </section>
  )
}
