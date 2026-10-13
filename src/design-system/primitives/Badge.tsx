import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'neutral'
    | 'iris'
    | 'lavender'
    | 'champion'
    | 'success'
    | 'warning'
    | 'danger'
    | 'promoted'
    | 'filling'
    | 'free'
    | 'online'
    | 'outline'
  size?: 'sm' | 'md'
  icon?: React.ReactNode
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-surface-subtle text-ink font-medium',
    neutral: 'bg-surface-subtle text-ink font-medium',
    iris: 'bg-primary/10 text-primary font-medium',
    lavender: 'bg-accent/10 text-accent font-medium',
    champion: 'bg-accent text-white font-medium',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400 font-medium',
    promoted: 'bg-accent/10 text-accent font-medium',
    filling: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium',
    free: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium',
    online: 'bg-accent/10 text-accent font-medium',
    outline: 'bg-transparent text-ink-soft border border-line',
  }[variant]

  const sizeClasses = {
    sm: 'h-5 px-2 text-[11px]',
    md: 'h-6 px-2.5 text-xs',
  }[size]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full select-none whitespace-nowrap leading-none font-sans',
        sizeClasses,
        variantClasses,
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0 text-current">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}
