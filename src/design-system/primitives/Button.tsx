import React from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger'
  size?: 'hero' | 'default' | 'compact' | 'admin' | 'lg' | 'md' | 'sm' | 'dense'
  surface?: 'public' | 'admin'
  onDark?: boolean
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
    // Height specs: Hero 56px (h-14), Default 48px (h-12), Compact 40px (h-10), Admin 36px (h-9)
    const sizeClasses = {
      hero: 'h-14 px-8 text-[15px]',
      default: 'h-12 px-6 text-[15px]',
      compact: 'h-10 px-4 text-small',
      admin: 'h-9 px-3.5 text-small',
      // Legacy aliases
      lg: 'h-14 px-8 text-[15px]',
      md: 'h-12 px-6 text-[15px]',
      sm: 'h-10 px-4 text-small',
      dense: 'h-9 px-3 text-small',
    }[size] || 'h-12 px-6 text-[15px]'

    // Color variant resolution
    const getVariantClasses = () => {
      if (surface === 'admin') {
        if (variant === 'primary') {
          return 'bg-admin-accent text-white hover:bg-admin-accent'
        }
        if (variant === 'secondary') {
          return 'bg-subtle text-text hover:bg-line'
        }
        if (variant === 'tertiary') {
          return 'bg-transparent text-admin-accent hover:underline p-0 h-auto'
        }
        if (variant === 'danger') {
          return 'bg-danger text-white hover:bg-[#9B1E14]'
        }
      }

      if (onDark) {
        // On dark rules:
        // Primary: solid --lavender with --champion text (hover --lavender-200)
        // Secondary: solid --champion-2 with --on-dark text
        // Tertiary: text link in --lavender
        switch (variant) {
          case 'primary':
            return 'bg-lavender text-champion hover:bg-lavender-200 focus-visible:ring-lavender'
          case 'secondary':
            return 'bg-champion-2 text-on-dark hover:bg-champion focus-visible:ring-lavender'
          case 'tertiary':
            return 'bg-transparent text-lavender hover:underline p-0 h-auto focus-visible:ring-lavender'
          case 'danger':
            return 'bg-danger text-white hover:bg-[#9B1E14]'
          default:
            return 'bg-lavender text-champion hover:bg-lavender-200'
        }
      }

      // On light rules:
      // Primary: solid --champion with white text
      // Secondary: solid --lavender-100 with --champion text (hover --lavender-200)
      // Tertiary: text link in --violet
      switch (variant) {
        case 'primary':
          return 'bg-champion text-white hover:bg-champion-2 focus-visible:ring-violet'
        case 'secondary':
          return 'bg-lavender-100 text-champion hover:bg-lavender-200 focus-visible:ring-violet'
        case 'tertiary':
          return 'bg-transparent text-violet hover:underline p-0 h-auto focus-visible:ring-violet'
        case 'danger':
          return 'bg-danger text-white hover:bg-[#9B1E14] focus-visible:ring-danger'
        default:
          return 'bg-champion text-white hover:bg-champion-2'
      }
    }

    const disabledClasses =
      disabled || loading ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''

    const focusRingClasses = onDark
      ? 'focus-visible:ring-2 focus-visible:ring-lavender focus-visible:ring-offset-2 focus-visible:ring-offset-champion'
      : 'focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-white'

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'group inline-flex items-center justify-center font-semibold tracking-normal rounded-full transition-colors duration-150 select-none outline-none',
          sizeClasses,
          getVariantClasses(),
          focusRingClasses,
          disabledClasses,
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        <span className="inline-flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-current" />
          ) : icon ? (
            <span className="flex-shrink-0 transition-transform duration-150 group-hover:translate-x-1">
              {icon}
            </span>
          ) : null}

          <span>{children}</span>

          {arrow && !loading && (
            <ArrowRight className="h-4 w-4 flex-shrink-0 transition-transform duration-150 group-hover:translate-x-1" />
          )}
        </span>
      </button>
    )
  }
)

Button.displayName = 'Button'
