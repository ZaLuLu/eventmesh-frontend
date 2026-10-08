import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AdminFormBuilder } from './AdminFormBuilder'
import { FormField } from '@/api'

describe('AdminFormBuilder component', () => {
  const initialFields: FormField[] = [
    { id: '1', type: 'text', label: 'Discord Handle', required: false },
    { id: '2', type: 'select', label: 'T-shirt Size', options: ['S', 'M', 'L'], required: true },
  ]

  it('renders field list with drag handles and labels', () => {
    render(<AdminFormBuilder fields={initialFields} onChange={vi.fn()} />)

    expect(screen.getByText(/Discord Handle/i)).toBeInTheDocument()
    expect(screen.getByText(/T-shirt Size/i)).toBeInTheDocument()
    expect(screen.getByText('*Required')).toBeInTheDocument()
  })

  it('calls onChange when adding a new field', () => {
    const handleChange = vi.fn()
    render(<AdminFormBuilder fields={initialFields} onChange={handleChange} />)

    const addTextBtn = screen.getByRole('button', { name: /\+text/i })
    fireEvent.click(addTextBtn)

    expect(handleChange).toHaveBeenCalled()
    const updatedList = handleChange.mock.calls[0][0]
    expect(updatedList.length).toBe(3)
    expect(updatedList[2].type).toBe('text')
  })
})
