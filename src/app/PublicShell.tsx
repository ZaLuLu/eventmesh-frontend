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
} from 'lucide-react'
import { BRAND_CONFIG } from '@/config/brand'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { SearchModal } from './SearchModal'
import { ToastContainer } from '@/design-system/primitives/Toast'

export const PublicShell: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const location = useLocation()
  const { session, isAuthenticated } = useAuth()
  const { canAccessAdmin } = usePermission()

  const navLinks = [
    { label: 'Explore', path: '/explore' },
    { label: 'Clubs', path: '/clubs' },
    { label: 'Calendar', path: '/calendar' },
    { label: 'Announcements', path: '/announcements' },
    { label: 'About', path: '/about' },
  ]

  const mobileTabs = [
    { label: 'Home', path: '/', icon: <Home className="h-5 w-5" /> },
    { label: 'Explore', path: '/explore', icon: <Compass className="h-5 w-5" /> },
    { label: 'Calendar', path: '/calendar', icon: <Calendar className="h-5 w-5" /> },
    { label: 'Passes', path: '/me', icon: <Ticket className="h-5 w-5" /> },
    {
      label: isAuthenticated ? 'Profile' : 'Sign In',
      path: isAuthenticated ? '/me' : '/login',
      icon: <User className="h-5 w-5" />,
    },
  ]

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-body selection:bg-ink selection:text-paper">
      {/* Editorial Sticky Masthead */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-paper border-b border-ink-15">
        <div className="px-[4vw] h-16 flex items-center justify-between gap-4">
          {/* Brand Wordmark & Volume Tag */}
          <div className="flex items-baseline gap-3 sm:gap-4 flex-shrink-0">
            <Link
              to="/"
              className="font-display text-2xl sm:text-3xl tracking-editorial text-ink uppercase hover:opacity-80 transition-opacity"
            >
              {BRAND_CONFIG.name}
            </Link>
            <span className="font-mono text-[10px] sm:text-[11px] font-medium uppercase tracking-widecaps text-ink-60 hidden xs:inline">
              {BRAND_CONFIG.edition.split('·')[0]}
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.path)
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-body text-[12.5px] font-semibold uppercase tracking-caps transition-all py-1 border-b-2 ${
                    isActive
                      ? 'border-ink text-ink'
                      : 'border-transparent text-ink/75 hover:text-ink hover:border-ink/30'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 border border-ink-15 hover:border-ink transition-colors font-mono text-[11px] uppercase tracking-wide text-ink-60 hover:text-ink"
              aria-label="Search events and clubs"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden md:inline text-[9px] bg-paper-deep px-1 border border-ink-15">
                ⌘K
              </kbd>
            </button>

            {/* Dev Switcher Link */}
            <Link
              to="/dev/accounts"
              className="hidden xl:inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide border border-dashed border-ink-15 px-2 py-1 text-ink-60 hover:text-ink hover:border-ink"
            >
              <ShieldAlert className="h-3 w-3" />
              <span>Dev Accounts</span>
            </Link>

            {/* Admin Console Shortcut (if authorized) */}
            {canAccessAdmin() && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1 bg-admin-accent text-white px-3 py-1.5 font-mono text-[11px] uppercase tracking-widecaps font-semibold hover:bg-[#154643] transition-colors"
              >
                <span>Console</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            )}

            {/* Sign In / Account Dropdown */}
            {isAuthenticated ? (
              <Link
                to="/me"
                className="inline-flex items-center gap-2 border border-ink px-3 py-1.5 font-body text-xs font-semibold uppercase tracking-caps hover:bg-ink hover:text-paper transition-all"
              >
                <span className="h-2 w-2 bg-emerald-600 inline-block" />
                <span className="truncate max-w-[120px]">{session?.name || 'Account'}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center border border-ink px-3.5 py-1.5 font-body text-xs font-semibold uppercase tracking-caps hover:bg-ink hover:text-paper transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Canvas */}
      <main className="flex-1 pb-20 sm:pb-0">
        <Outlet />
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-ink-15 bg-paper pt-16 pb-24 sm:pb-16 overflow-hidden">
        <div className="px-[4vw]">
          {/* Top Colophon Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-ink-15">
            <div className="md:col-span-5 space-y-3">
              <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block">
                {BRAND_CONFIG.manifesto.heading}
              </span>
              <p className="font-body text-sm sm:text-base text-ink max-w-md leading-relaxed">
                {BRAND_CONFIG.manifesto.statement}
              </p>
            </div>

            <div className="md:col-span-4 grid grid-cols-2 gap-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-3">
                  Index
                </span>
                <ul className="space-y-2 font-body text-xs uppercase tracking-caps font-semibold">
                  <li><Link to="/explore" className="hover:underline">Browse Catalogue</Link></li>
                  <li><Link to="/clubs" className="hover:underline">Member Clubs</Link></li>
                  <li><Link to="/calendar" className="hover:underline">Calendar Grid</Link></li>
                  <li><Link to="/announcements" className="hover:underline">Notices</Link></li>
                </ul>
              </div>

              <div>
                <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-3">
                  System
                </span>
                <ul className="space-y-2 font-body text-xs uppercase tracking-caps font-semibold">
                  <li><Link to="/about" className="hover:underline">About TA</Link></li>
                  <li><Link to="/styleguide" className="hover:underline">Styleguide</Link></li>
                  <li><Link to="/dev/accounts" className="hover:underline">Dev Matrix</Link></li>
                  <li><Link to="/admin" className="hover:underline">Admin Console</Link></li>
                </ul>
              </div>
            </div>

            <div className="md:col-span-3 space-y-2 text-left md:text-right">
              <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block">
                Edition & Verification
              </span>
              <p className="font-mono text-xs text-ink">{BRAND_CONFIG.edition}</p>
              <p className="font-body text-xs text-ink-60 max-w-xs md:ml-auto">
                All certificates carry verifiable digital cryptographic signatures.
              </p>
            </div>
          </div>

          {/* Giant Cropped Typographic Wordmark */}
          <div className="py-6 sm:py-8 select-none pointer-events-none">
            <h2 className="font-display text-[15vw] leading-[0.82] tracking-editorial text-ink/90 uppercase text-center sm:text-left overflow-hidden">
              {BRAND_CONFIG.name}
            </h2>
          </div>

          {/* Bottom Copyright Hairline */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-ink-15 font-mono text-[11px] uppercase tracking-widecaps text-ink-60">
            <span>{BRAND_CONFIG.copyright}</span>
            <span>No Cookies · Zero Tracking · Pure Archival Paper</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Tab Bar (Touch target min 48px) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-paper border-t border-ink-15 sm:hidden flex items-center justify-around h-16 px-2"
      >
        {mobileTabs.map((tab) => {
          const isActive =
            tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path)

          return (
            <Link
              key={tab.label}
              to={tab.path}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 transition-colors ${
                isActive ? 'text-ink font-bold' : 'text-ink-60 hover:text-ink'
              }`}
            >
              {tab.icon}
              <span className="font-mono text-[9px] uppercase tracking-wide mt-1">
                {tab.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Global Search Dialog */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Notification Toast Container */}
      <ToastContainer />
    </div>
  )
}
