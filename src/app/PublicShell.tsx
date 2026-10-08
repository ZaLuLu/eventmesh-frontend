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
          MODERN NEOMORPHIC & FERAL GRADIENT TOP APP BAR
          ============================================================== */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-[#EEF2F6]/90 backdrop-blur-md border-b border-white/70 shadow-[0_4px_16px_rgba(163,177,198,0.2)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Location */}
          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-[3px_3px_8px_rgba(99,102,241,0.35),-2px_-2px_6px_rgba(255,255,255,0.85)]">
                EM
              </span>
              <span className="font-display font-extrabold text-xl tracking-tight text-slate-900">
                Event<span className="text-gradient-feral">Mesh</span>
              </span>
            </Link>

            {/* Tactile Location Filter Chip */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="neo-pill flex items-center gap-1.5 px-3.5 py-1.5 text-slate-700 text-xs font-semibold transition-all select-none"
                aria-label="Select location"
              >
                <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                <span>{selectedCity}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {isCityDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-[#EEF2F6] border border-white/80 shadow-neo-card py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Region
                  </div>
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city)
                        setIsCityDropdownOpen(false)
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between transition-colors ${
                        selectedCity === city
                          ? 'text-indigo-600 font-bold bg-white/70'
                          : 'text-slate-700 hover:bg-white/40'
                      }`}
                    >
                      <span>{city}</span>
                      {selectedCity === city && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Inset Tactile Center Search Bar */}
          <div className="flex-1 max-w-md min-w-[180px] hidden sm:block">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="neo-inset w-full flex items-center justify-between px-4 py-2 rounded-full text-slate-600 text-xs group transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Search className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 flex-shrink-0 transition-colors" />
                <span className="truncate whitespace-nowrap text-left font-medium">Search events, clubs and topics...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded-md bg-white/80 px-2 py-0.5 text-[10px] font-mono text-slate-500 shadow-neo-sm flex-shrink-0 ml-2">
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
              className="neo-pill sm:hidden p-2 text-slate-600 hover:text-slate-900 rounded-full"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Dev Personas Switcher */}
            <Link
              to="/dev/accounts"
              className="neo-pill hidden xl:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 px-3 py-1.5 whitespace-nowrap"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              <span>Personas</span>
            </Link>

            {/* Admin Console Shortcut */}
            {canAccessAdmin() && (
              <Link
                to="/admin"
                className="neo-pill hidden sm:inline-flex items-center gap-1.5 bg-[#E2E8F0] px-3.5 py-1.5 text-xs font-bold text-slate-800 transition-all whitespace-nowrap"
              >
                <span>Console</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
              </Link>
            )}

            {/* My Passes Wallet Button */}
            <Link
              to="/attendee/dashboard"
              className="neo-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-indigo-600 hover:text-purple-600 transition-all whitespace-nowrap"
            >
              <Ticket className="h-3.5 w-3.5 text-indigo-600" />
              <span className="hidden sm:inline">My Passes</span>
            </Link>

            {/* Account / Login */}
            {isAuthenticated ? (
              <Link
                to="/attendee/dashboard"
                className="neo-pill inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-800 transition-colors whitespace-nowrap"
              >
                <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 text-white flex items-center justify-center text-[10px] font-bold">
                  {(session?.name || 'U')[0]}
                </div>
                <span className="hidden md:inline truncate max-w-[90px]">{session?.name}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="neo-gradient-btn inline-flex items-center px-4 py-1.5 text-xs font-bold shadow-neo-sm transition-all whitespace-nowrap"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Desktop Category Navigation Sub-bar (Neomorphic Pill Strip) */}
        <div className="hidden md:block bg-[#EEF2F6]/80 border-t border-white/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-11 flex items-center justify-between">
            <nav className="flex items-center gap-1.5 sm:gap-2">
              {navLinks.map((link) => {
                const isActive =
                  link.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(link.path)
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3.5 py-1 rounded-full text-xs font-semibold tracking-normal transition-all whitespace-nowrap select-none ${
                      isActive
                        ? 'neo-inset text-indigo-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <div className="hidden lg:flex items-center gap-3 text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                9 Collectives Active
              </span>
              <span>•</span>
              <span className="text-gradient-feral font-bold">Instant 1-Tap Passes</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>

      {/* ==============================================================
          NEOMORPHIC MOBILE NAVIGATION BAR
          ============================================================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#EEF2F6]/95 backdrop-blur-md border-t border-white/80 px-2 py-1.5 flex items-center justify-around shadow-neo-card">
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
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`flex items-center justify-center px-4 py-1 rounded-full transition-all ${
                  isActive ? 'neo-inset text-indigo-600 font-bold' : ''
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
