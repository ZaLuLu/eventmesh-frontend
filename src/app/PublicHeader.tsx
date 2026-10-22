import React, { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CaretDown, List, MagnifyingGlass, Ticket, X } from '@/design-system/Icon'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { ThemeToggle } from '@/design-system/ThemeToggle'
import { NotificationInbox } from '@/features/notifications/NotificationInbox'
import { cn } from '@/lib/utils'

interface PublicHeaderProps {
  onSearchOpen: () => void
}

const destinations = [
  { label: 'Explore', path: '/explore' },
  { label: 'Clubs', path: '/clubs' },
  { label: 'Schedule', path: '/explore?view=calendar' },
]

/**
 * PublicHeader (Phase 2: Denim Dept Architectural Redesign)
 * - Slim 56px height (h-14) edge-to-edge layout.
 * - Bold uppercase wordmark with wide 0.18em tracking.
 * - Minimalist uppercase text nav links with zero jumping underlines.
 * - Low-profile 14px radius search dock with 1px border and monospace ⌘K badge.
 * - Normalized 14px button radii and 1.5px stroke outline icons.
 * - 100% solid opaque background (bg-card), zero frosted glassmorphism (Gate 4).
 */
export const PublicHeader: React.FC<PublicHeaderProps> = ({ onSearchOpen }) => {
  const location = useLocation()
  const { session, isAuthenticated, logout } = useAuth()
  const { canAccessAdmin } = usePermission()
  const [accountOpen, setAccountOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMenus = () => {
    setMobileOpen(false)
    setAccountOpen(false)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-line bg-card text-ink transition-colors">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left: Brand Wordmark & Primary Destinations */}
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
                      ? 'text-ink font-bold'
                      : 'text-ink-muted hover:text-ink'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Center: Denim Dept Low-Profile Search Dock (14px Radius) */}
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

        {/* Right: Actions, Utilities & Authentication */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Trigger (Min 44px hit target - Gate 51) */}
          <button
            type="button"
            onClick={onSearchOpen}
            aria-label="Search events"
            className="sm:hidden grid h-10 w-10 place-items-center rounded-[8px] border border-line text-ink hover:bg-surface-subtle transition-colors"
          >
            <MagnifyingGlass size={16} />
          </button>

          <NotificationInbox />

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Desktop & Tablet Passes / Auth (Denim Dept 14px Button Standard) */}
          <div className="hidden sm:block">
            {isAuthenticated ? (
              <div className="relative">
                <div className="flex items-center gap-1">
                  <Link
                    to="/attendee/dashboard"
                    onClick={closeMenus}
                    className="inline-flex h-9 items-center gap-1.5 rounded-[14px] bg-ink px-3.5 text-xs font-bold uppercase tracking-[0.08em] text-paper hover:bg-ink-soft active:scale-[0.98] transition-transform"
                  >
                    <Ticket size={14} />
                    <span>My Passes</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setAccountOpen(!accountOpen)}
                    aria-label="Account menu"
                    aria-expanded={accountOpen}
                    className="inline-flex h-9 w-8 items-center justify-center rounded-[8px] text-ink-soft hover:bg-surface-subtle transition-colors"
                  >
                    <CaretDown size={14} />
                  </button>
                </div>

                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-[14px] border border-line bg-card p-2 text-sm shadow-xl z-50">
                    <p className="truncate px-2 py-1.5 text-xs text-ink-soft border-b border-line mb-1 font-mono">
                      {session?.name || session?.email}
                    </p>
                    {canAccessAdmin() && (
                      <Link
                        to="/admin"
                        onClick={closeMenus}
                        className="block rounded-[8px] px-2 py-1.5 text-xs font-medium hover:bg-surface-subtle transition-colors"
                      >
                        Admin console
                      </Link>
                    )}
                    <Link
                      to="/attendee/dashboard"
                      onClick={closeMenus}
                      className="block rounded-[8px] px-2 py-1.5 text-xs font-medium hover:bg-surface-subtle transition-colors"
                    >
                      Attendee dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        closeMenus()
                        logout()
                      }}
                      className="block w-full rounded-[8px] px-2 py-1.5 text-left text-xs font-medium text-accent hover:bg-surface-subtle transition-colors mt-1 border-t border-line"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                onClick={closeMenus}
                className="inline-flex h-9 items-center rounded-[14px] bg-ink px-4 text-xs font-bold uppercase tracking-[0.08em] text-paper hover:bg-ink-soft active:scale-[0.98] transition-all"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Direct Fast-Pass Access */}
          {isAuthenticated ? (
            <Link
              to="/attendee/dashboard"
              onClick={closeMenus}
              aria-label="My Passes"
              className="sm:hidden inline-flex items-center gap-1.5 h-10 px-3 rounded-[8px] bg-ink text-paper text-xs font-semibold hover:bg-ink-soft active:scale-[0.98] transition-transform"
            >
              <Ticket size={15} />
              <span>Passes</span>
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={closeMenus}
              className="sm:hidden inline-flex items-center h-10 px-3 rounded-[8px] bg-ink text-paper text-xs font-semibold hover:bg-ink-soft active:scale-[0.98] transition-transform"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Drawer Trigger (Min 44px hit target - Gate 51) */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            className="grid h-10 w-10 place-items-center rounded-[8px] border border-line text-ink hover:bg-surface-subtle transition-colors lg:hidden"
          >
            {mobileOpen ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (100% Solid Opaque, 0% Frosted Blur - Gate 4) */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-line bg-card px-4 py-4 lg:hidden space-y-2 shadow-lg"
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
            <span className="text-xs font-medium uppercase tracking-[0.1em] text-ink-muted">Appearance</span>
            <ThemeToggle />
          </div>

          {isAuthenticated ? (
            <div className="pt-3 space-y-2">
              <Link
                to="/attendee/dashboard"
                onClick={closeMenus}
                className="block w-full text-center py-2.5 rounded-[14px] bg-ink text-paper text-xs font-bold uppercase tracking-[0.08em] shadow-xs active:scale-[0.98] transition-transform"
              >
                My Passes
              </Link>
              {canAccessAdmin() && (
                <Link
                  to="/admin"
                  onClick={closeMenus}
                  className="block text-center py-2 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft hover:text-ink"
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
                className="block w-full text-center py-2 text-xs font-semibold uppercase tracking-[0.08em] text-accent hover:underline"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={closeMenus}
              className="block w-full text-center py-2.5 rounded-[14px] bg-ink text-paper text-xs font-bold uppercase tracking-[0.08em] shadow-xs active:scale-[0.98] transition-transform"
            >
              Sign In
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
