import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  CaretDown,
  List,
  MagnifyingGlass,
  Ticket,
  X,
  User,
  Users,
  SignOut,
  House,
  CalendarBlank,
} from '@/design-system/Icon'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { ThemeToggle } from '@/design-system/ThemeToggle'
import { NotificationInbox } from '@/features/notifications/NotificationInbox'
import { resolveUserAvatar } from '@/lib/avatars'
import { cn } from '@/lib/utils'

interface PublicHeaderProps {
  onSearchOpen: () => void
}

const destinations = [
  { label: 'Home', path: '/' },
  { label: 'Explore', path: '/explore' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'My College', path: '/my-college' },
]

/**
 * PublicHeader (High-Density Collegiate Architectural Standard)
 * - Explicit 4-destinations navbar: Home, Explore, Calendar, Clubs.
 * - Central low-profile search dock (⌘K shortcut).
 * - Ticket emoji pass icon button (🎫) to the left of the profile squircle.
 * - Profile Squircle with consolidated dropdown menu:
 *   - User badge & metadata
 *   - My Profile, My Tickets & Passes, My Certificates, My Clubs
 *   - Organizer / Admin Studio link
 *   - Embedded Theme Toggle (Dark / Light)
 *   - Sign out
 */
export const PublicHeader: React.FC<PublicHeaderProps> = ({ onSearchOpen }) => {
  const location = useLocation()
  const { session, isAuthenticated, logout } = useAuth()
  const { canAccessAdmin } = usePermission()
  const [accountOpen, setAccountOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const closeMenus = () => {
    setMobileOpen(false)
    setAccountOpen(false)
  }

  // Close profile dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAccountOpen(false)
        setMobileOpen(false)
      }
    }

    if (accountOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [accountOpen])

  const userAvatar = resolveUserAvatar(session)
  const userInitials = useMemo(() => {
    const raw = (session?.name || 'Suraj Naik').trim()
    const parts = raw.split(' ').filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    return raw.slice(0, 2).toUpperCase()
  }, [session?.name])

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-line bg-card text-ink transition-colors">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left: Brand Wordmark & Primary 4-Tab Destinations */}
        <div className="flex min-w-0 items-center gap-7">
          <Link
            to="/"
            onClick={closeMenus}
            aria-label="EventMesh home"
            className="shrink-0 text-sm sm:text-base font-bold uppercase tracking-[0.18em] text-ink hover:opacity-80 transition-opacity"
          >
            EVENTMESH
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-6 md:flex">
            {destinations.map(({ label, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  cn(
                    'whitespace-nowrap text-xs font-semibold uppercase tracking-[0.12em] transition-colors py-1',
                    isActive
                      ? 'text-ink font-bold border-b-2 border-accent'
                      : 'text-ink-muted hover:text-ink'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Center: Low-Profile Search Dock (14px Radius) */}
        <div className="hidden sm:flex flex-1 justify-center max-w-xs md:max-w-sm lg:max-w-md mx-2">
          <button
            type="button"
            onClick={onSearchOpen}
            aria-label="Search events and clubs"
            className="flex w-full items-center gap-2.5 rounded-[14px] border border-line bg-surface-subtle/60 hover:bg-surface-subtle px-3.5 h-9 text-xs text-ink-soft hover:text-ink transition-colors"
          >
            <MagnifyingGlass size={15} className="text-ink-muted shrink-0" />
            <span className="truncate font-sans text-xs">Search events, clubs, organizers...</span>
            <kbd className="ml-auto hidden rounded border border-line bg-card px-1.5 py-0.5 font-mono text-[10px] text-ink-muted lg:inline-block">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Utilities & Profile Squircle */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          {/* Mobile Search Trigger */}
          <button
            type="button"
            onClick={onSearchOpen}
            aria-label="Search events"
            className="sm:hidden grid h-9 w-9 place-items-center rounded-[10px] border border-line text-ink hover:bg-surface-subtle transition-colors"
          >
            <MagnifyingGlass size={16} />
          </button>

          {/* Notifications Inbox */}
          <NotificationInbox />

          {/* Unauthenticated Mode: Direct Theme Switcher + Sign In */}
          {!isAuthenticated && (
            <div className="hidden sm:flex items-center gap-2">
              <ThemeToggle />
              <Link
                to="/login"
                onClick={closeMenus}
                className="inline-flex h-9 items-center rounded-[12px] bg-ink px-4 text-xs font-bold uppercase tracking-[0.08em] text-paper hover:bg-ink-soft active:scale-[0.98] transition-all"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Authenticated Mode: My Passes Button to Left of Profile Squircle */}
          {isAuthenticated && (
            <div className="relative flex items-center gap-2" ref={dropdownRef}>
              {/* Quick Ticket Pass Button */}
              <Link
                to="/attendee/dashboard?tab=passes"
                onClick={closeMenus}
                aria-label="My Passes"
                title="View My Passes & Tickets"
                className="relative inline-flex items-center gap-1.5 h-9 px-3 rounded-[12px] border border-line bg-card hover:bg-surface-subtle text-ink font-semibold text-xs tracking-wide transition-all hover:border-accent shadow-xs active:scale-95"
              >
                <Ticket size={15} weight="bold" className="text-accent" />
                <span>My Passes</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              </Link>

              {/* Profile Squircle Button */}
              <button
                type="button"
                onClick={() => setAccountOpen(!accountOpen)}
                aria-label="User profile menu"
                aria-expanded={accountOpen}
                className={cn(
                  'relative inline-flex items-center justify-center h-9 w-9 rounded-[12px] border font-mono text-xs font-bold text-ink transition-all shadow-xs active:scale-95 overflow-hidden',
                  accountOpen
                    ? 'border-accent ring-2 ring-accent/20 bg-surface'
                    : 'border-line hover:border-accent bg-surface-subtle'
                )}
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={session?.name || 'User avatar'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{userInitials}</span>
                )}
              </button>

              {/* The Squircle Consolidated Dropdown */}
              {accountOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 rounded-[16px] border border-line bg-card p-2 text-sm shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100"
                  role="menu"
                  aria-orientation="vertical"
                >
                  {/* User Profile Header Card */}
                  <div className="p-2.5 rounded-[12px] bg-surface-subtle/80 border border-line/70 mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-[9px] overflow-hidden bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                        {userAvatar ? (
                          <img src={userAvatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold font-mono text-accent">{userInitials}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-ink truncate leading-tight">
                          {session?.name || 'Attendee'}
                        </p>
                        <p className="text-[11px] font-mono text-ink-muted truncate leading-tight mt-0.5">
                          {session?.email || 'attendee@campus.edu'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-line/60 flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                        Status
                      </span>
                      <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider bg-accent-soft px-1.5 py-0.5 rounded">
                        {canAccessAdmin() ? 'Organizer' : 'Passholder'}
                      </span>
                    </div>
                  </div>

                  {/* Core Navigation Options */}
                  <div className="space-y-0.5 py-1">
                    <Link
                      to="/attendee/dashboard?tab=profile"
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-xs font-medium text-ink hover:bg-surface-subtle hover:text-accent transition-colors"
                    >
                      <User size={15} className="text-ink-muted shrink-0" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/attendee/dashboard?tab=passes"
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-xs font-medium text-ink hover:bg-surface-subtle hover:text-accent transition-colors"
                    >
                      <Ticket size={15} className="text-ink-muted shrink-0" />
                      <span>My Tickets & Passes</span>
                    </Link>

                    <Link
                      to="/my-college"
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-xs font-medium text-ink hover:bg-surface-subtle hover:text-accent transition-colors"
                    >
                      <Users size={15} className="text-ink-muted shrink-0" />
                      <span>My College Hub</span>
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-line my-1" />

                  {/* Open Admin / Organizer Studio Button */}
                  <Link
                    to="/admin"
                    onClick={closeMenus}
                    className="flex items-center justify-between rounded-[10px] px-2.5 py-2 text-xs font-semibold bg-accent-soft text-accent hover:bg-accent hover:text-white transition-colors group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent group-hover:bg-white" />
                      <span>Organizer Studio</span>
                    </span>
                    <span className="font-mono text-[10px] uppercase opacity-80">Admin Desk →</span>
                  </Link>

                  {/* Divider */}
                  <div className="border-t border-line my-1" />

                  {/* Embedded Theme Toggle Row */}
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-[10px] bg-surface-subtle/50">
                    <span className="text-xs font-medium text-ink-soft">Appearance</span>
                    <ThemeToggle />
                  </div>

                  {/* Divider */}
                  <div className="border-t border-line my-1" />

                  {/* Sign Out Button */}
                  <button
                    type="button"
                    onClick={() => {
                      closeMenus()
                      logout()
                    }}
                    className="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-xs font-semibold text-danger hover:bg-danger-soft transition-colors"
                  >
                    <SignOut size={15} className="shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Drawer Hamburger Trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            className="grid h-9 w-9 place-items-center rounded-[10px] border border-line text-ink hover:bg-surface-subtle transition-colors md:hidden"
          >
            {mobileOpen ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (100% Solid Opaque) */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-line bg-card px-4 py-4 md:hidden space-y-2 shadow-lg"
        >
          {destinations.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              onClick={closeMenus}
              aria-current={location.pathname === path ? 'page' : undefined}
              className="flex min-h-[44px] items-center border-b border-line px-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink last:border-b-0 hover:text-accent transition-colors"
            >
              {label}
            </Link>
          ))}

          <div className="pt-2 flex items-center justify-between border-t border-line">
            <span className="text-xs font-medium uppercase tracking-[0.1em] text-ink-muted">
              Appearance
            </span>
            <ThemeToggle />
          </div>

          {isAuthenticated ? (
            <div className="pt-3 space-y-2">
              <Link
                to="/attendee/dashboard?tab=passes"
                onClick={closeMenus}
                className="flex items-center justify-center gap-2 w-full text-center py-2.5 rounded-[12px] bg-ink text-paper text-xs font-bold uppercase tracking-[0.08em] shadow-xs active:scale-[0.98] transition-transform"
              >
                <Ticket size={16} weight="bold" />
                <span>My Passes</span>
              </Link>
              <Link
                to="/admin"
                onClick={closeMenus}
                className="block w-full text-center py-2.5 rounded-[12px] border border-line bg-surface-subtle text-ink text-xs font-bold uppercase tracking-[0.08em] hover:bg-surface transition-colors"
              >
                ⚡ Organizer Studio
              </Link>
              <button
                type="button"
                onClick={() => {
                  closeMenus()
                  logout()
                }}
                className="block w-full text-center py-2 text-xs font-semibold uppercase tracking-[0.08em] text-danger hover:underline"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={closeMenus}
              className="block w-full text-center py-2.5 rounded-[12px] bg-ink text-paper text-xs font-bold uppercase tracking-[0.08em] shadow-xs active:scale-[0.98] transition-transform"
            >
              Sign In
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
