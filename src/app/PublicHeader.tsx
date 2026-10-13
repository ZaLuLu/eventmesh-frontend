// Hallmark macrostructure: PageHeader / Navigation
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  MagnifyingGlass,
  Ticket,
  Compass,
  Users,
  CalendarBlank,
  Sparkle,
  List,
  SignOut,
  Gauge,
  CaretDown,
} from '@/design-system/Icon'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { hasMultipleCampuses, APP_CONFIG, CampusLocation } from '@/config/appConfig'
import { SoundToggleButton } from '@/design-system/SoundProvider'
import { NotificationInbox } from '@/features/notifications/NotificationInbox'
import { Sheet } from '@/design-system/primitives/Sheet'
import { cn } from '@/lib/utils'

interface PublicHeaderProps {
  onSearchOpen: () => void
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ onSearchOpen }) => {
  const location = useLocation()
  const { session, isAuthenticated, logout } = useAuth()
  const { canAccessAdmin } = usePermission()

  const [isScrolled, setIsScrolled] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedCampus, setSelectedCampus] = useState(APP_CONFIG.campuses[0]?.name || 'Main Campus')
  const [isCampusOpen, setIsCampusOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Explore', path: '/explore', icon: <Compass size={16} weight="bold" /> },
    { label: 'Clubs', path: '/clubs', icon: <Users size={16} weight="bold" /> },
    { label: 'Calendar', path: '/calendar', icon: <CalendarBlank size={16} weight="bold" /> },
    { label: 'About', path: '/about', icon: <Sparkle size={16} weight="bold" /> },
  ]

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 h-16 bg-paper/90 backdrop-blur-md select-none transition-all duration-200',
          isScrolled
            ? 'border-b border-ink/10 shadow-[0_4px_12px_rgba(21,17,48,0.04)]'
            : 'border-b border-transparent'
        )}
      >
        <div className="max-w-[1320px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          {/* Left: Brand Wordmark */}
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt rounded-lg"
              aria-label="EventMesh Home"
            >
              {/* Tactile Stamp Icon */}
              <div className="w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center font-display font-black text-xs shadow-offset transition-transform duration-200 group-hover:-rotate-6 group-hover:bg-cobalt">
                EM
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-ink flex items-baseline">
                Event
                <span className="font-accent italic text-cobalt font-normal text-2xl -ml-0.5 mr-0.5">
                  M
                </span>
                esh
              </span>
            </Link>

            {/* Campus Switcher: Only displayed if multiple campuses are configured (F-09) */}
            {hasMultipleCampuses() && (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setIsCampusOpen(!isCampusOpen)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-paper-2 hover:bg-paper text-ink border border-ink/15 rounded-full text-xs font-medium transition-colors"
                  aria-expanded={isCampusOpen}
                >
                  <span className="truncate max-w-[140px]">{selectedCampus}</span>
                  <CaretDown size={12} weight="bold" />
                </button>

                {isCampusOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-card border border-ink/15 rounded-xl shadow-offset py-1 z-50 text-xs">
                    {APP_CONFIG.campuses.map((campus: CampusLocation) => (
                      <button
                        key={campus.id}
                        onClick={() => {
                          setSelectedCampus(campus.name)
                          setIsCampusOpen(false)
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 flex items-center justify-between hover:bg-paper-2 transition-colors',
                          selectedCampus === campus.name ? 'font-bold text-cobalt' : 'text-ink'
                        )}
                      >
                        <span>{campus.name}</span>
                        {selectedCampus === campus.name && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cobalt" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Middle: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path)
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-ink text-paper font-semibold shadow-offset'
                      : 'text-ink/80 hover:text-ink hover:bg-paper-2'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right: Search, Sound, Notifications, My Tickets, Auth */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* Quick Search Button */}
            <button
              type="button"
              onClick={onSearchOpen}
              className="hidden lg:flex items-center gap-2 h-9 px-3 bg-paper-2 hover:bg-paper text-ink/70 hover:text-ink border border-ink/15 rounded-full text-xs transition-colors"
              aria-label="Search catalog"
            >
              <MagnifyingGlass size={14} weight="bold" className="text-ink/60" />
              <span className="text-xs">Search...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-card border border-ink/15 rounded text-ink/70 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Mobile / Tablet search icon */}
            <button
              type="button"
              onClick={onSearchOpen}
              className="lg:hidden p-2 text-ink/80 hover:text-ink hover:bg-paper-2 rounded-full transition-colors"
              aria-label="Search events"
            >
              <MagnifyingGlass size={18} weight="bold" />
            </button>

            {/* Sound Toggle Button (F-14) */}
            <SoundToggleButton />

            {/* Notification Inbox Popover (F-04) */}
            <NotificationInbox />

            {/* My Tickets Pill (Section 7.1) */}
            <Link
              to="/attendee/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-card hover:bg-paper-2 text-ink font-semibold text-xs border border-ink shadow-offset hover:-translate-y-0.5 active:translate-y-0 transition-all"
              aria-label="My tickets"
            >
              <Ticket size={15} weight="bold" className="text-cobalt" />
              <span>My tickets</span>
            </Link>

            {/* Host Event / Dashboard Link */}
            {canAccessAdmin() && (
              <Link
                to="/admin"
                className="hidden xl:inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-lime text-ink font-semibold text-xs border border-ink shadow-offset hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <Gauge size={14} weight="bold" />
                <span>Admin</span>
              </Link>
            )}

            {/* User Account / Sign In */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="flex items-center gap-1.5 h-9 px-2 bg-paper-2 hover:bg-paper border border-ink/15 rounded-full text-ink text-xs transition-colors"
                  aria-label="Account menu"
                  aria-expanded={isAccountOpen}
                >
                  <div className="w-6 h-6 rounded-full bg-cobalt text-white flex items-center justify-center font-display font-bold text-xs">
                    {(session?.name || 'U')[0].toUpperCase()}
                  </div>
                  <CaretDown size={12} weight="bold" className="opacity-70" />
                </button>

                {isAccountOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-card border border-ink/15 rounded-2xl shadow-offset py-1.5 z-50 text-xs">
                    <div className="px-3.5 py-2 border-b border-ink/10">
                      <p className="font-bold text-ink truncate">{session?.name}</p>
                      <p className="text-ink-soft truncate text-[11px] font-mono">{session?.email}</p>
                    </div>

                    <Link
                      to="/attendee/dashboard"
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-ink hover:text-cobalt hover:bg-paper-2 transition-colors font-medium"
                    >
                      <Ticket size={14} weight="bold" className="text-cobalt" />
                      <span>My tickets & ID badge</span>
                    </Link>

                    {canAccessAdmin() && (
                      <Link
                        to="/admin"
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-ink hover:text-cobalt hover:bg-paper-2 transition-colors font-medium"
                      >
                        <Gauge size={14} weight="bold" className="text-cobalt" />
                        <span>Admin console</span>
                      </Link>
                    )}

                    <div className="border-t border-ink/10 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountOpen(false)
                        logout()
                      }}
                      className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                    >
                      <SignOut size={14} weight="bold" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="h-9 px-4 bg-ink text-paper hover:bg-cobalt rounded-full font-semibold text-xs tracking-wide inline-flex items-center justify-center shadow-offset hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Sign in
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-ink hover:text-cobalt rounded-full transition-colors"
              aria-label="Open mobile navigation menu"
            >
              <List size={22} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation (using Sheet primitive) */}
      <Sheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="EventMesh"
        subtitle="Campus events & club culture"
      >
        <div className="space-y-6 pt-2">
          {/* Quick Search */}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false)
              onSearchOpen()
            }}
            className="w-full h-11 flex items-center justify-between px-4 rounded-xl bg-paper-2 border border-ink/15 text-ink-soft text-sm"
          >
            <div className="flex items-center gap-2">
              <MagnifyingGlass size={16} weight="bold" />
              <span>Search events & clubs...</span>
            </div>
            <kbd className="px-2 py-0.5 rounded text-xs bg-card border border-ink/15 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Nav links */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-ink-soft uppercase tracking-wider block px-2 mb-1">
              Browse
            </span>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-ink hover:bg-paper-2 transition-colors"
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-ink/10 space-y-2">
            <Link
              to="/attendee/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full h-11 rounded-full border border-ink bg-card text-ink font-semibold text-sm flex items-center justify-center gap-2 shadow-offset"
            >
              <Ticket size={16} weight="bold" className="text-cobalt" />
              <span>My tickets & ID badge</span>
            </Link>

            {canAccessAdmin() && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full h-11 rounded-full bg-lime text-ink font-semibold text-sm flex items-center justify-center gap-2 border border-ink shadow-offset"
              >
                <Gauge size={16} weight="bold" />
                <span>Admin Console</span>
              </Link>
            )}

            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full h-11 rounded-full bg-ink text-paper font-semibold text-sm flex items-center justify-center shadow-offset"
              >
                Sign in to EventMesh
              </Link>
            )}
          </div>
        </div>
      </Sheet>
    </>
  )
}
