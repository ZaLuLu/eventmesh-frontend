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
import { useMyRegistrations } from '@/hooks/useRegistrations'
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
 * PublicHeader (Architectural Editorial Collegiate Standard)
 * - Defined surfaces: High-contrast backdrop-blur with crisp 1px border.
 * - Typographic hierarchy: Plus Jakarta Sans / Inter with proportional tracking.
 * - Branded wordmark: Tactile EM squircle with collegiate campus tag.
 * - Central low-profile search dock with keyboard badge affordance (⌘K).
 * - "My Passes" tactile action pill with live registration badge.
 * - Consolidated profile squircle with clear status hierarchy.
 */
export const PublicHeader: React.FC<PublicHeaderProps> = ({ onSearchOpen }) => {
  const location = useLocation()
  const { session, isAuthenticated, logout } = useAuth()
  const { canAccessAdmin } = usePermission()
  const { data: myRegistrations = [] } = useMyRegistrations()
  const activeRegistrations = useMemo(
    () => myRegistrations.filter((r) => r.status !== 'cancelled'),
    [myRegistrations]
  )
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
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-white/10 bg-[#0D0E12] text-white shadow-md transition-colors">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left: Brand Wordmark & Primary 4-Tab Destinations */}
        <div className="flex min-w-0 items-center gap-7">
          <Link
            to="/"
            onClick={closeMenus}
            aria-label="EventMesh home"
            className="flex items-center gap-2.5 group shrink-0"
          >
            <span className="h-8 w-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs tracking-wider shadow-xs group-hover:scale-105 transition-transform font-mono">
              EM
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base text-white tracking-tight leading-none">
                EventMesh
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 leading-tight">
                CTU Campus
              </span>
            </div>
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-1.5 md:flex">
            {destinations.map(({ label, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  cn(
                    'whitespace-nowrap text-xs font-semibold tracking-wide transition-all px-3 py-1.5 rounded-lg',
                    isActive
                      ? 'text-white bg-white/15 font-bold shadow-xs'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Center: Low-Profile Search Dock (Linear / Raycast Style) */}
        <div className="hidden sm:flex flex-1 justify-center max-w-xs md:max-w-sm lg:max-w-md mx-2">
          <button
            type="button"
            onClick={onSearchOpen}
            aria-label="Search events and clubs"
            className="flex w-full items-center gap-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 px-3.5 h-9 text-xs text-white/60 hover:text-white transition-all shadow-xs group cursor-pointer"
          >
            <MagnifyingGlass size={15} className="text-white/50 group-hover:text-accent-hover transition-colors shrink-0" />
            <span className="truncate font-sans text-xs">Search events, clubs, venues...</span>
            <kbd className="ml-auto hidden rounded border border-white/15 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/60 lg:inline-block shadow-2xs">
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
            className="sm:hidden grid h-9 w-9 place-items-center rounded-xl border border-white/15 text-white/80 hover:bg-white/10 transition-colors"
          >
            <MagnifyingGlass size={16} />
          </button>

          {/* Notifications Inbox */}
          <NotificationInbox className="border-white/15 text-white/80 hover:text-white hover:border-white/30 hover:bg-white/10" />

          {/* Unauthenticated Mode: Direct Theme Switcher + Sign In */}
          {!isAuthenticated && (
            <div className="hidden sm:flex items-center gap-2">
              <ThemeToggle className="border-white/15 bg-white/10 text-white hover:border-white/30 hover:bg-white/15" />
              <Link
                to="/login"
                onClick={closeMenus}
                className="inline-flex h-9 items-center rounded-xl bg-white text-black hover:bg-accent hover:text-white px-4 text-xs font-semibold tracking-wide shadow-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Authenticated Mode: My Passes Button & Profile Squircle */}
          {isAuthenticated && (
            <div className="relative flex items-center gap-2" ref={dropdownRef}>
              {/* High-Visibility My Passes Action Pill */}
              <Link
                to="/attendee/dashboard?tab=passes"
                onClick={closeMenus}
                aria-label="My Passes"
                title="View My Passes & Tickets"
                className="relative inline-flex items-center gap-2 h-9 px-3.5 rounded-xl border border-violet-400/40 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs tracking-tight transition-all shadow-xs active:scale-95"
              >
                <Ticket size={15} weight="bold" />
                <span>My Passes</span>
                {activeRegistrations.length > 0 && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-mono font-bold rounded-full bg-white text-violet-700">
                    {activeRegistrations.length}
                  </span>
                )}
              </Link>

              {/* Profile Squircle Button */}
              <button
                type="button"
                onClick={() => setAccountOpen(!accountOpen)}
                aria-label="User profile menu"
                aria-expanded={accountOpen}
                className={cn(
                  'relative inline-flex items-center justify-center h-9 w-9 rounded-xl border font-mono text-xs font-bold transition-all shadow-xs active:scale-95 overflow-hidden cursor-pointer',
                  accountOpen
                    ? 'border-accent ring-2 ring-accent/30 bg-white/20 text-white'
                    : 'border-white/15 hover:border-white/30 bg-white/5 text-white'
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
                  className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-line bg-card p-2 text-sm shadow-[0_20px_50px_-10px_rgba(124,58,237,0.15)] z-50 animate-in fade-in zoom-in-95 duration-100"
                  role="menu"
                  aria-orientation="vertical"
                >
                  {/* User Profile Header Card */}
                  <div className="p-3 rounded-xl bg-surface-subtle border border-line mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg overflow-hidden bg-accent text-white flex items-center justify-center shrink-0 font-bold text-xs font-mono shadow-xs">
                        {userAvatar ? (
                          <img src={userAvatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span>{userInitials}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-ink truncate leading-tight">
                          {session?.name || 'Suraj Naik'}
                        </p>
                        <p className="text-[11px] font-mono text-ink-muted truncate leading-tight mt-0.5">
                          {session?.email || 'ceosuraj@email.com'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-line flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                        Campus
                      </span>
                      <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider bg-accent-soft px-1.5 py-0.5 rounded border border-accent/20">
                        {canAccessAdmin() ? 'CTU Lead' : 'CTU Passholder'}
                      </span>
                    </div>
                  </div>

                  {/* Core Navigation Options */}
                  <div className="space-y-0.5 py-1">
                    <Link
                      to="/attendee/dashboard?tab=profile"
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-ink-soft hover:bg-surface-subtle hover:text-ink transition-colors"
                    >
                      <User size={15} className="text-ink-muted shrink-0" />
                      <span>My Profile Card</span>
                    </Link>

                    <Link
                      to="/attendee/dashboard?tab=passes"
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-ink-soft hover:bg-surface-subtle hover:text-accent transition-colors"
                    >
                      <Ticket size={15} className="text-ink-muted shrink-0" />
                      <span>My Passes ({activeRegistrations.length})</span>
                    </Link>

                    <Link
                      to="/my-college"
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-ink-soft hover:bg-surface-subtle hover:text-ink transition-colors"
                    >
                      <Users size={15} className="text-ink-muted shrink-0" />
                      <span>My College Hub</span>
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-line my-1" />

                  {/* Open Admin / Organizer Studio Button */}
                  {session?.role === 'super_admin' || (Boolean(session?.email) && session?.email?.toLowerCase().trim() === 'nayaklabs.ai@gmail.com') ? (
                    <div className="space-y-1">
                      <Link
                        to="/superadmin"
                        onClick={closeMenus}
                        className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold bg-accent text-white hover:bg-accent/90 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-white" />
                          <span>Superadmin Console</span>
                        </span>
                        <span className="font-mono text-[10px] uppercase opacity-90 font-bold bg-white/20 px-1.5 py-0.5 rounded">Root</span>
                      </Link>
                      <Link
                        to="/admin"
                        onClick={closeMenus}
                        className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold bg-accent-soft text-accent hover:bg-accent hover:text-white transition-colors group"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-accent group-hover:bg-white" />
                          <span>Organizer Studio</span>
                        </span>
                        <span className="font-mono text-[10px] uppercase opacity-80">Desk →</span>
                      </Link>
                    </div>
                  ) : canAccessAdmin() ? (
                    <Link
                      to="/admin"
                      onClick={closeMenus}
                      className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold bg-accent-soft text-accent hover:bg-accent hover:text-white transition-colors group"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent group-hover:bg-white" />
                        <span>Organizer Studio</span>
                      </span>
                      <span className="font-mono text-[10px] uppercase opacity-80">Desk →</span>
                    </Link>
                  ) : null}

                  {/* Divider */}
                  <div className="border-t border-line my-1" />

                  {/* Embedded Theme Toggle Row */}
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-surface-subtle">
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
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-danger hover:bg-danger/10 transition-colors cursor-pointer"
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
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 text-white/90 hover:bg-white/10 transition-colors md:hidden cursor-pointer"
          >
            {mobileOpen ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (100% Solid Opaque High-Contrast) */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-white/10 bg-[#0D0E12] text-white px-4 py-4 md:hidden space-y-2 shadow-2xl"
        >
          {destinations.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              onClick={closeMenus}
              aria-current={location.pathname === path ? 'page' : undefined}
              className="flex min-h-[44px] items-center border-b border-white/10 px-2 text-xs font-semibold tracking-wide text-white/90 last:border-b-0 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}

          <div className="pt-2 flex items-center justify-between border-t border-white/10">
            <span className="text-xs font-medium text-white/60">
              Appearance
            </span>
            <ThemeToggle />
          </div>

          {isAuthenticated ? (
            <div className="pt-3 space-y-2">
              <Link
                to="/attendee/dashboard?tab=passes"
                onClick={closeMenus}
                className="flex items-center justify-center gap-2 w-full text-center py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-xs active:scale-[0.98] transition-transform"
              >
                <Ticket size={16} weight="bold" />
                <span>My Passes ({activeRegistrations.length})</span>
              </Link>
              <Link
                to="/admin"
                onClick={closeMenus}
                className="block w-full text-center py-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                ⚡ Organizer Studio
              </Link>
              {session?.role === 'super_admin' || (Boolean(session?.email) && session?.email?.toLowerCase().trim() === 'nayaklabs.ai@gmail.com') ? (
                <>
                  <Link
                    to="/superadmin"
                    onClick={closeMenus}
                    className="block text-center py-2 text-xs font-bold uppercase tracking-[0.08em] text-accent bg-accent/10 rounded-[8px]"
                  >
                    Superadmin console
                  </Link>
                  <Link
                    to="/admin"
                    onClick={closeMenus}
                    className="block text-center py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-white/80 hover:text-white"
                  >
                    Organizer studio
                  </Link>
                </>
              ) : canAccessAdmin() && (
                <Link
                  to="/admin"
                  onClick={closeMenus}
                  className="block text-center py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/80 hover:text-white"
                >
                  Admin console
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  closeMenus()
                  logout()
                }}
                className="block w-full text-center py-2 text-xs font-semibold text-red-400 hover:underline cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={closeMenus}
              className="block w-full text-center py-2.5 rounded-xl bg-white text-black hover:bg-accent hover:text-white text-xs font-semibold shadow-xs active:scale-[0.98] transition-transform"
            >
              Sign In
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
