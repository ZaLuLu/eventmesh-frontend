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
      <p className="text-small text-text-2 py-2">
        Standard registration particulars apply.
      </p>
    )
  }

  return (
    <div className="space-y-4">
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
            <div key={field.id} className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id={`chk-${field.id}`}
                checked={Boolean(value)}
                onChange={(e) => onChange(field.id, e.target.checked)}
                disabled={disabled}
                className="mt-1 h-4 w-4 rounded-[4px] border border-line text-accent focus:ring-accent cursor-pointer"
              />
              <div>
                <label
                  htmlFor={`chk-${field.id}`}
                  className="text-small font-medium text-text cursor-pointer select-none"
                >
                  {field.label}
                  {field.required && <span className="ml-1 text-danger font-bold">*</span>}
                </label>
                {field.helpText && (
                  <p className="text-caption text-text-2 mt-0.5">{field.helpText}</p>
                )}
                {error && (
                  <p className="text-caption text-danger font-medium mt-0.5">{error}</p>
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
