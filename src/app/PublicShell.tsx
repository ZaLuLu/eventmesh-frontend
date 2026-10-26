// Hallmark macrostructure: PublicShell / Option B Seamless Architecture
import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { House, Compass, Users, Ticket, User, CalendarBlank, Buildings } from '@/design-system/Icon'
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
    { label: 'Calendar', path: '/calendar', icon: <CalendarBlank size={18} weight="bold" /> },
    { label: 'My College', path: '/my-college', icon: <Buildings size={18} weight="bold" /> },
    {
      label: isAuthenticated ? 'Passes' : 'Sign in',
      path: isAuthenticated ? '/attendee/dashboard' : '/login',
      icon: <Ticket size={18} weight="bold" />,
    },
  ]

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans selection:bg-accent/20 selection:text-accent">
      {/* Offline Status Detector */}
      <OfflineBanner />

      {/* Modern-Minimal Floating Header */}
      <PublicHeader onSearchOpen={() => setIsSearchOpen(true)} />

      <main className="flex-1 pt-14 pb-16 lg:pb-0">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Minimal Inline Footer */}
      <PublicFooter />

      {/* Mobile Bottom Navigation Bar (Hallmark Gate 51: min 44px touch targets) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-line px-2 py-1 flex items-center justify-around select-none shadow-sm"
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
                'flex flex-col items-center justify-center min-h-[44px] min-w-[56px] py-1 px-2 rounded-[8px] transition-all active:scale-95',
                isActive
                  ? 'text-accent font-bold'
                  : 'text-ink-soft hover:text-ink'
              )}
            >
              <span className="relative flex items-center justify-center">
                {tab.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                )}
              </span>
              <span className="text-[10px] mt-1 font-mono tracking-tight uppercase">{tab.label}</span>
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
