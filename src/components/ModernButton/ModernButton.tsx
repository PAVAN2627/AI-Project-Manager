import React from 'react'
import './ModernButton.css'

interface ModernButtonProps {
  variant?: 'gradient' | 'ghost' | 'glass' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function ModernButton({
  variant = 'gradient',
  size = 'md',
  icon,
  children,
  onClick,
  disabled = false,
  className = '',
  loading = false,
  type = 'button'
}: ModernButtonProps) {
  const baseClasses = `modern-btn modern-btn--${variant} modern-btn--${size}`
  const classes = `${baseClasses} ${className} ${disabled || loading ? 'modern-btn--disabled' : ''}`

  return (
    <button 
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="modern-btn__spinner" />
      ) : (
        <>
          {icon && <span className="modern-btn__icon">{icon}</span>}
          <span className="modern-btn__text">{children}</span>
        </>
      )}
    </button>
  )
}