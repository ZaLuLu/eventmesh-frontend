import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, ExternalLink, Edit, Trash2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { useAdminEvents, usePublishEvent } from '@/hooks/useEvents'
import { Button } from '@/design-system/primitives/Button'
import { formatDate } from '@/lib/dates'
import { useToast } from '@/design-system/primitives/Toast'
import { api } from '@/api'

export const AdminEventsListPage: React.FC = () => {
  const { session } = useAuth()
  const { role, clubId } = usePermission()
  const { toast } = useToast()

  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: events = [], isLoading, refetch } = useAdminEvents({
    orgId: session?.orgId || 'org-1',
    clubId: clubId || undefined,
  })

  const publishMutation = usePublishEvent()

  const filtered = events.filter((e) => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!e.title.toLowerCase().includes(q) && !e.category.toLowerCase().includes(q)) {
        return false
      }
    }
    return true
  })

  const handlePublish = async (id: string, title: string) => {
    try {
      await publishMutation.mutateAsync(id)
      toast({
        title: 'Event Published',
        message: `"${title}" is now live on the public website and calendar.`,
        type: 'success',
      })
    } catch {
      toast({ title: 'Publish failed', type: 'error' })
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return
    try {
      await api.eventsAdmin.deleteEvent(id)
      toast({
        title: 'Event Removed',
        message: `Deleted "${title}".`,
        type: 'info',
      })
      refetch()
    } catch {
      toast({ title: 'Delete failed', type: 'error' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#C9D0D4]">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-60 block mb-1">
            Event Management Directorate
          </span>
          <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink">
            Events & Programming
          </h1>
          <p className="font-body text-xs text-ink-60 mt-0.5">
            Create, configure forms, publish to public catalogue, and manage attendee quotas.
          </p>
        </div>

        <Link to="/admin/events/new">
          <Button surface="admin" size="md" icon={<Plus className="h-4 w-4" />}>
            Create Event Wizard
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-paper border border-[#C9D0D4] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar font-mono text-xs uppercase">
          {['all', 'published', 'draft', 'in_review', 'live', 'completed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 transition-colors ${
                statusFilter === st
                  ? 'bg-admin-accent text-white font-bold'
                  : 'text-ink-60 hover:text-ink hover:bg-black/5'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full bg-paper text-ink font-body text-xs pl-9 pr-3 py-1.5 border border-[#C9D0D4] focus:outline-none focus:border-admin-accent"
          />
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-paper border border-[#C9D0D4] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[#C9D0D4] bg-[#E6EAEC]/60 font-mono text-[10px] uppercase text-ink-60 tracking-wider">
              <th className="py-3 px-4">Event & Category</th>
              <th className="py-3 px-4">Date & Venue</th>
              <th className="py-3 px-4">Capacity / Seats</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D4] font-body text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center font-mono text-ink-60 uppercase">
                  Loading records...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center font-mono text-ink-60 uppercase">
                  No events found matching this criteria.
                </td>
              </tr>
            ) : (
              filtered.map((evt) => (
                <tr key={evt.id} className="hover:bg-black/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="h-2 w-2 inline-block flex-shrink-0"
                        style={{ backgroundColor: evt.organizerColor }}
                      />
                      <span className="font-mono text-[10px] uppercase font-semibold text-ink-60">
                        {evt.organizerName} · {evt.category}
                      </span>
                    </div>
                    <Link
                      to={`/admin/events/${evt.id}/edit`}
                      className="font-display text-base uppercase text-ink hover:text-admin-accent"
                    >
                      {evt.title}
                    </Link>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <p className="font-semibold text-ink">{formatDate(evt.startsAt)}</p>
                    <p className="text-ink-60 text-[11px] truncate max-w-[160px]">{evt.venue.name}</p>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-ink">{evt.seatsLeft}</span>
                    <span className="text-ink-60"> / {evt.capacity}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block font-mono text-[10px] uppercase px-2 py-0.5 border ${
                        evt.status === 'published'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                          : evt.status === 'draft'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-[#E6EAEC] text-ink border-[#C9D0D4]'
                      }`}
                    >
                      {evt.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2 font-mono text-[11px]">
                      {evt.status === 'draft' && (
                        <button
                          type="button"
                          onClick={() => handlePublish(evt.id, evt.title)}
                          className="px-2 py-1 bg-ink text-paper hover:bg-admin-accent transition-colors uppercase font-semibold"
                        >
                          Publish
                        </button>
                      )}

                      <Link
                        to={`/admin/events/${evt.id}/edit`}
                        className="p-1.5 border border-ink/20 hover:border-ink text-ink"
                        title="Edit Event & Form"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Link>

                      {evt.status !== 'draft' && (
                        <Link
                          to={`/events/${evt.slug}`}
                          target="_blank"
                          className="p-1.5 border border-ink/20 hover:border-ink text-ink"
                          title="View Live Public Page"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(evt.id, evt.title)}
                        className="p-1.5 border border-ink/20 hover:border-[#A32828] text-ink hover:text-[#A32828]"
                        title="Delete Event"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
