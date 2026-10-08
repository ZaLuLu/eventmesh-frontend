import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FormRenderer } from './FormRenderer'
import { FormField } from '@/api'

describe('FormRenderer component', () => {
  const fields: FormField[] = [
    {
      id: 'f-github',
      type: 'text',
      label: 'GitHub URL',
      required: true,
      placeholder: 'https://github.com/...',
    },
    {
      id: 'f-track',
      type: 'select',
      label: 'Track',
      options: ['Systems', 'AI'],
      required: true,
    },
  ]

  it('renders dynamic fields according to schema', () => {
    const handleChange = vi.fn()
    render(
      <FormRenderer
        fields={fields}
        values={{ 'f-github': '', 'f-track': '' }}
        onChange={handleChange}
      />
    )

    expect(screen.getByText(/GitHub URL/i)).toBeInTheDocument()
    expect(screen.getByText(/Track/i)).toBeInTheDocument()
  })

  it('fires onChange when input value changes', () => {
    const handleChange = vi.fn()
    render(
      <FormRenderer
        fields={fields}
        values={{ 'f-github': '', 'f-track': '' }}
        onChange={handleChange}
      />
    )

    const input = screen.getByPlaceholderText('https://github.com/...')
    fireEvent.change(input, { target: { value: 'https://github.com/test' } })

    expect(handleChange).toHaveBeenCalledWith('f-github', 'https://github.com/test')
  })

  it('displays field errors if provided', () => {
    render(
      <FormRenderer
        fields={fields}
        values={{}}
        onChange={vi.fn()}
        errors={{ 'f-github': 'This field is required' }}
      />
    )

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })
})
