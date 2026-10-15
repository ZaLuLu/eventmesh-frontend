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
  { label: 'Explore', path: '/explore' },
  { label: 'Calendar', path: '/schedule' },
  { label: 'Clubs', path: '/clubs' },
  { label: 'Announcements', path: '/announcements' },
  { label: 'About', path: '/about' },
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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" onClick={closeMenus} aria-label="EventMesh home" className="shrink-0 text-lg font-semibold tracking-[-0.03em]">eventmesh</Link>
          {hasMultipleCampuses() && <div className="relative hidden min-[1100px]:block">
            <button type="button" onClick={() => setCampusOpen(!campusOpen)} aria-expanded={campusOpen} aria-label="Select campus" className="flex max-w-44 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 py-2 text-xs text-ink-soft hover:bg-surface-subtle">
              <MapPin size={14} aria-hidden="true" /><span className="truncate">{campus}</span><CaretDown size={12} aria-hidden="true" />
            </button>
            {campusOpen && (
              <div className="absolute left-0 top-full mt-2 w-56 rounded-lg border border-line bg-card p-1 shadow-lg">
                {APP_CONFIG.campuses.map((option) => (
                  <button key={option.id} type="button" onClick={() => { setCampus(option.name); setCampusOpen(false) }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-subtle">{option.name}</button>
                ))}
              </div>
            )}
          </div>}
        </div>

        <nav aria-label="Primary navigation" className="hidden items-center gap-8 lg:flex">
          {destinations.map(({ label, path }) => (
            <NavLink key={path} to={path} className={({ isActive }) => cn('relative whitespace-nowrap py-5 text-sm font-medium text-ink-soft hover:text-ink', isActive && 'text-ink after:absolute after:bottom-3 after:left-0 after:right-0 after:h-px after:bg-accent')}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button type="button" onClick={onSearchOpen} aria-label="Search events" className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft hover:bg-surface-subtle hover:text-ink"><MagnifyingGlass size={18} /></button>
          <div className="hidden sm:block"><ThemeToggle /></div>
          <div className="hidden sm:block"><NotificationInbox /></div>
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
          <button type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} className="grid h-10 w-10 place-items-center rounded-lg text-ink lg:hidden">{mobileOpen ? <X size={20} /> : <List size={20} />}</button>
        </div>
      </div>
      {mobileOpen && (
        <nav aria-label="Mobile navigation" className="border-t border-line bg-card px-4 py-2 lg:hidden">
          {destinations.map(({ label, path }) => (
            <Link key={path} to={path} onClick={closeMenus} aria-current={location.pathname === path ? 'page' : undefined} className="flex min-h-11 items-center border-b border-line px-2 text-base font-medium text-ink last:border-b-0">{label}</Link>
          ))}
        </nav>
      )}
    </header>
  )
}
