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
  Bank,
} from '@phosphor-icons/react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { useOrg } from '@/hooks/useOrg'
import { useQuery } from '@tanstack/react-query'
import { api, PayoutAccount, Event } from '@/api'
import { ToastContainer } from '@/design-system/primitives/Toast'
import { NotificationInbox } from '@/features/notifications/NotificationInbox'
import { ForbiddenPage } from './ForbiddenPage'
import { OrganizerOnboardingView } from '@/features/admin/OrganizerOnboardingView'
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

  const isVolunteer = role === 'volunteer'
  const isOrgOrPlatformAdmin = role === 'org_admin' || role === 'platform_admin'
  const hasAdminAccess = canAccessAdmin()

  const { data: approvals = [] } = useQuery<Event[]>({
    queryKey: ['admin-approvals', session?.orgId],
    queryFn: () => api.eventsAdmin.getAdminEvents({ orgId: session?.orgId || 'org-1' }),
    enabled: hasAdminAccess && isOrgOrPlatformAdmin,
  })
  const pendingApprovalsCount = approvals.filter((e) => e.status === 'in_review' || e.status === 'submitted').length

  const { data: payoutAccount } = useQuery<PayoutAccount | null>({
    queryKey: ['payout-account', session?.clubId || 'apex-design-lab'],
    queryFn: () => api.payouts.getPayoutAccount(session?.clubId || 'apex-design-lab'),
    enabled: hasAdminAccess,
  })
  const kycNeedsAttention = !payoutAccount || payoutAccount.status !== 'VERIFIED'

  // Guard: if user is not authorized for admin
  if (!hasAdminAccess) {
    if (session) {
      return <OrganizerOnboardingView />
    }
    return <ForbiddenPage />
  }

  // 4 Plain Headings (Section 7.8)
  const navSections = [
    {
      heading: 'Run events',
      items: [
        { label: 'Dashboard', path: '/admin', icon: <SquaresFour className="w-4 h-4" weight="bold" />, show: !isVolunteer, exact: true },
        { label: 'Events', path: '/admin/events', icon: <CalendarCheck className="w-4 h-4" weight="bold" />, show: !isVolunteer },
        { label: 'Registrations', path: '/admin/registrations', icon: <Users className="w-4 h-4" weight="bold" />, show: !isVolunteer },
        {
          label: 'Payouts & Bank',
          path: '/admin/payouts',
          icon: <Bank className="w-4 h-4" weight="bold" />,
          show: !isVolunteer,
          badge: kycNeedsAttention ? <span className="w-2 h-2 rounded-full bg-warning animate-pulse" title="Bank KYC Verification Needed" /> : undefined,
        },
        { label: 'Check-in Desk', path: '/admin/checkin', icon: <QrCode className="w-4 h-4" weight="bold" />, show: can('checkin') },
      ],
    },
    {
      heading: 'People',
      items: [
        { label: 'Club Profile', path: '/admin/club', icon: <Buildings className="w-4 h-4" weight="bold" />, show: can('edit_club_profile') },
        { label: 'Clubs Overview', path: '/admin/clubs', icon: <Buildings className="w-4 h-4" weight="bold" />, show: isOrgOrPlatformAdmin },
        {
          label: 'Approvals Queue',
          path: '/admin/approvals',
          icon: <CheckSquare className="w-4 h-4" weight="bold" />,
          show: isOrgOrPlatformAdmin,
          badge: pendingApprovalsCount > 0 ? (
            <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-accent text-on-accent rounded-full">
              {pendingApprovalsCount}
            </span>
          ) : undefined,
        },
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
              <h1 className="font-semibold text-sm text-ink tracking-tight">
                EventMesh Studio
              </h1>
              <p className="text-caption text-text-3 font-normal">
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
                  <h3 className="px-3 text-[11px] font-mono font-semibold text-text-3 uppercase tracking-wider">
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
                          className={`flex items-center justify-between px-3 py-2 rounded-btn text-small font-medium transition-all ${
                            isActive
                              ? 'bg-accent text-on-accent shadow-sm'
                              : 'text-text-2 hover:bg-surface-subtle hover:text-text'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={isActive ? 'text-on-accent' : 'text-text-3'}>
                              {item.icon}
                            </span>
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge}
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
              className="p-1.5 text-text-2 hover:text-accent hover:bg-surface-subtle rounded-btn transition-colors"
              title="Sign Out"
              aria-label="Sign out"
            >
              <SignOut className="w-4 h-4" weight="bold" />
            </button>
          </div>

  </>

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col admin-scope antialiased selection:bg-accent selection:text-on-accent">
      <OfflineBanner />

      {/* Top Console Strip */}
      <header className="min-h-11 gap-2 bg-paper text-text-2 px-4 flex items-center justify-between text-xs border-b border-line select-none z-50">
        <div className="flex items-center gap-2.5 truncate">
          <span className="font-mono font-semibold text-accent tracking-wider text-xs uppercase">
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
          <NotificationInbox className="text-text-2 hover:text-ink border-line" />
          <ThemeToggle />
          <span className="text-caption bg-accent text-on-accent px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
            {session?.role?.replace('_', ' ')}
          </span>
          <Link
            to="/"
            className="text-text-2 hover:text-accent inline-flex items-center gap-1 transition-colors text-xs font-semibold"
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
