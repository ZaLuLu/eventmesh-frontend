import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyTheme, getInitialTheme } from './ThemeToggle'

beforeEach(() => {
  const values = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    clear: () => values.clear(),
  })
})
afterEach(() => { localStorage.clear(); document.documentElement.classList.remove('dark'); vi.restoreAllMocks(); vi.unstubAllGlobals() })
describe('light-first theme', () => {
  it('uses light on first visit even with a dark OS preference', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList)
    expect(getInitialTheme()).toBe('light')
  })
  it('honors explicit saved preference and applies it to the document', () => {
    localStorage.setItem('eventmesh_theme', 'dark')
    applyTheme(getInitialTheme())
    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    applyTheme('light')
    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem('eventmesh_theme')).toBe('light')
  })
})
