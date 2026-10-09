import React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  helpText?: string
  error?: string
  surface?: 'public' | 'admin'
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      helpText,
      error,
      surface = 'public',
      className = '',
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

    const baseClasses = cn(
      'w-full h-11 bg-surface text-text text-small pl-3.5 pr-10 border border-line rounded-input appearance-none transition-colors duration-150 cursor-pointer outline-none',
      'focus:ring-2 focus:ring-violet focus:border-violet',
      error && 'border-danger focus:ring-danger focus:border-danger',
      surface === 'admin' && 'focus:ring-admin-accent focus:border-admin-accent',
      props.disabled && 'opacity-40 cursor-not-allowed bg-subtle'
    )

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="flex items-center justify-between text-small font-medium text-text select-none"
          >
            <span>
              {label}
              {required && <span className="ml-1 text-danger font-bold">*</span>}
            </span>
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            required={required}
            className={cn(baseClasses, className)}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface text-text">
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-text-3">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {error ? (
          <p className="text-caption text-danger">{error}</p>
        ) : helpText ? (
          <p className="text-caption text-text-3">{helpText}</p>
        ) : null}
      </div>
    )
  }
)

Select.displayName = 'Select'
