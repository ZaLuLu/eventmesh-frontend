import React from 'react'

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helpText?: string
  error?: string
  multiline?: boolean
  rows?: number
  surface?: 'public' | 'admin'
}

export const Field = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FieldProps
>(
  (
    {
      label,
      helpText,
      error,
      multiline = false,
      rows = 4,
      surface = 'public',
      className = '',
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `field-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

    const baseInputClasses = `w-full bg-paper text-ink font-body text-sm px-3.5 py-3 border transition-colors duration-150 placeholder:text-ink-60/50 ${
      error
        ? 'border-[#A32828] focus:border-[#A32828]'
        : surface === 'admin'
        ? 'border-admin-border focus:border-admin-accent'
        : 'border-ink focus:border-ink'
    } ${props.disabled ? 'opacity-40 cursor-not-allowed bg-paper-deep' : ''}`

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="flex items-center justify-between font-mono text-[11px] font-medium uppercase tracking-widecaps text-ink-60"
          >
            <span>
              {label}
              {required && <span className="ml-1 text-[#A32828] font-bold">*</span>}
            </span>
          </label>
        )}

        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={inputId}
            rows={rows}
            required={required}
            className={`${baseInputClasses} resize-y ${className}`}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={inputId}
            required={required}
            className={`${baseInputClasses} ${className}`}
            {...props}
          />
        )}

        {helpText && !error && (
          <p className="font-body text-xs text-ink-60">{helpText}</p>
        )}

        {error && (
          <p className="font-mono text-[11px] uppercase tracking-wide font-medium text-[#A32828]">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Field.displayName = 'Field'
