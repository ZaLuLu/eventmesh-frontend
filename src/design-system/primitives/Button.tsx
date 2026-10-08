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

    // Neomorphic & Feral Gradient Variant Styling (Tactile & High-Energy)
    const getVariantClasses = () => {
      if (variant === 'primary' || variant === 'gradient') {
        if (surface === 'admin') {
          return 'bg-[#0F172A] text-white hover:bg-admin-accent hover:text-admin-on-accent shadow-[3px_3px_8px_rgba(0,0,0,0.15)] active:scale-[0.98]'
        }
        return 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white border border-white/30 shadow-[4px_4px_14px_rgba(99,102,241,0.38),-2px_-2px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_20px_rgba(99,102,241,0.5),-3px_-3px_10px_rgba(255,255,255,0.95)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.25)]'
      }

      if (variant === 'tonal') {
        return 'bg-[#E4EBF3] text-indigo-700 border border-white/50 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.45),inset_-2px_-2px_5px_rgba(255,255,255,0.85)] hover:bg-[#DEE7F0] active:scale-[0.98]'
      }

      if (variant === 'secondary' || variant === 'glass') {
        return 'bg-[#EEF2F6] text-slate-800 border border-white/80 shadow-[4px_4px_10px_rgba(163,177,198,0.4),-4px_-4px_10px_rgba(255,255,255,0.85)] hover:text-indigo-600 hover:shadow-[6px_6px_14px_rgba(163,177,198,0.48),-6px_-6px_14px_rgba(255,255,255,1)] hover:-translate-y-0.5 active:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.45),inset_-2px_-2px_5px_rgba(255,255,255,0.85)] active:translate-y-0'
      }

      if (variant === 'ghost') {
        return 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-black/[0.04] active:bg-black/[0.08]'
      }

      if (variant === 'danger') {
        return 'bg-gradient-to-r from-rose-500 to-red-600 text-white border border-white/20 shadow-[4px_4px_12px_rgba(244,63,94,0.35)] hover:shadow-[6px_6px_18px_rgba(244,63,94,0.45)] hover:-translate-y-0.5 active:translate-y-0'
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
