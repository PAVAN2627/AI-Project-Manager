import styles from './PromptBar.module.css'

type PromptBarProps = {
  value: string
  isBusy?: boolean
  onChange: (value: string) => void
  onSubmit: () => void | Promise<void>
}

export function PromptBar({ value, isBusy, onChange, onSubmit }: PromptBarProps) {
  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault()
        void onSubmit()
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
        {isBusy ? 'Planning…' : 'Generate UI'}
      </button>
    </form>
  )
}
