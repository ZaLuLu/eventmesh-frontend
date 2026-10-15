import React, { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CaretDown, List, MagnifyingGlass, MapPin, X } from '@/design-system/Icon'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { APP_CONFIG, hasMultipleCampuses } from '@/config/appConfig'
import { ThemeToggle } from '@/design-system/ThemeToggle'
import { NotificationInbox } from '@/features/notifications/NotificationInbox'
import { cn } from '@/lib/utils'

interface PublicHeaderProps {
  onSearchOpen: () => void
}

const destinations = [
  { label: 'Home', path: '/' },
  { label: 'Explore', path: '/explore' },
  { label: 'Calendar', path: '/schedule' },
  { label: 'Clubs', path: '/clubs' },
]

export const PublicHeader: React.FC<PublicHeaderProps> = ({ onSearchOpen }) => {
  const location = useLocation()
  const { session, isAuthenticated, logout } = useAuth()
  const { canAccessAdmin } = usePermission()
  const [campus, setCampus] = useState(APP_CONFIG.campuses[0]?.name || 'Select campus')
  const [campusOpen, setCampusOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMenus = () => {
    setMobileOpen(false)
    setAccountOpen(false)
    setCampusOpen(false)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-card text-ink">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: Brand & Nav Links */}
        <div className="flex min-w-0 items-center gap-6">
          <Link to="/" onClick={closeMenus} aria-label="EventMesh home" className="shrink-0 text-lg font-semibold tracking-[-0.03em]">
            eventmesh
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-5 lg:flex">
            {destinations.map(({ label, path }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  cn(
                    'relative whitespace-nowrap py-5 text-sm font-medium text-ink-soft hover:text-ink transition-colors',
                    isActive && 'text-ink font-semibold after:absolute after:bottom-3 after:left-0 after:right-0 after:h-0.5 after:bg-accent'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Center: Normal, Flat Search Bar */}
        <div className="hidden sm:flex flex-1 justify-center max-w-xs md:max-w-sm lg:max-w-md mx-2">
          <button
            type="button"
            onClick={onSearchOpen}
            aria-label="Search events and clubs"
            className="flex w-full items-center gap-2.5 rounded-lg border border-line bg-surface-subtle/80 hover:bg-surface-subtle px-3 py-1.5 text-xs text-ink-soft hover:text-ink transition-colors"
          >
            <MagnifyingGlass size={15} className="text-ink-muted shrink-0" />
            <span className="truncate font-sans text-xs">Search events, clubs, organizers...</span>
            <kbd className="ml-auto hidden rounded border border-line bg-card px-1.5 py-0.5 font-mono text-[10px] text-ink-muted lg:inline-block">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions & Auth */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Mobile Search Icon Button */}
          <button
            type="button"
            onClick={onSearchOpen}
            aria-label="Search events"
            className="sm:hidden grid h-9 w-9 place-items-center rounded-lg border border-line text-ink hover:bg-surface-subtle"
          >
            <MagnifyingGlass size={16} />
          </button>
          
          <div className="hidden sm:block"><ThemeToggle /></div>
          <NotificationInbox />

          {/* Desktop & Tablet Passes / Auth */}
          <div className="hidden sm:block">
            {isAuthenticated ? (
              <div className="relative">
                <Link to="/attendee/dashboard" onClick={closeMenus} className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-xs font-semibold text-paper hover:bg-ink-soft">My Passes</Link>
                <button type="button" onClick={() => setAccountOpen(!accountOpen)} aria-label="Account menu" aria-expanded={accountOpen} className="ml-1 inline-flex h-9 w-8 items-center justify-center rounded-lg text-ink-soft hover:bg-surface-subtle"><CaretDown size={14} /></button>
                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-line bg-card p-2 text-sm shadow-lg">
                    <p className="truncate px-2 py-2 text-xs text-ink-soft">{session?.name || session?.email}</p>
                    {canAccessAdmin() && <Link to="/admin" onClick={closeMenus} className="block rounded-lg px-2 py-2 hover:bg-surface-subtle">Admin console</Link>}
                    <button type="button" onClick={() => { closeMenus(); logout() }} className="block w-full rounded-lg px-2 py-2 text-left hover:bg-surface-subtle">Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" onClick={closeMenus} className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-xs font-semibold text-paper hover:bg-ink-soft active:scale-[0.98]">Sign In</Link>
            )}
          </div>

          {/* Mobile Drawer Toggle */}
          <button type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} className="grid h-10 w-10 place-items-center rounded-lg text-ink lg:hidden">{mobileOpen ? <X size={20} /> : <List size={20} />}</button>
        </div>
      </div>
      {mobileOpen && (
        <nav aria-label="Mobile navigation" className="border-t border-line bg-card px-4 py-3 lg:hidden space-y-2">
          {destinations.map(({ label, path }) => (
            <Link key={path} to={path} onClick={closeMenus} aria-current={location.pathname === path ? 'page' : undefined} className="flex min-h-11 items-center border-b border-line px-2 text-base font-medium text-ink last:border-b-0">{label}</Link>
          ))}
          <div className="pt-2 flex items-center justify-between border-t border-line">
            <span className="text-xs text-ink-soft">Theme</span>
            <ThemeToggle />
          </div>
          {isAuthenticated ? (
            <div className="pt-2 space-y-1">
              <Link to="/attendee/dashboard" onClick={closeMenus} className="block w-full text-center py-2.5 rounded-lg bg-ink text-paper text-sm font-semibold">My Passes</Link>
              {canAccessAdmin() && <Link to="/admin" onClick={closeMenus} className="block py-2 text-sm text-ink-soft">Admin console</Link>}
              <button type="button" onClick={() => { closeMenus(); logout() }} className="block w-full text-left py-2 text-sm text-accent">Sign out</button>
            </div>
          ) : (
            <Link to="/login" onClick={closeMenus} className="block w-full text-center py-2.5 rounded-lg bg-ink text-paper text-sm font-semibold">Sign In</Link>
          )}
        </nav>
      )}
    </header>
  )
}

