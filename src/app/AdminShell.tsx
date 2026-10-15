import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  SquaresFour,
  CalendarCheck,
  Users,
  QrCode,
  Certificate as CertificateIcon,
  Megaphone,
  Bell,
  Buildings,
  Image as ImageIcon,
  ShieldCheck,
  ChartBar,
  ClockCounterClockwise,
  GearSix,
  SignOut,
  ArrowSquareOut,
  List,
  X,
  CheckSquare,
  FileText,
} from '@phosphor-icons/react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { useOrg } from '@/hooks/useOrg'
import { ToastContainer } from '@/design-system/primitives/Toast'
import { ForbiddenPage } from './ForbiddenPage'
import { ErrorBoundary } from './ErrorBoundary'
import { Modal } from '@/design-system/primitives/Modal'
import { ThemeToggle } from '@/design-system/ThemeToggle'
import { OfflineBanner } from '@/components/OfflineBanner'

export const AdminShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const { can, canAccessAdmin, role } = usePermission()
  const { organization } = useOrg()

  // Guard: if user is not authorized for admin
  if (!canAccessAdmin()) {
    return <ForbiddenPage />
  }

  const isVolunteer = role === 'volunteer'
  const isOrgOrPlatformAdmin = role === 'org_admin' || role === 'platform_admin'

  // 4 Plain Headings (Section 7.8)
  const navSections = [
    {
      heading: 'Run events',
      items: [
        { label: 'Dashboard', path: '/admin', icon: <SquaresFour className="w-4 h-4" weight="bold" />, show: !isVolunteer, exact: true },
        { label: 'Events', path: '/admin/events', icon: <CalendarCheck className="w-4 h-4" weight="bold" />, show: !isVolunteer },
        { label: 'Registrations', path: '/admin/registrations', icon: <Users className="w-4 h-4" weight="bold" />, show: !isVolunteer },
        { label: 'Check-in Desk', path: '/admin/checkin', icon: <QrCode className="w-4 h-4" weight="bold" />, show: can('checkin') },
      ],
    },
    {
      heading: 'People',
      items: [
        { label: 'Club Profile', path: '/admin/club', icon: <Buildings className="w-4 h-4" weight="bold" />, show: can('edit_club_profile') },
        { label: 'Clubs Overview', path: '/admin/clubs', icon: <Buildings className="w-4 h-4" weight="bold" />, show: isOrgOrPlatformAdmin },
        { label: 'Approvals Queue', path: '/admin/approvals', icon: <CheckSquare className="w-4 h-4" weight="bold" />, show: isOrgOrPlatformAdmin },
        { label: 'Roles & Staff', path: '/admin/roles', icon: <ShieldCheck className="w-4 h-4" weight="bold" />, show: isOrgOrPlatformAdmin },
      ],
    },
    {
      heading: 'Communicate',
      items: [
        { label: 'Announcements', path: '/admin/announcements', icon: <Megaphone className="w-4 h-4" weight="bold" />, show: can('send_announcements') },
        { label: 'Notifications', path: '/admin/notifications', icon: <Bell className="w-4 h-4" weight="bold" />, show: can('send_notifications') },
        { label: 'Certificates', path: '/admin/certificates', icon: <CertificateIcon className="w-4 h-4" weight="bold" />, show: can('generate_certificates') },
      ],
    },
    {
      heading: 'Settings',
      items: [
        { label: 'Analytics', path: '/admin/analytics', icon: <ChartBar className="w-4 h-4" weight="bold" />, show: isOrgOrPlatformAdmin },
        { label: 'Audit Trail', path: '/admin/audit', icon: <ClockCounterClockwise className="w-4 h-4" weight="bold" />, show: isOrgOrPlatformAdmin },
        { label: 'Gallery Archive', path: '/admin/gallery', icon: <ImageIcon className="w-4 h-4" weight="bold" />, show: !isVolunteer },
        { label: 'Settings & Labels', path: '/admin/settings', icon: <GearSix className="w-4 h-4" weight="bold" />, show: isOrgOrPlatformAdmin },
      ],
    },
  ]

  const activeClubName = session?.clubName || organization?.name || 'Organization'

  const sidebarContent = <>
          {/* Sidebar Header */}
          <div className="h-14 px-4 border-b border-line flex items-center justify-between flex-shrink-0">
            <div>
              <h1 className="font-display font-extrabold text-sm text-ink tracking-wide">
                EventMesh Studio
              </h1>
              <p className="text-xs text-ink-muted">
                Event operations
              </p>
            </div>

          </div>

          {/* Grouped Nav Items */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-none">
            {navSections.map((section) => {
              const visibleItems = section.items.filter((i) => i.show)
              if (visibleItems.length === 0) return null

              return (
                <div key={section.heading} className="space-y-1">
                  <h3 className="px-3 text-xs font-mono font-extrabold text-ink-muted uppercase tracking-widest">
                    {section.heading}
                  </h3>
                  <div className="space-y-0.5 pt-1">
                    {visibleItems.map((item) => {
                      const isActive = item.exact
                        ? location.pathname === item.path
                        : item.path === '/admin'
                        ? location.pathname === '/admin'
                        : location.pathname.startsWith(item.path)

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          aria-current={isActive ? 'page' : undefined}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-input text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-[var(--color-accent)] text-on-accent shadow-sm'
                              : 'text-ink-soft hover:bg-surface-subtle hover:text-ink'
                          }`}
                        >
                          <span className={isActive ? 'text-on-accent' : 'text-ink-soft'}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </nav>

          {/* User Profile & Sign Out Footer */}
          <div className="p-3 border-t border-line bg-paper-2 flex items-center justify-between gap-3">
            <div className="truncate">
              <p className="text-xs font-bold text-ink truncate">
                {session?.name}
              </p>
              <p className="text-xs text-ink-muted truncate font-mono">
                {session?.email}
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                await logout()
                navigate('/')
              }}
              className="p-1.5 text-ink-soft hover:text-[var(--color-accent)] hover:bg-surface-subtle rounded-[8px] transition-colors"
              title="Sign Out"
              aria-label="Sign out"
            >
              <SignOut className="w-4 h-4" weight="bold" />
            </button>
          </div>

  </>

  return (
    <div className="min-h-screen bg-paper text-ink font-body flex flex-col admin-scope antialiased selection:bg-accent selection:text-on-accent">
      <OfflineBanner />

      {/* Top Console Strip */}
      <header className="min-h-11 gap-2 bg-paper text-ink-soft px-4 flex items-center justify-between text-xs border-b border-line select-none z-50">
        <div className="flex items-center gap-2.5 truncate">
          <span className="font-display font-bold text-[var(--color-accent)] tracking-wider text-xs uppercase">
            ADMIN CONSOLE
          </span>
          <span className="opacity-30">·</span>
          <span className="truncate">{organization?.name || 'Organization'}</span>
          <span className="opacity-30">·</span>
          <div className="inline-flex items-center gap-1.5 text-ink">
            {session?.clubColor && (
              <span
                className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: session.clubColor }}
              />
            )}
            <span className="font-bold text-xs truncate">{activeClubName}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <ThemeToggle />
          <span className="text-xs bg-[var(--color-accent)] text-on-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {session?.role?.replace('_', ' ')}
          </span>
          <Link
            to="/"
            className="text-ink-soft hover:text-[var(--color-accent)] inline-flex items-center gap-1 transition-colors text-xs font-semibold"
          >
            <span className="hidden sm:inline">Public site</span>
            <ArrowSquareOut className="w-3.5 h-3.5" weight="bold" />
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Admin Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-card md:flex">
          {sidebarContent}
        </aside>
        <Modal isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Navigation" placement="left" surface="admin">
          {sidebarContent}
        </Modal>


        {/* Main Console Workspace */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[var(--color-canvas)] relative">
          {/* Mobile Header Bar */}
          <div className="md:hidden h-14 bg-card border-b border-line px-4 flex items-center justify-between flex-shrink-0 z-30">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 border border-line-strong rounded-[8px] text-ink"
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
            >
              <List className="w-5 h-5" weight="bold" />
            </button>
            <span className="text-xs font-bold text-ink truncate max-w-[200px]">
              {activeClubName}
            </span>
          </div>

          {/* Content Pane */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative z-10">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>

      <ToastContainer />
    </div>
  )
}
