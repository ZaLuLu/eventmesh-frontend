import React from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger'
  size?: 'hero' | 'default' | 'compact' | 'admin' | 'lg' | 'md' | 'sm' | 'dense'
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
      size = 'default',
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
    // Height specs: Hero 56px, Default 48px, Compact 40px, Admin 36px
    const sizeClasses = {
      hero: 'h-14 px-7 text-[15px]',
      default: 'h-12 px-5 text-[15px]',
      compact: 'h-10 px-4 text-small',
      admin: 'h-9 px-3.5 text-small',
      // Legacy size mappings for compatibility
      lg: 'h-14 px-7 text-[15px]',
      md: 'h-12 px-5 text-[15px]',
      sm: 'h-10 px-4 text-small',
      dense: 'h-9 px-3 text-small',
    }[size] || 'h-12 px-5 text-[15px]'

    // Variants (flat, solid colors, color change only on hover, no shadow, no lift, no scale)
    const getVariantClasses = () => {
      if (surface === 'admin') {
        if (variant === 'primary') {
          return 'bg-[#17645F] text-white hover:bg-admin-accent hover:bg-[#0F4F4B]'
        }
        if (variant === 'secondary') {
          return 'bg-[#E8ECEE] text-text hover:bg-[#DCE1E4]'
        }
        if (variant === 'tertiary') {
          return 'bg-transparent text-[#17645F] hover:underline p-0 h-auto'
        }
        if (variant === 'danger') {
          return 'bg-danger text-white hover:bg-[#9B1E14]'
        }
      }

      switch (variant) {
        case 'primary':
          return 'bg-accent text-on-accent hover:bg-accent-hover'
        case 'secondary':
          return 'bg-subtle text-text hover:bg-[#EBE7E1]'
        case 'tertiary':
          return 'bg-transparent text-accent hover:underline p-0 h-auto'
        case 'danger':
          return 'bg-danger text-white hover:bg-[#9B1E14]'
        default:
          return 'bg-accent text-on-accent hover:bg-accent-hover'
      }
    }

    const disabledClasses = disabled || loading ? 'opacity-40 cursor-not-allowed' : 'active:translate-y-0'

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center font-semibold tracking-normal rounded-[10px] transition-colors duration-150 select-none focus-visible:outline-2 focus-visible:outline-text focus-visible:outline-offset-2 ${sizeClasses} ${getVariantClasses()} ${disabledClasses} ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        {...props}
      >
        <span className="inline-flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-current" />
          ) : icon ? (
            <span className="flex-shrink-0">{icon}</span>
          ) : null}

          <span>{children}</span>

          {arrow && !loading && (
            <ArrowRight className="h-4 w-4 flex-shrink-0" />
          )}
        </span>
      </button>
    )
  }
)

Button.displayName = 'Button'
