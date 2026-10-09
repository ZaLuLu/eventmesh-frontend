import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Search,
  MapPin,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Ticket,
  Menu,
  X,
  Calendar,
  Compass,
  Users,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { Button } from '@/design-system/primitives/Button'
import { Sheet } from '@/design-system/primitives/Sheet'
import { cn } from '@/lib/utils'

interface PublicHeaderProps {
  onSearchOpen: () => void
}

const CITIES = ['Main Campus · Bangalore', 'North Campus · Delhi', 'Tech Hub · Hyderabad', 'West Pavilion · Mumbai']

export const PublicHeader: React.FC<PublicHeaderProps> = ({ onSearchOpen }) => {
  const location = useLocation()
  const { session, isAuthenticated, logout } = useAuth()
  const { canAccessAdmin } = usePermission()

  const [isScrolled, setIsScrolled] = useState(false)
  const [isCityOpen, setIsCityOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState(CITIES[0])
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isLanding = location.pathname === '/'

  // Listen to window scroll on landing page to switch transparent on-dark -> solid white
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    // Initial check
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Header style variations
  const isTransparent = isLanding && !isScrolled

  const navLinks = [
    { label: 'Explore', path: '/explore', icon: <Compass className="w-4 h-4" /> },
    { label: 'Clubs', path: '/clubs', icon: <Users className="w-4 h-4" /> },
    { label: 'Calendar', path: '/calendar', icon: <Calendar className="w-4 h-4" /> },
    { label: 'About', path: '/about', icon: <Sparkles className="w-4 h-4" /> },
  ]

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 h-16 transition-colors duration-300 select-none',
          isTransparent
            ? 'bg-transparent text-white border-transparent'
            : 'bg-surface/95 backdrop-blur-md text-ink border-b border-line shadow-xs'
        )}
      >
        <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Campus Selector */}
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-champion rounded-full"
              aria-label="EventMesh Home"
            >
              {/* Collegiate Monogram Mark */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm tracking-tight transition-transform duration-200 group-hover:scale-105',
                  isTransparent
                    ? 'bg-white text-champion shadow-sm'
                    : 'bg-champion text-white shadow-xs'
                )}
              >
                EM
              </div>
              <span
                className={cn(
                  'font-serif text-2xl tracking-tight transition-colors',
                  isTransparent ? 'text-white' : 'text-ink'
                )}
              >
                EventMesh
              </span>
            </Link>

            {/* City / Campus Selector */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setIsCityOpen(!isCityOpen)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200',
                  isTransparent
                    ? 'bg-white/10 hover:bg-white/15 text-white/90 border border-white/10'
                    : 'bg-lavender/40 hover:bg-lavender/60 text-ink-muted hover:text-ink border border-line'
                )}
                aria-label="Select campus or city"
                aria-expanded={isCityOpen}
              >
                <MapPin className={cn('w-3.5 h-3.5', isTransparent ? 'text-lavender' : 'text-champion')} />
                <span className="truncate max-w-[160px]">{selectedCity.split('·')[0].trim()}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {isCityOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-[18px] bg-surface border border-line shadow-floating py-1.5 z-50 text-ink">
                  <div className="px-3.5 py-1 text-[13px] font-semibold text-ink-subtle uppercase tracking-wider">
                    Campuses & Hubs
                  </div>
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city)
                        setIsCityOpen(false)
                      }}
                      className={cn(
                        'w-full text-left px-3.5 py-2 text-[14px] flex items-center justify-between transition-colors',
                        selectedCity === city
                          ? 'text-champion font-semibold bg-lavender/30'
                          : 'text-ink hover:bg-surface-sunken'
                      )}
                    >
                      <span>{city}</span>
                      {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-champion" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Middle: ⌘K Command Search Trigger */}
          <div className="flex-1 max-w-sm mx-auto hidden lg:block">
            <button
              type="button"
              onClick={onSearchOpen}
              className={cn(
                'w-full h-10 flex items-center justify-between px-3.5 rounded-full text-[13px] transition-all duration-200 text-left',
                isTransparent
                  ? 'bg-white/10 hover:bg-white/15 text-white/70 border border-white/15'
                  : 'bg-surface-sunken hover:bg-lavender/20 text-ink-muted border border-line hover:border-champion/30'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Search className="w-4 h-4 flex-shrink-0 opacity-80" />
                <span className="truncate">Search events, clubs, talks...</span>
              </div>
              <kbd
                className={cn(
                  'px-2 py-0.5 rounded-md text-[12px] font-mono border',
                  isTransparent
                    ? 'bg-white/10 border-white/20 text-white/80'
                    : 'bg-surface border-line text-ink-muted'
                )}
              >
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Navigation, Host Event & Account */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1 mr-1">
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path)
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-[14px] font-medium transition-colors',
                      isTransparent
                        ? isActive
                          ? 'text-white font-semibold bg-white/15'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                        : isActive
                        ? 'text-champion font-semibold bg-lavender/40'
                        : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {/* Mobile / Tablet Search Icon */}
            <button
              type="button"
              onClick={onSearchOpen}
              className={cn(
                'lg:hidden p-2 rounded-full transition-colors',
                isTransparent ? 'text-white hover:bg-white/10' : 'text-ink hover:bg-surface-sunken'
              )}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Host Event / Admin Dashboard Button */}
            {canAccessAdmin() ? (
              <Link
                to="/admin"
                className={cn(
                  'hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] font-semibold transition-all',
                  isTransparent
                    ? 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                    : 'bg-lavender text-champion hover:bg-lavender-200 border border-lavender-300'
                )}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/admin/events/new"
                className={cn(
                  'hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] font-medium transition-all',
                  isTransparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
                )}
              >
                <span>Host an event</span>
              </Link>
            )}

            {/* Account Menu / Sign In */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className={cn(
                    'flex items-center gap-2 h-9 px-2 rounded-full border transition-all duration-200 text-[13px]',
                    isTransparent
                      ? 'border-white/20 hover:bg-white/10 text-white'
                      : 'border-line hover:bg-surface-sunken text-ink'
                  )}
                  aria-label="Account menu"
                  aria-expanded={isAccountOpen}
                >
                  <div className="w-6 h-6 rounded-full bg-champion text-white flex items-center justify-center font-bold text-[12px]">
                    {(session?.name || 'U')[0].toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {isAccountOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-[18px] bg-surface border border-line shadow-floating py-1.5 z-50 text-ink">
                    <div className="px-3.5 py-2 border-b border-line">
                      <p className="text-[14px] font-semibold text-ink truncate">{session?.name}</p>
                      <p className="text-[13px] text-ink-muted truncate">{session?.email}</p>
                    </div>

                    <Link
                      to="/attendee/dashboard"
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-[14px] text-ink hover:bg-surface-sunken transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-champion" />
                      <span>My tickets & credentials</span>
                    </Link>

                    {canAccessAdmin() && (
                      <Link
                        to="/admin"
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-[14px] text-ink hover:bg-surface-sunken transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-champion" />
                        <span>Admin dashboard</span>
                      </Link>
                    )}

                    <div className="border-t border-line my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountOpen(false)
                        logout()
                      }}
                      className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-[14px] text-danger hover:bg-danger/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className={cn(
                  'h-9 px-4 rounded-full font-semibold text-[13px] inline-flex items-center justify-center transition-all shadow-xs',
                  isTransparent
                    ? 'bg-white text-champion hover:bg-white/90'
                    : 'bg-champion text-white hover:bg-champion-hover'
                )}
              >
                Sign in
              </Link>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className={cn(
                'md:hidden p-2 rounded-full transition-colors',
                isTransparent ? 'text-white hover:bg-white/10' : 'text-ink hover:bg-surface-sunken'
              )}
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation (using Sheet primitive) */}
      <Sheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="EventMesh Navigation"
        subtitle="Explore campus symposiums, hackathons & clubs"
      >
        <div className="space-y-6 pt-2">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false)
              onSearchOpen()
            }}
            className="w-full h-11 flex items-center justify-between px-4 rounded-[14px] bg-surface-sunken border border-line text-ink-muted text-[14px]"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>Search events & clubs...</span>
            </div>
            <kbd className="px-2 py-0.5 rounded text-[12px] bg-surface border border-line font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Nav links */}
          <div className="space-y-1">
            <span className="text-[13px] font-semibold text-ink-muted uppercase tracking-wider block px-2 mb-1">
              Browse
            </span>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[15px] font-medium text-ink hover:bg-lavender/30 transition-colors"
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Campus selection */}
          <div className="space-y-1 pt-2 border-t border-line">
            <span className="text-[13px] font-semibold text-ink-muted uppercase tracking-wider block px-2 mb-1">
              Campus
            </span>
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city)
                  setIsMobileMenuOpen(false)
                }}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-[12px] text-[14px] flex items-center justify-between',
                  selectedCity === city
                    ? 'text-champion font-semibold bg-lavender/30'
                    : 'text-ink hover:bg-surface-sunken'
                )}
              >
                <span>{city}</span>
                {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-champion" />}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-line space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/attendee/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full h-11 rounded-full border border-line text-ink font-semibold text-[14px] flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4 text-champion" />
                  <span>My tickets & passes</span>
                </Link>
                {canAccessAdmin() && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full h-11 rounded-full bg-lavender text-champion font-semibold text-[14px] flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full h-11 rounded-full bg-champion text-white font-semibold text-[14px] flex items-center justify-center"
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
