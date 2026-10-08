import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  QrCode,
  Award,
  Megaphone,
  BellRing,
  Building2,
  Image as ImageIcon,
  ShieldCheck,
  BarChart3,
  History,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  CheckSquare,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { useOrg } from '@/hooks/useOrg'
import { ToastContainer } from '@/design-system/primitives/Toast'

export const AdminShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const { can, canAccessAdmin, role, clubId } = usePermission()
  const { organization } = useOrg()

  // Guard: if user is not authorized for admin
  if (!canAccessAdmin()) {
    return (
      <div className="min-h-screen bg-[#E6EAEC] text-ink flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-paper border-2 border-ink p-8 space-y-4">
          <span className="font-mono text-xs uppercase tracking-wide text-[#A32828] font-bold">
            403 · Access Forbidden
          </span>
          <h2 className="font-display text-3xl text-ink">Administrative Restraint</h2>
          <p className="font-body text-sm text-ink-60">
            You do not possess valid administrative privileges to access the EventMesh console.
            Please sign in with an organizer, staff, or volunteer identity.
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              to="/admin/login"
              className="w-full bg-ink text-paper py-3 font-mono text-xs uppercase tracking-wide font-semibold text-center hover:bg-admin-accent transition-colors"
            >
              Sign In to Console
            </Link>
            <Link
              to="/"
              className="w-full border border-ink py-3 font-mono text-xs uppercase tracking-wide font-semibold text-center hover:bg-paper-deep transition-colors"
            >
              Return to Public Site
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Define nav links filtered by role
  const isVolunteer = role === 'volunteer'
  const isOrgOrPlatformAdmin = role === 'org_admin' || role === 'platform_admin'

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="h-4 w-4" />, show: !isVolunteer },
    { label: 'Events & Wizard', path: '/admin/events', icon: <CalendarDays className="h-4 w-4" />, show: !isVolunteer },
    { label: 'Registrations', path: '/admin/registrations', icon: <Users className="h-4 w-4" />, show: !isVolunteer },
    { label: 'Check-in Desk', path: '/admin/checkin', icon: <QrCode className="h-4 w-4" />, show: can('checkin') },
    { label: 'Certificates', path: '/admin/certificates', icon: <Award className="h-4 w-4" />, show: can('generate_certificates') },
    { label: 'Announcements', path: '/admin/announcements', icon: <Megaphone className="h-4 w-4" />, show: can('send_announcements') },
    { label: 'Audience Dispatch', path: '/admin/notifications', icon: <BellRing className="h-4 w-4" />, show: can('send_notifications') },
    { label: 'Club Profile', path: '/admin/club', icon: <Building2 className="h-4 w-4" />, show: can('edit_club_profile') },
    { label: 'Gallery Archive', path: '/admin/gallery', icon: <ImageIcon className="h-4 w-4" />, show: !isVolunteer },
    // Org Admin specific
    { label: 'Clubs Overview', path: '/admin/clubs', icon: <Building2 className="h-4 w-4" />, show: isOrgOrPlatformAdmin },
    { label: 'Approvals Queue', path: '/admin/approvals', icon: <CheckSquare className="h-4 w-4" />, show: isOrgOrPlatformAdmin },
    { label: 'Roles & Staff', path: '/admin/roles', icon: <ShieldCheck className="h-4 w-4" />, show: isOrgOrPlatformAdmin },
    { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 className="h-4 w-4" />, show: isOrgOrPlatformAdmin },
    { label: 'Audit Trail', path: '/admin/audit', icon: <History className="h-4 w-4" />, show: isOrgOrPlatformAdmin },
    { label: 'Settings & Labels', path: '/admin/settings', icon: <Settings className="h-4 w-4" />, show: isOrgOrPlatformAdmin },
  ].filter((item) => item.show)

  const activeClubName = session?.clubName || (session?.role === 'org_admin' ? 'All Clubs' : 'Federation')

  return (
    <div className="min-h-screen bg-[#E6EAEC] text-ink font-body flex flex-col admin-scope">
      {/* 1. Permanent 28px Top Strip */}
      <div className="h-7 bg-[#0B131B] text-paper-deep/80 px-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-widecaps border-b border-[#1E293B] select-none z-50">
        <div className="flex items-center gap-2 truncate">
          <span className="font-bold text-white tracking-widest">ADMIN CONSOLE</span>
          <span className="opacity-40">·</span>
          <span>{organization?.name || 'TECHNICAL ASSOCIATION'}</span>
          <span className="opacity-40">·</span>
          <div className="inline-flex items-center gap-1.5 text-white">
            {session?.clubColor && (
              <span
                className="inline-block h-2 w-2 flex-shrink-0"
                style={{ backgroundColor: session.clubColor }}
              />
            )}
            <span className="font-semibold">{activeClubName}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="text-[9px] bg-admin-accent px-1.5 py-0.5 text-white uppercase font-bold tracking-wide">
            {session?.role?.replace('_', ' ')}
          </span>
          <Link
            to="/"
            className="text-paper-deep hover:text-white inline-flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
          >
            <span>Public Website</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </Link>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 2. Admin Sidebar */}
        <aside
          className={`fixed inset-y-7 left-0 z-40 w-64 bg-[#0F1A24] text-[#F3EEE9] border-r border-[#C9D0D4]/20 flex flex-col transition-transform duration-200 md:static md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h1 className="font-display text-lg tracking-tight text-white uppercase">
                Console Core
              </h1>
              <p className="font-mono text-[10px] text-white/50 uppercase tracking-wide">
                Federation Management
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-white/70 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path)

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 font-body text-xs font-semibold uppercase tracking-caps transition-all ${
                    isActive
                      ? 'bg-admin-accent text-white border-l-2 border-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-white/50'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Profile & Sign Out Footer */}
          <div className="p-4 border-t border-white/10 bg-[#0B131B]/60 flex items-center justify-between gap-3">
            <div className="truncate">
              <p className="font-body text-xs font-semibold text-white truncate">
                {session?.name}
              </p>
              <p className="font-mono text-[10px] text-white/50 truncate">
                {session?.email}
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                await logout()
                navigate('/')
              }}
              className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </aside>

        {/* 3. Main Console Workspace */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Mobile Header Bar */}
          <div className="md:hidden bg-[#E6EAEC] border-b border-[#C9D0D4] p-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 border border-ink/20 text-ink"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-mono text-xs uppercase font-semibold text-ink">
              {activeClubName}
            </span>
          </div>

          {/* Content Pane */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  )
}
