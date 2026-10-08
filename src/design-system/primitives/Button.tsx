import React from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tonal' | 'ghost' | 'danger' | 'gradient' | 'glass'
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
      rounded = 'full',
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
    // M3 Sizing Scale
    const sizeClasses = {
      lg: 'h-12 px-7 text-sm font-semibold',
      md: 'h-10 px-5 text-sm font-semibold',
      sm: 'h-8 px-4 text-xs font-semibold',
      dense: 'h-8 px-3 text-xs font-medium',
    }[size]

    const radiusClass = rounded === 'default' ? 'rounded-xl' : 'rounded-full'

    // Google M3 Variant Styling (Streamlined & Harmonious)
    const getVariantClasses = () => {
      if (variant === 'primary' || variant === 'gradient') {
        if (surface === 'admin') {
          return 'bg-[#1F1F1F] text-white hover:bg-admin-accent hover:text-admin-on-accent shadow-xs active:scale-[0.98]'
        }
        return 'bg-md-primary text-white hover:bg-md-primary-hover shadow-xs active:scale-[0.98]'
      }

      if (variant === 'tonal') {
        return 'bg-md-primary-container text-md-on-primary-container hover:bg-[#D3E3FD] shadow-none active:scale-[0.98]'
      }

      if (variant === 'secondary' || variant === 'glass') {
        return 'border border-md-outline bg-white text-md-primary hover:bg-md-primary-container/40 active:scale-[0.98]'
      }

      if (variant === 'ghost') {
        return 'bg-transparent text-md-on-surface-variant hover:bg-black/[0.04] active:bg-black/[0.08]'
      }

      if (variant === 'danger') {
        return 'bg-[#BA1A1A] text-white hover:bg-[#93000A] shadow-xs active:scale-[0.98]'
      }

      return ''
    }

    const disabledClasses = disabled || loading ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`group relative inline-flex items-center justify-center font-body tracking-normal font-semibold transition-all duration-200 select-none ${radiusClass} ${sizeClasses} ${getVariantClasses()} ${disabledClasses} ${
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
