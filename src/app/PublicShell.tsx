// Hallmark macrostructure: PublicShell
import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { House, Compass, Users, Ticket, User } from '@/design-system/Icon'
import { useAuth } from '@/hooks/useAuth'
import { PublicHeader } from './PublicHeader'
import { PublicFooter } from './PublicFooter'
import { SearchModal } from './SearchModal'
import { ToastContainer } from '@/design-system/primitives/Toast'
import { ErrorBoundary } from './ErrorBoundary'
import { OfflineBanner } from '@/components/OfflineBanner'
import { cn } from '@/lib/utils'

export const PublicShell: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const isLanding = location.pathname === '/'

  const mobileTabs = [
    { label: 'Home', path: '/', icon: <House size={20} weight="bold" /> },
    { label: 'Explore', path: '/explore', icon: <Compass size={20} weight="bold" /> },
    { label: 'Clubs', path: '/clubs', icon: <Users size={20} weight="bold" /> },
    { label: 'Tickets', path: '/attendee/dashboard', icon: <Ticket size={20} weight="bold" /> },
    {
      label: isAuthenticated ? 'Profile' : 'Sign in',
      path: isAuthenticated ? '/attendee/dashboard' : '/login',
      icon: <User size={20} weight="bold" />,
    },
  ]

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      {/* Offline Status Detector (F-13) */}
      <OfflineBanner />

      {/* Campus Funk Public Header */}
      <PublicHeader onSearchOpen={() => setIsSearchOpen(true)} />

      {/* Main Content Area */}
      <main className={cn('flex-1 pb-16 lg:pb-0', !isLanding && 'pt-16')}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Useful Links & Giant Wordmark Footer (V-05) */}
      <PublicFooter />

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-ink/10 px-2 py-1.5 flex items-center justify-around select-none shadow-[0_-4px_12px_rgba(21,17,48,0.06)]"
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
              className={cn(
                'flex flex-col items-center justify-center py-1 px-3 transition-colors',
                isActive
                  ? 'text-cobalt font-bold'
                  : 'text-ink-soft hover:text-ink'
              )}
            >
              {tab.icon}
              <span className="text-xs mt-0.5 tracking-tight">{tab.label}</span>
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
