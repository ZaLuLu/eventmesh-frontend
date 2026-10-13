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
 * Campus Funk Button Primitive (Section 6.1 Specification).
 * - Primary: Solid Ink (#151130), Paper text, pill shape. Hover turns Cobalt (#0047FF) with 2px lift and hard offset shadow.
 * - Secondary: Card (#FFFDF8) fill with 1.5px ink border, matching hover physics.
 * - Admin: Crisp Lime (#D4F25A) action with dark ink text.
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
      hero: 'h-14 px-8 text-base font-bold',
      default: 'h-11 px-6 text-sm font-semibold',
      compact: 'h-9 px-4 text-xs font-semibold',
      admin: 'h-9 px-3.5 text-xs font-semibold',
      lg: 'h-14 px-8 text-base font-bold',
      md: 'h-11 px-6 text-sm font-semibold',
      sm: 'h-9 px-4 text-xs font-semibold',
      dense: 'h-8 px-3 text-xs font-medium',
    }[size] || 'h-11 px-6 text-sm font-semibold'

    // Variant styling
    const getVariantClasses = () => {
      if (surface === 'admin' || variant === 'admin') {
        if (variant === 'primary' || variant === 'admin') {
          return 'bg-lime text-ink font-bold border-none hover:bg-lime/90 hover:-translate-y-0.5 hover:shadow-[2.5px_2.5px_0_#D4F25A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
        }
        if (variant === 'secondary') {
          return 'bg-card text-ink border border-line hover:bg-paper-2 hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px]'
        }
        if (variant === 'danger') {
          return 'bg-red-600 text-white hover:bg-red-700 active:translate-y-0.5'
        }
        return 'bg-transparent text-paper hover:text-white hover:underline'
      }

      // Public Surface Variants
      switch (variant) {
        case 'primary':
          return 'bg-ink text-paper border-none hover:bg-cobalt hover:-translate-y-0.5 hover:shadow-offset active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
        case 'secondary':
          return 'bg-card text-ink border-[1.5px] border-ink hover:bg-paper-2 hover:-translate-y-0.5 hover:shadow-offset active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
        case 'danger':
          return 'bg-red-600 text-white border-none hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-offset active:translate-x-[1px] active:translate-y-[1px]'
        case 'ghost':
          return 'bg-transparent text-ink border-none hover:bg-paper-2 active:bg-paper-2'
        case 'tertiary':
        default:
          return 'bg-transparent text-ink border-none hover:text-cobalt hover:underline p-0 h-auto'
      }
    }

    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 select-none transition-[transform,background-color,border-color,color,box-shadow] duration-150 rounded-full font-sans cursor-pointer',
          fullWidth ? 'w-full' : 'w-auto',
          sizeClasses,
          getVariantClasses(),
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none hover:translate-y-0 hover:shadow-none',
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          icon
        )}
        <span>{children}</span>
        {arrow && !loading && (
          <ArrowRight
            size={16}
            weight="bold"
            className="transition-transform group-hover:translate-x-1"
          />
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
