// Hallmark microstructure: Tactile Theme Switcher
import React, { useEffect, useState, useCallback } from 'react'
import { Sun, Moon } from '@phosphor-icons/react'
import { playTearImpulse } from '@/lib/sound'
import { cn } from '@/lib/utils'

export function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  try {
    const saved = localStorage.getItem('eventmesh_theme')
    if (saved === 'dark' || saved === 'light') return saved
  } catch { /* Theme remains usable when storage or audio is unavailable. */ }
  return 'light'
}

export function applyTheme(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.setAttribute('data-theme', 'dark')
  } else {
    root.classList.remove('dark')
    root.setAttribute('data-theme', 'light')
  }
  try {
    localStorage.setItem('eventmesh_theme', theme)
  } catch { /* Theme remains usable when storage or audio is unavailable. */ }
}

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    try {
      playTearImpulse()
    } catch { /* Theme remains usable when storage or audio is unavailable. */ }
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      return next
    })
  }, [])

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={cn(
        'relative inline-flex items-center h-8 px-2 rounded-full border border-line bg-card text-ink transition-colors select-none focus-visible:outline-2 focus-visible:outline-accent',
        'hover:border-accent hover:text-accent shadow-xs',
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-xs font-mono font-medium">
        {isDark ? (
          <>
            <Moon className="w-3.5 h-3.5 text-accent" weight="fill" />
            <span className="hidden sm:inline text-[11px] font-sans">Dark</span>
          </>
        ) : (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-500" weight="fill" />
            <span className="hidden sm:inline text-[11px] font-sans">Light</span>
          </>
        )}
      </div>
    </button>
  )
}
