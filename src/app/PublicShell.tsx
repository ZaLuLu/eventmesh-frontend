import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Search,
  Calendar,
  Compass,
  Home,
  Ticket,
  User,
  MapPin,
  ChevronDown,
  LayoutDashboard,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { SearchModal } from './SearchModal'
import { ToastContainer } from '@/design-system/primitives/Toast'

export const PublicShell: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState('Bangalore')
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)

  const location = useLocation()
  const { session, isAuthenticated, logout } = useAuth()
  const { canAccessAdmin } = usePermission()

  const cities = ['Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Campus Alpha']

  const navLinks = [
    { label: 'Explore', path: '/explore' },
    { label: 'Clubs', path: '/clubs' },
    { label: 'Calendar', path: '/calendar' },
    { label: 'My tickets', path: '/attendee/dashboard' },
  ]

  const mobileTabs = [
    { label: 'Home', path: '/', icon: <Home className="h-5 w-5" /> },
    { label: 'Explore', path: '/explore', icon: <Compass className="h-5 w-5" /> },
    { label: 'Clubs', path: '/clubs', icon: <Calendar className="h-5 w-5" /> },
    { label: 'My tickets', path: '/attendee/dashboard', icon: <Ticket className="h-5 w-5" /> },
    {
      label: isAuthenticated ? 'Account' : 'Sign in',
      path: isAuthenticated ? '/attendee/dashboard' : '/login',
      icon: <User className="h-5 w-5" />,
    },
  ]

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans">
      {/* ==============================================================
          CALM CORAL HEADER
          Row 1 (64px): Wordmark, City, Centred Search (44px), Account Menu
          Row 2 (44px): Primary Nav Links with 2px accent underline on active
          Sticky elements <= 120px total on mobile
          ============================================================== */}
      <header className="sticky top-0 z-40 bg-surface border-b border-line">
        {/* Row 1: 64px Main Bar */}
        <div className="app-container h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Plain Wordmark + City Selector */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="h-8 w-8 rounded-[8px] bg-accent flex items-center justify-center text-on-accent font-semibold text-small">
                EM
              </span>
              <span className="font-semibold text-xl tracking-tight text-text">
                EventMesh
              </span>
            </Link>

            {/* City Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-[8px] text-small font-medium text-text-2 hover:text-text hover:bg-subtle transition-colors"
                aria-label="Select city"
                aria-expanded={isCityDropdownOpen}
              >
                <MapPin className="h-3.5 w-3.5 text-accent" />
                <span className="hidden sm:inline">{selectedCity}</span>
                <ChevronDown className="h-3.5 w-3.5 text-text-3" />
              </button>

              {isCityDropdownOpen && (
                <div className="absolute left-0 mt-1 w-44 rounded-[10px] bg-surface border border-line shadow-floating py-1 z-50">
                  <div className="px-3 py-1 text-caption font-semibold text-text-3">
                    Select city
                  </div>
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city)
                        setIsCityDropdownOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-small flex items-center justify-between transition-colors ${
                        selectedCity === city
                          ? 'text-accent font-semibold bg-accent-soft'
                          : 'text-text hover:bg-subtle'
                      }`}
                    >
                      <span>{city}</span>
                      {selectedCity === city && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Centred Search (44px height) - Shown on desktop (lg:block) */}
          <div className="flex-1 max-w-md mx-auto hidden lg:block">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="w-full h-11 flex items-center justify-between px-3.5 bg-subtle border border-line rounded-[10px] text-text-2 text-small hover:border-text-3 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Search className="h-4 w-4 text-text-3 flex-shrink-0" />
                <span className="truncate">Search events, clubs, or topics...</span>
              </div>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded-[6px] bg-surface border border-line text-caption text-text-3 font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Account Menu / Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Mobile & Tablet Search Icon Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="lg:hidden p-2 text-text-2 hover:text-text rounded-[8px]"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Dashboard Shortcut (Only for roles with admin access) */}
            {canAccessAdmin() && (
              <Link
                to="/admin"
                className="hidden md:inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[10px] bg-subtle hover:bg-line text-text text-small font-semibold transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-accent" />
                <span>Dashboard</span>
              </Link>
            )}

            {/* One Account Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="flex items-center gap-2 h-10 px-2.5 rounded-[10px] hover:bg-subtle border border-line transition-colors text-small"
                  aria-label="Account menu"
                  aria-expanded={isAccountMenuOpen}
                >
                  <div className="h-6 w-6 rounded-full bg-accent text-on-accent flex items-center justify-center font-semibold text-caption">
                    {(session?.name || 'U')[0].toUpperCase()}
                  </div>
                  <span className="hidden md:inline font-medium text-text max-w-[100px] truncate">
                    {session?.name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-text-3" />
                </button>

                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-1 w-52 rounded-[10px] bg-surface border border-line shadow-floating py-1.5 z-50">
                    <div className="px-3 py-2 border-b border-line">
                      <p className="text-small font-semibold text-text truncate">{session?.name}</p>
                      <p className="text-caption text-text-2 truncate">{session?.email}</p>
                    </div>

                    <Link
                      to="/attendee/dashboard"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-small text-text hover:bg-subtle transition-colors"
                    >
                      <Ticket className="h-4 w-4 text-text-2" />
                      <span>My tickets & passes</span>
                    </Link>

                    {canAccessAdmin() && (
                      <Link
                        to="/admin"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-small text-text hover:bg-subtle transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-accent" />
                        <span>Admin dashboard</span>
                      </Link>
                    )}

                    <div className="border-t border-line my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountMenuOpen(false)
                        logout()
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-small text-danger hover:bg-danger/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="h-10 px-3 sm:px-4 rounded-[10px] bg-accent text-on-accent hover:bg-accent-hover font-semibold text-small inline-flex items-center justify-center transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

        {/* Row 2: 44px Primary Nav Links (2px accent underline on active) */}
        <div className="border-t border-line bg-surface">
          <div className="app-container h-11 flex items-center justify-between">
            <nav className="flex items-center gap-1 sm:gap-2">
              {navLinks.map((link) => {
                const isActive =
                  link.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(link.path)

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative h-11 px-3.5 inline-flex items-center text-small font-medium transition-colors ${
                      isActive
                        ? 'text-accent font-semibold'
                        : 'text-text-2 hover:text-text'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>

      {/* ==============================================================
          COMPACT FOOTER (Max ~200px desktop, four columns + copyright)
          ============================================================== */}
      <footer className="border-t border-line bg-surface py-8 select-none">
        <div className="app-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <h4 className="text-caption font-semibold text-text-2 mb-2">Explore</h4>
              <ul className="space-y-1.5 text-small">
                <li><Link to="/explore" className="text-text-2 hover:text-text">All events</Link></li>
                <li><Link to="/clubs" className="text-text-2 hover:text-text">Clubs & collectives</Link></li>
                <li><Link to="/calendar" className="text-text-2 hover:text-text">Schedule calendar</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-caption font-semibold text-text-2 mb-2">Organizers</h4>
              <ul className="space-y-1.5 text-small">
                <li><Link to="/admin" className="text-text-2 hover:text-text">Admin dashboard</Link></li>
                <li><Link to="/admin/events/new" className="text-text-2 hover:text-text">Create an event</Link></li>
                <li><Link to="/admin/checkin" className="text-text-2 hover:text-text">Gate check-in</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-caption font-semibold text-text-2 mb-2">Resources</h4>
              <ul className="space-y-1.5 text-small">
                <li><Link to="/about" className="text-text-2 hover:text-text">About EventMesh</Link></li>
                <li><Link to="/gallery" className="text-text-2 hover:text-text">Photo gallery</Link></li>
                <li><Link to="/styleguide" className="text-text-2 hover:text-text">Design styleguide</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-caption font-semibold text-text-2 mb-2">Verification</h4>
              <ul className="space-y-1.5 text-small">
                <li><Link to="/verify/TA-2026-001245" className="text-text-2 hover:text-text">Verify credential</Link></li>
                <li><Link to="/dev/accounts" className="text-text-2 hover:text-text">Developer accounts</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-2 text-caption text-text-3">
            <p>© 2026 EventMesh. Curated multi-club event platform.</p>
            <p>Clean, flat Calm Coral interface.</p>
          </div>
        </div>
      </footer>

      {/* ==============================================================
          MOBILE BOTTOM NAVIGATION (Flat solid surface)
          ============================================================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-line px-2 py-1 flex items-center justify-around shadow-floating">
        {mobileTabs.map((tab) => {
          const isActive =
            tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path)
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
                isActive ? 'text-accent font-semibold' : 'text-text-2 hover:text-text'
              }`}
            >
              {tab.icon}
              <span className="text-caption mt-0.5">{tab.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Global Modals & Notifications */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ToastContainer />
    </div>
  )
}
