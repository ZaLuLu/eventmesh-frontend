import React from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Users,
  QrCode,
  Award,
  BellRing,
  Plus,
  Send,
  ArrowUpRight,
  Clock,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { Button } from '@/design-system/primitives/Button'
import { formatDate } from '@/lib/dates'

export const AdminDashboardPage: React.FC = () => {
  const { session } = useAuth()
  const { role, clubId } = usePermission()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats', { orgId: session?.orgId || 'org-1', clubId: clubId || undefined }],
    queryFn: () =>
      api.analytics.getStats({
        orgId: session?.orgId || 'org-1',
        clubId: clubId || undefined,
      }),
  })

  const { data: events = [] } = useQuery({
    queryKey: ['admin-events-recent', { orgId: session?.orgId || 'org-1', clubId: clubId || undefined }],
    queryFn: () =>
      api.eventsAdmin.getAdminEvents({
        orgId: session?.orgId || 'org-1',
        clubId: clubId || undefined,
      }),
  })

  const recentEvents = events.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#C9D0D4]">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-60 block mb-1">
            Overview Dashboard
          </span>
          <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink">
            {session?.clubName || 'Federation Control'}
          </h1>
          <p className="font-body text-xs text-ink-60 mt-0.5">
            Signed in as {session?.name} ({role?.replace('_', ' ')})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/admin/events/new">
            <Button surface="admin" size="sm" icon={<Plus className="h-4 w-4" />}>
              Create Event
            </Button>
          </Link>
          <Link to="/admin/announcements">
            <Button surface="admin" variant="secondary" size="sm" icon={<Send className="h-4 w-4" />}>
              Post Notice
            </Button>
          </Link>
        </div>
      </div>

      {/* Flat Square Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-5 bg-paper border border-[#C9D0D4] space-y-1">
          <p className="font-mono text-[10px] uppercase text-ink-60">Total Events</p>
          <p className="font-display text-3xl text-ink">{stats?.eventsCount || 0}</p>
          <p className="font-mono text-[10px] text-ink-60">Active in system</p>
        </div>

        <div className="p-5 bg-paper border border-[#C9D0D4] space-y-1">
          <p className="font-mono text-[10px] uppercase text-ink-60">Upcoming</p>
          <p className="font-display text-3xl text-ink">{stats?.upcomingCount || 0}</p>
          <p className="font-mono text-[10px] text-ink-60">Published horizon</p>
        </div>

        <div className="p-5 bg-paper border border-[#C9D0D4] space-y-1">
          <p className="font-mono text-[10px] uppercase text-ink-60">Registrations</p>
          <p className="font-display text-3xl text-ink">{stats?.registrationsCount || 0}</p>
          <p className="font-mono text-[10px] text-ink-60">Passes issued</p>
        </div>

        <div className="p-5 bg-paper border border-[#C9D0D4] space-y-1">
          <p className="font-mono text-[10px] uppercase text-ink-60">Check-ins</p>
          <p className="font-display text-3xl text-ink">{stats?.checkinsCount || 0}</p>
          <p className="font-mono text-[10px] text-emerald-800 font-semibold">Verified entries</p>
        </div>

        <div className="p-5 bg-paper border border-[#C9D0D4] space-y-1">
          <p className="font-mono text-[10px] uppercase text-ink-60">Certificates</p>
          <p className="font-display text-3xl text-ink">{stats?.certificatesCount || 0}</p>
          <p className="font-mono text-[10px] text-ink-60">Authenticated</p>
        </div>

        <div className="p-5 bg-paper border border-[#C9D0D4] space-y-1">
          <p className="font-mono text-[10px] uppercase text-ink-60">Dispatches</p>
          <p className="font-display text-3xl text-ink">{stats?.notificationsCount || 0}</p>
          <p className="font-mono text-[10px] text-ink-60">Audience notices</p>
        </div>
      </div>

      {/* Registrations Cadence Flat Chart */}
      <div className="p-6 bg-paper border border-[#C9D0D4] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl uppercase text-ink">
            Registrations Over Time (Past 7 Days)
          </h2>
          <span className="font-mono text-xs uppercase text-ink-60">
            Total Velocity
          </span>
        </div>

        <div className="h-44 pt-6 flex items-end gap-4 sm:gap-8 border-b border-[#C9D0D4]">
          {stats?.registrationsTimeline.map((item) => {
            const heightPct = Math.min(100, Math.round((item.count / 500) * 100))
            return (
              <div key={item.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="font-mono text-[10px] font-bold text-ink opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.count}
                </span>
                <div
                  className="w-full bg-[#1F5F5B] hover:bg-[#14423F] transition-colors"
                  style={{ height: `${heightPct}%` }}
                />
                <span className="font-mono text-[10px] uppercase text-ink-60">
                  {item.date}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity / Events Table */}
      <div className="p-6 bg-paper border border-[#C9D0D4] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#C9D0D4]">
          <h2 className="font-display text-xl uppercase text-ink">
            Recent Programming Activity
          </h2>
          <Link to="/admin/events" className="font-mono text-xs uppercase text-admin-accent hover:underline">
            View All Events →
          </Link>
        </div>

        <div className="divide-y divide-[#C9D0D4]">
          {recentEvents.map((evt) => (
            <div key={evt.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="inline-block h-2 w-2"
                    style={{ backgroundColor: evt.organizerColor }}
                  />
                  <span className="font-mono text-[10px] uppercase text-ink-60 font-semibold">
                    {evt.organizerName} · {evt.category}
                  </span>
                  <span className="font-mono text-[10px] uppercase px-1.5 py-0.2 bg-[#E6EAEC] text-ink">
                    {evt.status}
                  </span>
                </div>
                <h4 className="font-display text-lg uppercase text-ink">
                  {evt.title}
                </h4>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-ink-60">{formatDate(evt.startsAt)}</span>
                <Link
                  to={`/admin/events/${evt.id}/edit`}
                  className="px-2.5 py-1 border border-ink font-semibold hover:bg-ink hover:text-white uppercase transition-colors"
                >
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
