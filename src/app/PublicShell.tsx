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
  Sparkles,
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
    { label: 'Clubs', path: '/clubs' },
    { label: 'Calendar', path: '/calendar' },
    { label: 'Announcements', path: '/announcements' },
    { label: 'Gallery', path: '/gallery' },
  ]

  const mobileTabs = [
    { label: 'Home', path: '/', icon: <Home className="h-5 w-5" /> },
    { label: 'Explore', path: '/explore', icon: <Compass className="h-5 w-5" /> },
    { label: 'Calendar', path: '/calendar', icon: <Calendar className="h-5 w-5" /> },
    { label: 'My Passes', path: '/attendee/dashboard', icon: <Ticket className="h-5 w-5" /> },
    {
      label: isAuthenticated ? 'Profile' : 'Sign In',
      path: isAuthenticated ? '/attendee/dashboard' : '/login',
      icon: <User className="h-5 w-5" />,
    },
  ]

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-body selection:bg-brand-red/10 selection:text-brand-red">
      {/* ==============================================================
          AMBIENT LIGHT MASTHEAD (BookMyShow + District Navigation)
          ============================================================== */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & City Selector */}
          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-red via-brand-pink to-brand-purple flex items-center justify-center text-white font-black text-sm shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
                EM
              </span>
              <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900">
                EVENT<span className="text-brand-red">MESH</span>
              </span>
            </Link>

            {/* City / Campus Selector (BookMyShow style) */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-semibold transition-colors"
                aria-label="Select location"
              >
                <MapPin className="h-3.5 w-3.5 text-brand-red" />
                <span>{selectedCity}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {isCityDropdownOpen && (
                <div className="absolute left-0 mt-2 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Location
                  </div>
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city)
                        setIsCityDropdownOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 flex items-center justify-between ${
                        selectedCity === city ? 'text-brand-red font-semibold bg-red-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{city}</span>
                      {selectedCity === city && <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Search Trigger (BookMyShow / Netflix search bar) */}
          <div className="flex-1 max-w-md hidden sm:block">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200/60 border border-transparent hover:border-slate-200 transition-all text-slate-400 text-xs group"
            >
              <div className="flex items-center gap-2.5">
                <Search className="h-3.5 w-3.5 text-slate-500 group-hover:text-brand-red transition-colors" />
                <span className="text-slate-500">Search hackathons, workshops & clubs...</span>
              </div>
              <kbd className="hidden md:inline-flex items-center gap-0.5 rounded bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-500 border border-slate-200 shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-5 mr-2">
              {navLinks.map((link) => {
                const isActive =
                  link.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(link.path)
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-xs font-semibold tracking-wide transition-colors py-1 ${
                      isActive ? 'text-brand-red' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-2 text-slate-600 hover:text-slate-900"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Dev Switcher Button */}
            <Link
              to="/dev/accounts"
              className="hidden xl:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/70 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
              <span>Personas</span>
            </Link>

            {/* Admin Console Shortcut */}
            {canAccessAdmin() && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
              >
                <span>Console</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            )}

            {/* My Passes Wallet Button */}
            <Link
              to="/attendee/dashboard"
              className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs"
            >
              <Ticket className="h-3.5 w-3.5 text-brand-red" />
              <span className="hidden sm:inline">My Passes</span>
            </Link>

            {/* Account / Login */}
            {isAuthenticated ? (
              <Link
                to="/attendee/dashboard"
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200/70 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-800 transition-colors"
              >
                <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-brand-blue to-brand-purple text-white flex items-center justify-center text-[10px] font-bold">
                  {(session?.name || 'U')[0]}
                </div>
                <span className="hidden md:inline truncate max-w-[90px]">{session?.name}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center bg-brand-red hover:bg-[#CC0813] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all shadow-red-500/20"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>

      {/* ==============================================================
          MOBILE BOTTOM DOCK (BookMyShow / District Bottom Navigation)
          ============================================================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {mobileTabs.map((tab) => {
          const isActive =
            tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path)
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-brand-red font-semibold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.label === 'My Passes' && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-brand-red" />
                )}
              </div>
              <span className="text-[10px] mt-1">{tab.label}</span>
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
