// Hallmark macrostructure: AdminConsole-EventsList
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MagnifyingGlass, ArrowUpRight, PencilSimple, Trash } from '@phosphor-icons/react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { useAdminEvents, usePublishEvent } from '@/hooks/useEvents'
import { Button } from '@/design-system/primitives/Button'
import { formatDate } from '@/lib/dates'
import { useToast } from '@/design-system/primitives/Toast'
import { api } from '@/api'

export const AdminEventsListPage: React.FC = () => {
  const { session } = useAuth()
  const { clubId } = usePermission()
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
      refetch()
    } catch {
      toast({ title: 'Publish failed', type: 'error' })
    }
  }

  const handleSubmitForApproval = async (id: string, title: string) => {
    try {
      await api.eventsAdmin.submitForApproval(id)
      toast({
        title: 'Submitted for Review',
        message: `"${title}" was submitted to institution leadership for publication.`,
        type: 'success',
      })
      refetch()
    } catch {
      toast({ title: 'Submission failed', type: 'error' })
    }
  }

  const handleCancelEvent = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to cancel "${title}"?`)) return
    try {
      if (api.eventsAdmin.cancelEvent) {
        await api.eventsAdmin.cancelEvent(id)
      }
      toast({
        title: 'Event Cancelled',
        message: `"${title}" has been cancelled.`,
        type: 'info',
      })
      refetch()
    } catch {
      toast({ title: 'Cancellation failed', type: 'error' })
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <span className="text-caption font-semibold text-accent block mb-0.5">
            Event Management Directorate
          </span>
          <h1 className="text-h2 font-semibold text-text">
            Events Directory
          </h1>
          <p className="text-small text-text-2 mt-0.5">
            Create, configure forms, publish to public catalogue, and manage attendee quotas.
          </p>
        </div>

        <Link to="/admin/events/new">
          <Button surface="admin" size="sm" icon={<Plus size={16} weight="bold" />}>
            Create Event Wizard
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar (Inline above the table) */}
      <div className="p-3 bg-surface border border-line rounded-panel flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-small">
          {['all', 'published', 'submitted', 'draft', 'cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-btn font-medium transition-colors capitalize ${
                statusFilter === st
                  ? 'bg-accent text-on-accent'
                  : 'text-text-2 hover:text-text hover:bg-subtle'
              }`}
            >
              {st === 'submitted' ? 'Submitted (In Review)' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full bg-surface text-text text-small pl-9 pr-3 py-1.5 border border-line rounded-btn focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-surface border border-line rounded-panel overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-line bg-subtle text-caption font-medium text-text-2 sticky top-0">
              <th className="py-3 px-4 font-semibold">Event & Category</th>
              <th className="py-3 px-4 font-semibold">Date & Venue</th>
              <th className="py-3 px-4 font-semibold">Capacity / Seats</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-small">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-small text-text-3">
                  Loading records...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-small text-text-3">
                  No events found matching this criteria.
                </td>
              </tr>
            ) : (
              filtered.map((evt) => (
                <tr key={evt.id} className="h-[52px] hover:bg-subtle/50 transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="h-2 w-2 rounded-full inline-block flex-shrink-0"
                        style={{ backgroundColor: evt.organizerColor }}
                      />
                      <span className="text-caption text-text-3 font-medium">
                        {evt.organizerName} · {evt.category}
                      </span>
                    </div>
                    <Link
                      to={`/admin/events/${evt.id}/edit`}
                      className="font-medium text-text hover:text-accent hover:underline line-clamp-1"
                    >
                      {evt.title}
                    </Link>
                  </td>

                  <td className="py-2.5 px-4 tabular-nums">
                    <p className="font-medium text-text">{formatDate(evt.startsAt)}</p>
                    <p className="text-caption text-text-3 truncate max-w-[160px]">{evt.venue.name}</p>
                  </td>

                  <td className="py-2.5 px-4 tabular-nums">
                    <span className="font-semibold text-text">{evt.seatsLeft}</span>
                    <span className="text-text-3"> / {evt.capacity}</span>
                  </td>

                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-block text-caption px-2 py-0.5 rounded-full border capitalize font-medium ${
                        evt.status === 'published'
                          ? 'bg-success/10 text-success border-success/30'
                          : evt.status === 'submitted' || evt.status === 'in_review'
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                          : evt.status === 'draft'
                          ? 'bg-warning/10 text-warning border-warning/30'
                          : evt.status === 'cancelled'
                          ? 'bg-danger/10 text-danger border-danger/30'
                          : 'bg-subtle text-text border-line'
                      }`}
                    >
                      {evt.status === 'submitted' || evt.status === 'in_review' ? 'Submitted' : evt.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {evt.status === 'draft' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSubmitForApproval(evt.id, evt.title)}
                            className="px-2 py-1 bg-subtle text-text hover:bg-accent hover:text-on-accent transition-colors rounded-btn text-caption font-semibold border border-line"
                            title="Submit for Review"
                          >
                            Submit
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePublish(evt.id, evt.title)}
                            className="px-2.5 py-1 bg-accent text-on-accent hover:bg-accent-hover transition-colors rounded-btn text-caption font-semibold"
                            title="Publish Directly"
                          >
                            Publish
                          </button>
                        </>
                      )}

                      {(evt.status === 'submitted' || evt.status === 'in_review') && (
                        <button
                          type="button"
                          onClick={() => handlePublish(evt.id, evt.title)}
                          className="px-2.5 py-1 bg-accent text-on-accent hover:bg-accent-hover transition-colors rounded-btn text-caption font-semibold"
                          title="Approve & Publish Live"
                        >
                          Approve
                        </button>
                      )}

                      {evt.status === 'published' && (
                        <button
                          type="button"
                          onClick={() => handleCancelEvent(evt.id, evt.title)}
                          className="px-2 py-1 bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors rounded-btn text-caption font-semibold border border-danger/30"
                          title="Cancel Event"
                        >
                          Cancel
                        </button>
                      )}

                      <Link
                        to={`/admin/events/${evt.id}/edit`}
                        className="p-1.5 border border-line rounded-btn hover:bg-subtle text-text transition-colors"
                        title="Edit Event & Form"
                      >
                        <PencilSimple size={14} weight="bold" />
                      </Link>

                      {evt.status !== 'draft' && (
                        <Link
                          to={`/events/${evt.slug}`}
                          target="_blank"
                          className="p-1.5 border border-line rounded-btn hover:bg-subtle text-text transition-colors"
                          title="View Live Public Page"
                        >
                          <ArrowUpRight size={14} weight="bold" />
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(evt.id, evt.title)}
                        className="p-1.5 border border-line rounded-btn hover:bg-danger/10 text-text hover:text-danger hover:border-danger/40 transition-colors"
                        title="Delete Event"
                      >
                        <Trash size={14} weight="bold" />
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
