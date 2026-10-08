import React from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient' | 'glass'
  size?: 'lg' | 'md' | 'sm' | 'dense'
  surface?: 'public' | 'admin'
  rounded?: 'default' | 'full'
  arrow?: boolean
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      surface = 'public',
      rounded = 'default',
      arrow = false,
      loading = false,
      icon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Height & padding styling
    const sizeClasses = {
      lg: 'h-14 px-8 text-sm font-semibold',
      md: 'h-11 px-5 text-sm font-semibold',
      sm: 'h-9 px-4 text-xs font-semibold',
      dense: 'h-8 px-3 text-xs font-medium',
    }[size]

    const radiusClass = rounded === 'full' ? 'rounded-full' : 'rounded-xl'

    // Surface-aware variant styling
    const getVariantClasses = () => {
      if (variant === 'primary') {
        if (surface === 'admin') {
          return 'bg-slate-900 text-white hover:bg-admin-accent hover:text-admin-on-accent shadow-sm active:scale-[0.98]'
        }
        return 'bg-brand-red text-white hover:bg-[#CC0813] shadow-md shadow-red-500/20 active:scale-[0.98]'
      }

      if (variant === 'gradient') {
        return 'bg-gradient-to-r from-brand-red via-brand-pink to-brand-purple text-white shadow-lg shadow-red-500/25 hover:opacity-95 active:scale-[0.98]'
      }

      if (variant === 'secondary') {
        return 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-sm active:scale-[0.98]'
      }

      if (variant === 'glass') {
        return 'bg-white/80 backdrop-blur-md border border-slate-200/80 text-slate-900 hover:bg-white shadow-sm active:scale-[0.98]'
      }

      if (variant === 'ghost') {
        return 'bg-transparent text-slate-700 hover:bg-slate-100/80 active:bg-slate-200/60'
      }

      if (variant === 'danger') {
        return 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm active:scale-[0.98]'
      }

      return ''
    }

    const disabledClasses = disabled || loading ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`group relative inline-flex items-center justify-center font-body uppercase font-semibold transition-all duration-200 select-none ${radiusClass} ${sizeClasses} ${getVariantClasses()} ${disabledClasses} ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        {...props}
      >
        <span className="inline-flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : icon ? (
            <span className="flex-shrink-0">{icon}</span>
          ) : null}

          <span>{children}</span>

          {arrow && (
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          )}
        </span>
      </button>
    )
  }
)

Button.displayName = 'Button'
