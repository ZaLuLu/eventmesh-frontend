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
  const { can, canAccessAdmin, role } = usePermission()
  const { organization } = useOrg()

  // Guard: if user is not authorized for admin
  if (!canAccessAdmin()) {
    return (
      <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-surface border border-line p-8 rounded-panel space-y-4">
          <span className="text-caption font-semibold text-danger">
            403 · Access forbidden
          </span>
          <h2 className="text-h2 font-semibold text-text">Administrative restraint</h2>
          <p className="text-small text-text-2">
            You do not possess valid administrative privileges to access the EventMesh console.
            Please sign in with an organizer, staff, or volunteer identity.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/admin/login"
              className="w-full bg-accent text-on-accent py-2.5 rounded-btn text-small font-semibold text-center hover:bg-accent-hover transition-colors"
            >
              Sign In to Console
            </Link>
            <Link
              to="/"
              className="w-full border border-line bg-surface py-2.5 rounded-btn text-small font-semibold text-center hover:bg-subtle transition-colors"
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
    { label: 'Events', path: '/admin/events', icon: <CalendarDays className="h-4 w-4" />, show: !isVolunteer },
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
    <div className="min-h-screen bg-bg text-text font-body flex flex-col admin-scope">
      {/* 1. Permanent 28px Top Strip */}
      <div className="h-7 bg-[#0B131B] text-white/80 px-4 flex items-center justify-between text-caption border-b border-white/10 select-none z-50">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-white tracking-wider">ADMIN CONSOLE</span>
          <span className="opacity-40">·</span>
          <span>{organization?.name || 'Technical Association'}</span>
          <span className="opacity-40">·</span>
          <div className="inline-flex items-center gap-1.5 text-white">
            {session?.clubColor && (
              <span
                className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: session.clubColor }}
              />
            )}
            <span className="font-semibold">{activeClubName}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="text-caption bg-accent px-2 py-0.5 text-on-accent rounded font-medium">
            {session?.role?.replace('_', ' ')}
          </span>
          <Link
            to="/"
            className="text-white/80 hover:text-white inline-flex items-center gap-1 transition-colors"
          >
            <span>Public website</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 2. Admin Sidebar */}
        <aside
          className={`fixed inset-y-7 left-0 z-40 w-64 bg-sidebar text-white border-r border-white/10 flex flex-col transition-transform duration-200 md:static md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Sidebar Header (56px) */}
          <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
            <div>
              <h1 className="text-small font-semibold text-white">
                Console Core
              </h1>
              <p className="text-caption text-white/50">
                Federation management
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
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-btn text-small font-medium transition-colors ${
                    isActive
                      ? 'bg-accent text-on-accent'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className={isActive ? 'text-on-accent' : 'text-white/50'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Profile & Sign Out Footer */}
          <div className="p-3 border-t border-white/10 bg-black/20 flex items-center justify-between gap-3">
            <div className="truncate">
              <p className="text-small font-medium text-white truncate">
                {session?.name}
              </p>
              <p className="text-caption text-white/50 truncate font-mono">
                {session?.email}
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                await logout()
                navigate('/')
              }}
              className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-btn transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </aside>

        {/* 3. Main Console Workspace */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-bg">
          {/* Mobile Header Bar (56px) */}
          <div className="md:hidden h-14 bg-surface border-b border-line px-4 flex items-center justify-between flex-shrink-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 border border-line rounded-btn text-text"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-small font-semibold text-text">
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
