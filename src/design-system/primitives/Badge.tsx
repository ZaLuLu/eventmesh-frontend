import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
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
    default: 'bg-lavender-100 text-champion',
    lavender: 'bg-lavender text-champion font-semibold',
    champion: 'bg-champion text-white font-medium',
    success: 'bg-[#E6F4EA] text-success font-semibold',
    warning: 'bg-[#FEF3D6] text-warning font-semibold',
    danger: 'bg-[#FCE8E6] text-danger font-semibold',
    promoted: 'bg-lavender text-champion font-semibold border border-lavender-300',
    filling: 'bg-[#FEF3D6] text-[#B85D19] font-semibold border border-[#B85D19]/20',
    free: 'bg-[#E6F4EA] text-[#1E7E34] font-semibold border border-[#1E7E34]/20',
    online: 'bg-lavender text-champion font-semibold border border-lavender-300',
    outline: 'bg-transparent text-text-2 border border-line',
  }[variant]

  const sizeClasses = {
    sm: 'h-6 px-2.5 text-caption',
    md: 'h-7 px-3 text-caption',
  }[size]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full select-none whitespace-nowrap leading-none',
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
