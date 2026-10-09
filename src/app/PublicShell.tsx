import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Compass, Calendar, Ticket, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { PublicHeader } from './PublicHeader'
import { PublicFooter } from './PublicFooter'
import { SearchModal } from './SearchModal'
import { ToastContainer } from '@/design-system/primitives/Toast'
import { cn } from '@/lib/utils'

export const PublicShell: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const isLanding = location.pathname === '/'

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
      {/* Dynamic Header with on-dark transparent hero & solid scroll transition */}
      <PublicHeader onSearchOpen={() => setIsSearchOpen(true)} />

      {/* Main Content Area */}
      <main className={cn('flex-1 pb-16 lg:pb-0', !isLanding && 'pt-16')}>
        <Outlet />
      </main>

      {/* Modern Compact Footer */}
      <PublicFooter />

      {/* Mobile Bottom Navigation (Flat solid surface) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-line px-2 py-1 flex items-center justify-around shadow-floating select-none"
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
                isActive ? 'text-champion font-semibold' : 'text-ink-muted hover:text-ink'
              )}
            >
              {tab.icon}
              <span className="text-[11px] mt-0.5">{tab.label}</span>
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
