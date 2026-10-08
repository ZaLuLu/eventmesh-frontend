import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Search,
  Calendar,
  Compass,
  Home,
  Ticket,
  User,
  ShieldAlert,
  ArrowUpRight,
  MapPin,
  ChevronDown,
} from 'lucide-react'
import { BRAND_CONFIG } from '@/config/brand'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { SearchModal } from './SearchModal'
import { ToastContainer } from '@/design-system/primitives/Toast'

export const PublicShell: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState('Bangalore')
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const location = useLocation()
  const { session, isAuthenticated } = useAuth()
  const { canAccessAdmin } = usePermission()

  const cities = ['Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Campus Alpha']

  const navLinks = [
    { label: 'Explore', path: '/explore' },
    { label: 'Clubs & Collectives', path: '/clubs' },
    { label: 'Calendar', path: '/calendar' },
    { label: 'My Passes', path: '/attendee/dashboard' },
  ]

  const mobileTabs = [
    { label: 'Home', path: '/', icon: <Home className="h-5 w-5" /> },
    { label: 'Explore', path: '/explore', icon: <Compass className="h-5 w-5" /> },
    { label: 'Calendar', path: '/calendar', icon: <Calendar className="h-5 w-5" /> },
    { label: 'My Passes', path: '/attendee/dashboard', icon: <Ticket className="h-5 w-5" /> },
    {
      label: isAuthenticated ? 'Account' : 'Sign In',
      path: isAuthenticated ? '/attendee/dashboard' : '/login',
      icon: <User className="h-5 w-5" />,
    },
  ]

  return (
    <div className="min-h-screen bg-canvas text-md-on-surface flex flex-col font-body selection:bg-md-primary-container selection:text-md-on-primary-container">
      {/* ==============================================================
          GOOGLE M3 TOP APP BAR
          ============================================================== */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-white border-b border-md-outline/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Location */}
          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="h-8 w-8 rounded-lg bg-md-primary flex items-center justify-center text-white font-bold text-sm shadow-2xs">
                EM
              </span>
              <span className="font-display font-bold text-xl tracking-tight text-md-on-surface">
                Event<span className="text-md-primary">Mesh</span>
              </span>
            </Link>

            {/* M3 Location Filter Chip */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F1F3F4] hover:bg-[#E8EAED] text-md-on-surface-variant text-xs font-semibold transition-colors"
                aria-label="Select location"
              >
                <MapPin className="h-3.5 w-3.5 text-md-primary" />
                <span>{selectedCity}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {isCityDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-white border border-md-outline shadow-card-hover py-1.5 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Region
                  </div>
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city)
                        setIsCityDropdownOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-[#F1F3F4] flex items-center justify-between ${
                        selectedCity === city
                          ? 'text-md-primary font-bold bg-md-primary-container/40'
                          : 'text-md-on-surface'
                      }`}
                    >
                      <span>{city}</span>
                      {selectedCity === city && <span className="h-1.5 w-1.5 rounded-full bg-md-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* M3 Center Search Bar (Google Style) */}
          <div className="flex-1 max-w-md min-w-[180px] hidden sm:block">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2 rounded-full bg-[#F1F3F4] hover:bg-[#E8EAED] transition-all text-md-on-surface-variant text-xs group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Search className="h-4 w-4 text-slate-500 group-hover:text-md-primary flex-shrink-0 transition-colors" />
                <span className="truncate whitespace-nowrap text-left">Search events, clubs and topics...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded-md bg-white px-2 py-0.5 text-[10px] font-mono text-slate-500 border border-slate-200 flex-shrink-0 ml-2">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-[#F1F3F4]"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Dev Personas Switcher */}
            <Link
              to="/dev/accounts"
              className="hidden xl:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-[#F1F3F4] hover:bg-[#E8EAED] px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              <span>Personas</span>
            </Link>

            {/* Admin Console Shortcut */}
            {canAccessAdmin() && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#1F1F1F] hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs whitespace-nowrap"
              >
                <span>Console</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            )}

            {/* My Passes Wallet Button */}
            <Link
              to="/attendee/dashboard"
              className="inline-flex items-center gap-1.5 border border-md-outline bg-white hover:bg-slate-50 text-md-on-surface px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap"
            >
              <Ticket className="h-3.5 w-3.5 text-md-primary" />
              <span className="hidden sm:inline">My Passes</span>
            </Link>

            {/* Account / Login */}
            {isAuthenticated ? (
              <Link
                to="/attendee/dashboard"
                className="inline-flex items-center gap-2 bg-md-primary-container text-md-on-primary-container px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <div className="h-5 w-5 rounded-full bg-md-primary text-white flex items-center justify-center text-[10px] font-bold">
                  {(session?.name || 'U')[0]}
                </div>
                <span className="hidden md:inline truncate max-w-[90px]">{session?.name}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center bg-md-primary hover:bg-md-primary-hover text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all whitespace-nowrap"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Desktop Category Navigation Sub-bar (BookMyShow / District Pattern) */}
        <div className="hidden md:block bg-white border-t border-md-outline/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-between">
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
                    className={`px-3 py-1 rounded-full text-xs font-semibold tracking-normal transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-md-primary-container text-md-on-primary-container font-bold'
                        : 'text-md-on-surface-variant hover:text-md-on-surface hover:bg-black/[0.04]'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <div className="hidden lg:flex items-center gap-4 text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                9 Technical Collectives
              </span>
              <span>•</span>
              <span>Live Ticketing & Instant Passes</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>

      {/* ==============================================================
          M3 MOBILE NAVIGATION BAR
          ============================================================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-md-outline/60 px-2 py-1.5 flex items-center justify-around shadow-card">
        {mobileTabs.map((tab) => {
          const isActive =
            tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path)
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-1 px-3 transition-all ${
                isActive
                  ? 'text-md-primary font-bold'
                  : 'text-md-on-surface-variant hover:text-md-on-surface font-medium'
              }`}
            >
              <div
                className={`flex items-center justify-center px-4 py-1 rounded-full transition-all ${
                  isActive ? 'bg-md-primary-container text-md-on-primary-container' : ''
                }`}
              >
                {tab.icon}
              </div>
              <span className="text-[10px] mt-0.5">{tab.label}</span>
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
