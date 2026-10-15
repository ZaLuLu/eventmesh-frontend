import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock matchMedia for testing environments
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock scrollTo
window.scrollTo = () => {}

// Mock canvas-confetti in jsdom environment
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))
