import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'accent' | 'filling' | 'success' | 'warning'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-champion text-white border-transparent',
    secondary: 'bg-subtle text-text border-line',
    outline: 'bg-transparent text-text border-line',
    accent: 'bg-accent-soft text-accent border-accent/20',
    filling: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
    success: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
    warning: 'bg-[#FFEDD5] text-[#9A3412] border-[#FED7AA]',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-caption font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}
