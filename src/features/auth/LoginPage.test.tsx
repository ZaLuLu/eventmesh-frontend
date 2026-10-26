import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginPage } from './LoginPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoginPage Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    mockNavigate.mockClear()
  })

  it('renders clean editorial sign-in header and subtle quick demo button', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText('Sign in to EventMesh')).toBeInTheDocument()
    expect(screen.getByText(/Enter your email to receive a secure access code/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Test profile: Suraj Naik/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('name@ctu.edu.in')).toBeInTheDocument()
  })

  it('triggers quick login as Suraj Naik and navigates to attendee dashboard', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    const quickDemoBtn = screen.getByRole('button', { name: /Test profile: Suraj Naik/i })
    expect(quickDemoBtn).toBeInTheDocument()
    fireEvent.click(quickDemoBtn)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/attendee/dashboard')
    })
  })

  it('accepts email input and renders continue button', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    const emailInput = screen.getByPlaceholderText('name@ctu.edu.in') as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'suraj@ctu.edu.in' } })
    expect(emailInput.value).toBe('suraj@ctu.edu.in')

    expect(screen.getByRole('button', { name: /Continue with Email/i })).toBeInTheDocument()
  })
})
