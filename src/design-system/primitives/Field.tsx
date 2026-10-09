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

    // 48px height, --surface with 1px --line, radius 10px, focus = 2px --accent outline
    const baseInputClasses = `w-full bg-surface text-text font-normal border border-line rounded-[10px] px-3.5 transition-colors duration-150 placeholder:text-text-3 text-small focus:outline-none focus:ring-2 ${
      error
        ? 'border-danger focus:ring-danger'
        : surface === 'admin'
        ? 'focus:ring-admin-accent border-line focus:border-admin-accent'
        : 'focus:ring-accent border-line focus:border-accent'
    } ${props.disabled ? 'opacity-40 cursor-not-allowed bg-subtle' : ''}`

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

        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={inputId}
            rows={rows}
            required={required}
            className={`${baseInputClasses} py-3 resize-y ${className}`}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={inputId}
            required={required}
            className={`${baseInputClasses} h-12 ${className}`}
            {...props}
          />
        )}

        {helpText && !error && (
          <p className="text-caption text-text-2 mt-0.5">{helpText}</p>
        )}

        {error && (
          <p className="text-caption font-medium text-danger mt-0.5">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Field.displayName = 'Field'
