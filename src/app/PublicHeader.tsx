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
          'fixed top-0 left-0 right-0 z-50 h-14 bg-white/95 backdrop-blur-md text-[#0A0A0A] border-b border-[#E2E8F0] select-none transition-colors'
        )}
      >
        <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 font-mono">
          {/* Left: Brand Logo & Campus Selector */}
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2.5 group focus:outline-none"
              aria-label="EventMesh Home"
            >
              {/* Electric Cobalt Monogram Mark */}
              <div className="w-7 h-7 bg-[#0047FF] text-white flex items-center justify-center font-bold text-xs tracking-wider transition-opacity group-hover:opacity-90">
                EM
              </div>
              <span className="font-mono text-sm sm:text-base font-bold tracking-widest text-[#0A0A0A] uppercase">
                EventMesh
              </span>
            </Link>

            {/* City / Campus Selector */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setIsCityOpen(!isCityOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-slate-700 hover:text-[#0A0A0A] border border-[#E2E8F0] hover:border-[#0047FF]/50 text-xs transition-colors"
                aria-label="Select campus or city"
                aria-expanded={isCityOpen}
              >
                <MapPin className="w-3 h-3 text-[#0047FF]" />
                <span className="truncate max-w-[160px] uppercase">{selectedCity.split('·')[0].trim()}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {isCityOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-[#E2E8F0] shadow-xl py-1 z-50 text-xs">
                  <div className="px-3 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[11px] border-b border-[#E2E8F0]">
                    CAMPUS LOCATIONS
                  </div>
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city)
                        setIsCityOpen(false)
                      }}
                      className={cn(
                        'w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors',
                        selectedCity === city
                          ? 'text-[#0047FF] font-semibold bg-[#0047FF]/10 border-l-2 border-[#0047FF]'
                          : 'text-slate-700 hover:bg-[#F8FAFC] hover:text-[#0A0A0A]'
                      )}
                    >
                      <span className="uppercase">{city}</span>
                      {selectedCity === city && <span className="w-1.5 h-1.5 bg-[#0047FF]" />}
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
              className="w-full h-8 flex items-center justify-between px-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-slate-500 hover:text-[#0A0A0A] border border-[#E2E8F0] hover:border-[#0047FF]/50 text-xs transition-colors text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span className="truncate">Search catalog (symposiums, hackathons...)</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[11px] bg-white border border-[#E2E8F0] text-slate-500">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Navigation, Host Event & Account */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 text-xs">
            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-3 mr-2">
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path)
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      'py-1 text-xs uppercase tracking-wider transition-colors',
                      isActive
                        ? 'text-[#0047FF] font-semibold border-b-2 border-[#0047FF]'
                        : 'text-slate-600 hover:text-[#0047FF]'
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
              className="lg:hidden p-1.5 text-slate-600 hover:text-[#0A0A0A] transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Host Event / Admin Dashboard Button */}
            {canAccessAdmin() ? (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 bg-[#F8FAFC] text-[#0047FF] hover:bg-[#EFF4FF] border border-[#E2E8F0] hover:border-[#0047FF] text-xs font-semibold uppercase transition-colors"
              >
                <LayoutDashboard className="w-3 h-3" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/admin/events/new"
                className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 bg-[#F8FAFC] text-slate-700 hover:text-[#0047FF] border border-[#E2E8F0] hover:border-[#0047FF] text-xs uppercase transition-colors"
              >
                <span>Host event</span>
              </Link>
            )}

            {/* Account Menu / Sign In */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="flex items-center gap-1.5 h-8 px-2 bg-[#F8FAFC] border border-[#E2E8F0] text-slate-700 hover:border-[#0047FF] text-xs transition-colors"
                  aria-label="Account menu"
                  aria-expanded={isAccountOpen}
                >
                  <div className="w-5 h-5 bg-[#0047FF] text-white flex items-center justify-center font-bold text-[11px]">
                    {(session?.name || 'U')[0].toUpperCase()}
                  </div>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {isAccountOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2E8F0] shadow-xl py-1 z-50 text-slate-800 text-xs">
                    <div className="px-3 py-2 border-b border-[#E2E8F0]">
                      <p className="font-semibold text-[#0A0A0A] truncate">{session?.name}</p>
                      <p className="text-slate-500 truncate text-[11px]">{session?.email}</p>
                    </div>

                    <Link
                      to="/attendee/dashboard"
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:text-[#0047FF] hover:bg-[#EFF4FF] transition-colors"
                    >
                      <Ticket className="w-3.5 h-3.5 text-[#0047FF]" />
                      <span>My tickets & credentials</span>
                    </Link>

                    {canAccessAdmin() && (
                      <Link
                        to="/admin"
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:text-[#0047FF] hover:bg-[#EFF4FF] transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#0047FF]" />
                        <span>Admin dashboard</span>
                      </Link>
                    )}

                    <div className="border-t border-[#E2E8F0] my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountOpen(false)
                        logout()
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="h-8 px-4 bg-[#0047FF] hover:bg-[#0037CC] text-white font-semibold text-xs uppercase tracking-wider inline-flex items-center justify-center transition-colors shadow-sm"
              >
                Sign in
              </Link>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-slate-600 hover:text-[#0A0A0A] transition-colors"
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
