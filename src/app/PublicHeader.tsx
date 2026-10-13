// Hallmark macrostructure: PageHeader / N5 Floating Iris Pill
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
  X,
} from '@/design-system/Icon'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { hasMultipleCampuses, APP_CONFIG, CampusLocation } from '@/config/appConfig'
import { SoundToggleButton } from '@/design-system/SoundProvider'
import { NotificationInbox } from '@/features/notifications/NotificationInbox'
import { DiscoveryDrawer } from '@/features/events/components/DiscoveryDrawer'
import { LanyardProfileOverlay } from '@/features/dashboard/components/LanyardProfileOverlay'
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
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false)
  const [isLanyardOpen, setIsLanyardOpen] = useState(false)
  const [selectedCampus, setSelectedCampus] = useState(APP_CONFIG.campuses[0]?.name || 'Main Campus')
  const [isCampusOpen, setIsCampusOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Explore', path: '/explore' },
    { label: 'Clubs', path: '/clubs' },
    { label: 'Calendar', path: '/calendar' },
    { label: 'About', path: '/about' },
  ]

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-[padding,background-color,border-color] duration-200 pointer-events-none',
          isScrolled ? 'pt-2.5' : 'pt-4'
        )}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div
            className={cn(
              'pointer-events-auto h-13 px-4 sm:px-5 flex items-center justify-between gap-3 rounded-full transition-all duration-200',
              'bg-[var(--color-paper)]/85 backdrop-blur-xl border border-[var(--color-line)] shadow-[0_2px_12px_-2px_rgba(20,17,29,0.06)]'
            )}
          >
            {/* Left: Hamburger Discovery Trigger, Minimal Wordmark & Campus Tag */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsDiscoveryOpen(true)}
                className="p-1.5 text-ink-soft hover:text-ink hover:bg-surface-subtle rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                title="Filter events by category & club"
                aria-label="Open discovery drawer"
              >
                <List size={18} weight="bold" />
              </button>

              <Link
                to="/"
                className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full"
                aria-label="EventMesh Home"
              >
                <div className="w-7 h-7 rounded-full bg-ink text-paper flex items-center justify-center font-sans font-bold text-xs tracking-tight transition-colors group-hover:bg-accent group-hover:text-white">
                  EM
                </div>
                <span className="font-sans font-semibold text-base tracking-tight text-ink">
                  EventMesh
                </span>
              </Link>

              {/* Campus Selector (if multiple) */}
              {hasMultipleCampuses() && (
                <div className="relative hidden md:block">
                  <button
                    type="button"
                    onClick={() => setIsCampusOpen(!isCampusOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-ink-soft hover:text-ink rounded-full transition-colors"
                  >
                    <span className="truncate max-w-[130px] font-mono">{selectedCampus}</span>
                    <CaretDown size={11} weight="bold" />
                  </button>

                  {isCampusOpen && (
                    <div className="absolute left-0 mt-2 w-44 bg-card border border-line rounded-xl shadow-lg py-1 z-50 text-xs">
                      {APP_CONFIG.campuses.map((campus: CampusLocation) => (
                        <button
                          key={campus.id}
                          onClick={() => {
                            setSelectedCampus(campus.name)
                            setIsCampusOpen(false)
                          }}
                          className={cn(
                            'w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-surface-subtle transition-colors',
                            selectedCampus === campus.name ? 'font-semibold text-accent' : 'text-ink'
                          )}
                        >
                          <span>{campus.name}</span>
                          {selectedCampus === campus.name && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Middle: Minimal Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path)
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      'relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-150',
                      isActive
                        ? 'text-ink font-semibold'
                        : 'text-ink-soft hover:text-ink hover:bg-surface-subtle/70'
                    )}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Right: Quick Search, Sound, Notification, Wallet, Account */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Quick Search Trigger */}
              <button
                type="button"
                onClick={onSearchOpen}
                className="hidden lg:flex items-center gap-2 h-8 px-3 bg-surface-subtle/80 hover:bg-surface-subtle text-ink-soft hover:text-ink rounded-full text-xs transition-colors"
                aria-label="Search catalog"
              >
                <MagnifyingGlass size={13} weight="bold" />
                <span className="text-xs">Search</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-card rounded text-ink-soft font-mono">
                  ⌘K
                </kbd>
              </button>

              <button
                type="button"
                onClick={onSearchOpen}
                className="lg:hidden p-1.5 text-ink-soft hover:text-ink rounded-full transition-colors"
                aria-label="Search events"
              >
                <MagnifyingGlass size={16} weight="bold" />
              </button>

              {/* Sound & Notifications */}
              <SoundToggleButton />
              <NotificationInbox />

              {/* My Tickets Pill */}
              <Link
                to="/attendee/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-surface-subtle hover:bg-accent-soft text-ink hover:text-accent font-medium text-xs border border-line transition-colors"
                aria-label="My tickets"
              >
                <Ticket size={13} weight="bold" className="text-accent" />
                <span>Tickets</span>
              </Link>

              {/* Admin shortcut if permitted */}
              {canAccessAdmin() && (
                <Link
                  to="/admin"
                  className="hidden xl:inline-flex items-center gap-1 h-8 px-3 rounded-full bg-ink text-paper hover:bg-accent hover:text-white font-medium text-xs transition-colors"
                >
                  <Gauge size={13} weight="bold" />
                  <span>Admin</span>
                </Link>
              )}

              {/* User Account / Sign In */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAccountOpen(!isAccountOpen)}
                    className="flex items-center gap-1.5 h-8 px-1.5 bg-surface-subtle hover:bg-line/40 rounded-full text-ink text-xs transition-colors"
                    aria-label="Account menu"
                    aria-expanded={isAccountOpen}
                  >
                    <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center font-sans font-semibold text-[10px]">
                      {(session?.name || 'U')[0].toUpperCase()}
                    </div>
                    <CaretDown size={10} weight="bold" className="opacity-60" />
                  </button>

                  {isAccountOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-card border border-line rounded-xl shadow-xl py-1 z-50 text-xs">
                      <div className="px-3.5 py-2 border-b border-line">
                        <p className="font-semibold text-ink truncate">{session?.name}</p>
                        <p className="text-ink-soft truncate text-xs font-mono">{session?.email}</p>
                      </div>

                      <Link
                        to="/attendee/dashboard"
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-ink hover:text-accent hover:bg-surface-subtle transition-colors"
                      >
                        <Ticket size={14} weight="bold" className="text-accent" />
                        <span>Passes & Wallet</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountOpen(false)
                          setIsLanyardOpen(true)
                        }}
                        className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-ink hover:text-accent hover:bg-surface-subtle transition-colors"
                      >
                        <span className="w-3.5 h-3.5 rounded-full bg-accent/20 text-accent font-bold text-[9px] flex items-center justify-center">
                          ID
                        </span>
                        <span>3D Identity Pass</span>
                      </button>

                      {canAccessAdmin() && (
                        <Link
                          to="/admin"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 text-ink hover:text-accent hover:bg-surface-subtle transition-colors"
                        >
                          <Gauge size={14} weight="bold" className="text-accent" />
                          <span>Admin Console</span>
                        </Link>
                      )}

                      <div className="border-t border-line my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountOpen(false)
                          logout()
                        }}
                        className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-red-600 hover:bg-red-500/10 transition-colors"
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
                  className="inline-flex items-center justify-center h-8 px-3.5 rounded-full bg-ink text-paper hover:bg-accent hover:text-white font-medium text-xs transition-colors"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile hamburger button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-1.5 text-ink-soft hover:text-ink rounded-full"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X size={18} weight="bold" /> : <List size={18} weight="bold" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="pointer-events-auto md:hidden max-w-sm mx-auto mt-2 px-4">
            <div className="bg-card/95 backdrop-blur-xl border border-line rounded-2xl shadow-xl p-4 flex flex-col gap-2 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-ink hover:bg-surface-subtle transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-line my-1" />
              <Link
                to="/attendee/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-ink hover:bg-surface-subtle font-medium"
              >
                <Ticket size={16} weight="bold" className="text-accent" />
                <span>My Tickets</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Slide-out Discovery Drawer (Categories, Clubs & Fast Filters) */}
      <DiscoveryDrawer
        isOpen={isDiscoveryOpen}
        onClose={() => setIsDiscoveryOpen(false)}
      />

      {/* 3D Physics Lanyard Profile Experience */}
      <LanyardProfileOverlay
        isOpen={isLanyardOpen}
        onClose={() => setIsLanyardOpen(false)}
      />
    </>
  )
}
