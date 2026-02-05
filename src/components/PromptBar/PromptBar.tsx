import { useState, useEffect } from 'react'
import styles from './PromptBar.module.css'

type PromptBarProps = {
  value: string
  isBusy?: boolean
  onChange: (value: string) => void
  onSubmit: (value: string) => void | Promise<void>
}

export function PromptBar({ value, isBusy, onChange, onSubmit }: PromptBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  
  useEffect(() => {
    if (value.length > 0) {
      setIsTyping(true)
      const timeout = setTimeout(() => setIsTyping(false), 1000)
      return () => clearTimeout(timeout)
    }
  }, [value])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isBusy && value.trim().length > 0) {
      await onSubmit(value)
    }
  }
  
  return (
    <form
      className={`${styles.form} ${isFocused ? styles.formFocused : ''} ${isTyping ? styles.formTyping : ''}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.inputWrapper}>
        <input
          className={styles.input}
          value={value}
          placeholder='Describe your ideal project interface...'
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label='AI Interface Prompt'
          disabled={isBusy}
        />
        <div className={styles.inputGlow}></div>
      </div>
      
      <button 
        className={`${styles.button} ${isBusy ? styles.buttonBusy : ''}`} 
        type='submit' 
        disabled={isBusy || value.trim().length === 0}
      >
        {isBusy ? (
          <>
            <span className={styles.spinner}></span>
            Generating...
          </>
        ) : (
          <>
            <span className={styles.buttonIcon}>✨</span>
            Transform
          </>
        )}
        <div className={styles.buttonGlow}></div>
      </button>
    </form>
  )
}
