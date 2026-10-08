import React from 'react'
import { FormField } from '@/api'
import { Field } from '@/design-system/primitives/Field'
import { Select } from '@/design-system/primitives/Select'

export interface FormRendererProps {
  fields: FormField[]
  values: Record<string, any>
  onChange: (fieldId: string, value: any) => void
  errors?: Record<string, string>
  disabled?: boolean
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  fields,
  values,
  onChange,
  errors = {},
  disabled = false,
}) => {
  if (!fields || fields.length === 0) {
    return (
      <p className="font-mono text-xs uppercase tracking-wide text-ink-60 py-2">
        Standard registration particulars apply.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {fields.map((field) => {
        const value = values[field.id] ?? ''
        const error = errors[field.id]

        if (field.type === 'select') {
          const options = (field.options || []).map((opt) => ({
            value: opt,
            label: opt,
          }))
          return (
            <Select
              key={field.id}
              label={field.label}
              options={[{ value: '', label: 'Select option...' }, ...options]}
              value={value}
              onChange={(e) => onChange(field.id, e.target.value)}
              error={error}
              helpText={field.helpText}
              required={field.required}
              disabled={disabled}
            />
          )
        }

        if (field.type === 'checkbox') {
          return (
            <div key={field.id} className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id={`chk-${field.id}`}
                checked={Boolean(value)}
                onChange={(e) => onChange(field.id, e.target.checked)}
                disabled={disabled}
                className="mt-1 h-4 w-4 rounded-none border border-ink text-ink focus:ring-0 focus:outline-none cursor-pointer"
              />
              <div>
                <label
                  htmlFor={`chk-${field.id}`}
                  className="font-body text-sm font-medium text-ink cursor-pointer"
                >
                  {field.label}
                  {field.required && <span className="ml-1 text-[#A32828] font-bold">*</span>}
                </label>
                {field.helpText && (
                  <p className="font-body text-xs text-ink-60">{field.helpText}</p>
                )}
                {error && (
                  <p className="font-mono text-[11px] uppercase text-[#A32828] mt-1">{error}</p>
                )}
              </div>
            </div>
          )
        }

        if (field.type === 'longtext') {
          return (
            <Field
              key={field.id}
              multiline
              rows={4}
              label={field.label}
              value={value}
              onChange={(e) => onChange(field.id, e.target.value)}
              error={error}
              helpText={field.helpText}
              required={field.required}
              placeholder={field.placeholder}
              disabled={disabled}
            />
          )
        }

        return (
          <Field
            key={field.id}
            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
            label={field.label}
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
            error={error}
            helpText={field.helpText}
            required={field.required}
            placeholder={field.placeholder}
            disabled={disabled}
          />
        )
      })}
    </div>
  )
}
