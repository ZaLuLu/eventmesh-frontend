import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from './Button'

describe('Button primitive', () => {
  it('renders children with clean typography and default classes', () => {
    render(<Button>Register Now</Button>)
    const btn = screen.getByRole('button', { name: /Register Now/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveClass('font-semibold')
    expect(btn).toHaveClass('tracking-normal')
  })

  it('applies disabled state when disabled prop is provided', () => {
    render(<Button disabled>Disabled Action</Button>)
    const btn = screen.getByRole('button', { name: /Disabled Action/i })
    expect(btn).toBeDisabled()
    expect(btn).toHaveClass('opacity-40')
  })

  it('renders loading indicator while preserving label', () => {
    render(<Button loading>Submitting</Button>)
    const btn = screen.getByRole('button', { name: /Submitting/i })
    expect(btn).toBeDisabled()
    expect(screen.getByText('Submitting')).toBeInTheDocument()
  })

  it('renders admin surface styling properly', () => {
    render(<Button surface="admin" variant="primary">Admin Action</Button>)
    const btn = screen.getByRole('button', { name: /Admin Action/i })
    expect(btn).toHaveClass('hover:bg-admin-accent')
  })
})
