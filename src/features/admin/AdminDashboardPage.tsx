import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Send } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { Button } from '@/design-system/primitives/Button'
import { formatDate } from '@/lib/dates'

export const AdminDashboardPage: React.FC = () => {
  const { session } = useAuth()
  const { role, clubId } = usePermission()

  const { data: stats } = useQuery({
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
    <div className="space-y-6">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
        <div>
          <span className="text-caption font-semibold text-accent block mb-1">
            Overview dashboard
          </span>
          <h1 className="text-h2 font-semibold text-text">
            {session?.clubName || 'Federation Control'}
          </h1>
          <p className="text-small text-text-2 mt-0.5">
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-surface border border-line rounded-panel space-y-1">
          <p className="text-caption text-text-3 font-medium">Total Events</p>
          <p className="text-2xl font-semibold text-text tabular-nums">{stats?.eventsCount || 0}</p>
          <p className="text-caption text-text-2">Active in system</p>
        </div>

        <div className="p-4 bg-surface border border-line rounded-panel space-y-1">
          <p className="text-caption text-text-3 font-medium">Upcoming</p>
          <p className="text-2xl font-semibold text-text tabular-nums">{stats?.upcomingCount || 0}</p>
          <p className="text-caption text-text-2">Published horizon</p>
        </div>

        <div className="p-4 bg-surface border border-line rounded-panel space-y-1">
          <p className="text-caption text-text-3 font-medium">Registrations</p>
          <p className="text-2xl font-semibold text-text tabular-nums">{stats?.registrationsCount || 0}</p>
          <p className="text-caption text-text-2">Passes issued</p>
        </div>

        <div className="p-4 bg-surface border border-line rounded-panel space-y-1">
          <p className="text-caption text-text-3 font-medium">Check-ins</p>
          <p className="text-2xl font-semibold text-text tabular-nums">{stats?.checkinsCount || 0}</p>
          <p className="text-caption text-success font-medium">Verified entries</p>
        </div>

        <div className="p-4 bg-surface border border-line rounded-panel space-y-1">
          <p className="text-caption text-text-3 font-medium">Certificates</p>
          <p className="text-2xl font-semibold text-text tabular-nums">{stats?.certificatesCount || 0}</p>
          <p className="text-caption text-text-2">Authenticated</p>
        </div>

        <div className="p-4 bg-surface border border-line rounded-panel space-y-1">
          <p className="text-caption text-text-3 font-medium">Dispatches</p>
          <p className="text-2xl font-semibold text-text tabular-nums">{stats?.notificationsCount || 0}</p>
          <p className="text-caption text-text-2">Audience notices</p>
        </div>
      </div>

      {/* Registrations Cadence Flat Chart */}
      <div className="p-5 bg-surface border border-line rounded-panel space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-h3 font-semibold text-text">
            Registrations over time (past 7 days)
          </h2>
          <span className="text-caption text-text-3">
            Total velocity
          </span>
        </div>

        <div className="h-40 pt-4 flex items-end gap-3 sm:gap-6 border-b border-line">
          {stats?.registrationsTimeline.map((item) => {
            const heightPct = Math.min(100, Math.round((item.count / 500) * 100))
            return (
              <div key={item.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-caption font-semibold text-text opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                  {item.count}
                </span>
                <div
                  className="w-full bg-accent rounded-t-btn transition-opacity hover:opacity-90"
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-caption text-text-3 font-medium">
                  {item.date}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity / Events Table */}
      <div className="p-5 bg-surface border border-line rounded-panel space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <h2 className="text-h3 font-semibold text-text">
            Recent programming activity
          </h2>
          <Link to="/admin/events" className="text-small text-accent hover:underline font-medium">
            View All Events →
          </Link>
        </div>

        <div className="divide-y divide-line">
          {recentEvents.map((evt) => (
            <div key={evt.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: evt.organizerColor }}
                  />
                  <span className="text-caption text-text-3 font-medium">
                    {evt.organizerName} · {evt.category}
                  </span>
                  <span className="text-caption px-2 py-0.5 rounded-full bg-subtle text-text capitalize">
                    {evt.status}
                  </span>
                </div>
                <h4 className="text-small font-semibold text-text">
                  {evt.title}
                </h4>
              </div>

              <div className="flex items-center gap-4 text-small">
                <span className="text-text-3">{formatDate(evt.startsAt)}</span>
                <Link
                  to={`/admin/events/${evt.id}/edit`}
                  className="px-3 py-1 border border-line rounded-btn font-medium hover:bg-subtle text-text transition-colors text-small"
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
