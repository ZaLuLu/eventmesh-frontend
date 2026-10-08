import React from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'lg' | 'md' | 'sm' | 'dense'
  surface?: 'public' | 'admin'
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
    // Height styling
    const sizeClasses = {
      lg: 'h-14 px-8 text-[13px]', // 56px
      md: 'h-12 px-6 text-[13px]', // 48px
      sm: 'h-10 px-4 text-[12px]', // 40px
      dense: 'h-9 px-3 text-[12px]', // 36px (admin dense)
    }[size]

    // Surface-aware variant styling
    const getVariantClasses = () => {
      if (variant === 'primary') {
        if (surface === 'admin') {
          return 'bg-ink text-paper hover:bg-admin-accent hover:text-admin-on-accent active:bg-[#000000]'
        }
        return 'bg-ink text-paper hover:bg-event hover:text-on-event active:bg-[#000000]'
      }

      if (variant === 'secondary') {
        if (surface === 'admin') {
          return 'border-[1.5px] border-ink bg-transparent text-ink hover:bg-ink hover:text-paper active:bg-ink'
        }
        return 'border-[1.5px] border-ink bg-transparent text-ink hover:bg-ink hover:text-paper active:bg-ink'
      }

      if (variant === 'ghost') {
        return 'bg-transparent text-ink underline decoration-1 hover:decoration-2 underline-offset-4 px-2'
      }

      if (variant === 'danger') {
        return 'bg-[#A32828] text-white hover:bg-[#831818] active:bg-[#601010]'
      }

      return ''
    }

    const focusClasses =
      surface === 'admin'
        ? 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent focus-visible:outline-offset-2'
        : 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-3'

    const disabledClasses = disabled || loading ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`group relative inline-flex items-center justify-center font-body font-semibold uppercase tracking-caps transition-all duration-200 select-none ${sizeClasses} ${getVariantClasses()} ${focusClasses} ${disabledClasses} ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        {...props}
      >
        {/* Inline Loading Progress Bar */}
        {loading && (
          <div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-white/20">
            <div className="h-full w-full animate-pulse bg-current opacity-80" />
          </div>
        )}

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
