import React from 'react'
import { ArrowRight } from '@/design-system/Icon'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost' | 'admin'
  size?: 'hero' | 'default' | 'compact' | 'admin' | 'lg' | 'md' | 'sm' | 'dense'
  surface?: 'public' | 'admin'
  onDark?: boolean
  arrow?: boolean
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

/**
 * Modern-Minimal Button Primitive.
 * Precision, restraint, and subtle micro-elevation.
 * Zero cartoon offset shadows, zero chunky comic strokes.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'default',
      surface = 'public',
      onDark = false,
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
    // Sizing scale
    const sizeClasses = {
      hero: 'h-12 px-7 text-base font-medium',
      default: 'h-10 px-5 text-sm font-medium',
      compact: 'h-8 px-3.5 text-xs font-medium',
      admin: 'h-8 px-3 text-xs font-medium',
      lg: 'h-12 px-7 text-base font-medium',
      md: 'h-10 px-5 text-sm font-medium',
      sm: 'h-8 px-3.5 text-xs font-medium',
      dense: 'h-7 px-2.5 text-xs font-medium',
    }[size] || 'h-10 px-5 text-sm font-medium'

    // Variant styling
    const getVariantClasses = () => {
      if (surface === 'admin' || variant === 'admin') {
        if (variant === 'primary' || variant === 'admin') {
          return 'bg-accent text-white font-medium border-0 hover:bg-accent-hover transition-colors'
        }
        if (variant === 'secondary') {
          return 'bg-card text-ink border border-line hover:bg-surface-subtle transition-colors'
        }
        if (variant === 'danger') {
          return 'bg-red-600 text-white hover:bg-red-700 transition-colors'
        }
        return 'bg-transparent text-ink-soft hover:text-ink transition-colors'
      }

      // Public Surface Variants
      switch (variant) {
        case 'primary':
          return 'bg-ink text-paper border-0 hover:bg-accent hover:text-white transition-colors'
        case 'secondary':
          return 'bg-surface-subtle text-ink border border-line hover:border-accent hover:text-accent transition-colors'
        case 'tertiary':
        case 'ghost':
          return 'bg-transparent text-ink-soft hover:text-ink hover:bg-surface-subtle transition-colors'
        case 'danger':
          return 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white transition-colors'
        default:
          return 'bg-ink text-paper border-0 hover:bg-accent hover:text-white transition-colors'
      }
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-full font-sans tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-transform duration-150 active:scale-[0.98]',
          fullWidth && 'w-full',
          sizeClasses,
          getVariantClasses(),
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          icon && <span className="flex-shrink-0">{icon}</span>
        )}
        <span>{children}</span>
        {arrow && !loading && (
          <ArrowRight
            size={size === 'hero' || size === 'lg' ? 16 : 14}
            weight="bold"
            className="transition-transform duration-150 group-hover:translate-x-0.5"
          />
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
