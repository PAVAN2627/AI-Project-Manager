import styles from './PromptBar.module.css'

type PromptBarProps = {
  value: string
  isBusy?: boolean
  onChange: (value: string) => void
  onSubmit: (value: string) => void | Promise<void>
}

export function PromptBar({ value, isBusy, onChange, onSubmit }: PromptBarProps) {
  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault()
        const trimmed = value.trim()
        if (!trimmed) return
        void onSubmit(trimmed)
      }}
    >
      <input
        className={styles.input}
        value={value}
        placeholder='Try: "Show me blocked tasks and assign priorities"'
        onChange={(e) => onChange(e.target.value)}
        aria-label='Prompt'
      />
      <button className={styles.button} type='submit' disabled={isBusy || value.trim().length === 0}>
        {isBusy ? 'Generating…' : 'Generate Interface'}
      </button>
    </form>
  )
}
