// Hallmark macrostructure: PublicShell / Option B Seamless Architecture
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

  const mobileTabs = [
    { label: 'Home', path: '/', icon: <House size={18} weight="bold" /> },
    { label: 'Explore', path: '/explore', icon: <Compass size={18} weight="bold" /> },
    { label: 'Clubs', path: '/clubs', icon: <Users size={18} weight="bold" /> },
    { label: 'Tickets', path: '/attendee/dashboard', icon: <Ticket size={18} weight="bold" /> },
    {
      label: isAuthenticated ? 'Profile' : 'Sign in',
      path: isAuthenticated ? '/attendee/dashboard' : '/login',
      icon: <User size={18} weight="bold" />,
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col font-sans selection:bg-accent/20 selection:text-accent">
      {/* Offline Status Detector */}
      <OfflineBanner />

      {/* Modern-Minimal Floating Header */}
      <PublicHeader onSearchOpen={() => setIsSearchOpen(true)} />

      {/* Main Content Area: generous breathing room for floating pill */}
      <main className="flex-1 pt-20 sm:pt-24 pb-16 lg:pb-0">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Minimal Inline Footer */}
      <PublicFooter />

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-paper)]/90 backdrop-blur-xl border-t border-[var(--color-line)] px-2 py-1.5 flex items-center justify-around select-none shadow-sm"
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
                  ? 'text-accent font-semibold'
                  : 'text-ink-soft hover:text-ink'
              )}
            >
              {tab.icon}
              <span className="text-[11px] mt-0.5 tracking-tight font-sans">{tab.label}</span>
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
