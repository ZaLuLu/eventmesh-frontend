import React, { useState } from 'react'
import { Send, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '@/hooks/useAnnouncements'
import { Button } from '@/design-system/primitives/Button'
import { Field } from '@/design-system/primitives/Field'
import { Select } from '@/design-system/primitives/Select'
import { formatDate } from '@/lib/dates'
import { useToast } from '@/design-system/primitives/Toast'
import { AnnouncementKind } from '@/api'

export const AdminAnnouncementsPage: React.FC = () => {
  const { session } = useAuth()
  const { clubId } = usePermission()
  const { toast } = useToast()

  const { data: announcements = [], isLoading } = useAnnouncements({
    organizerId: clubId || undefined,
  })

  const createMutation = useCreateAnnouncement()
  const deleteMutation = useDeleteAnnouncement()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [kind, setKind] = useState<AnnouncementKind>('notice')
  const [pinned, setPinned] = useState(false)

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      toast({ title: 'Validation Error', message: 'Title and content are required.', type: 'error' })
      return
    }

    try {
      await createMutation.mutateAsync({
        title,
        body,
        kind,
        pinned,
        organizerId: clubId || undefined,
      })
      toast({ title: 'Notice Dispatched', message: 'Published to the public announcements board.', type: 'success' })
      setTitle('')
      setBody('')
      setPinned(false)
    } catch {
      toast({ title: 'Publish failed', type: 'error' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this announcement?')) return
    try {
      await deleteMutation.mutateAsync(id)
      toast({ title: 'Notice Removed', type: 'info' })
    } catch {
      toast({ title: 'Delete failed', type: 'error' })
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pb-4 border-b border-line">
        <span className="text-caption font-semibold text-accent block mb-0.5">
          Public Wire Dispatch
        </span>
        <h1 className="text-h2 font-semibold text-text">
          Announcements & Bulletins
        </h1>
        <p className="text-small text-text-2 mt-0.5">
          Publish official notices, schedule modifications, and results to the federation feed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 cols: Compose Form */}
        <form onSubmit={handlePublish} className="lg:col-span-6 p-5 bg-surface border border-line rounded-panel space-y-4">
          <h3 className="text-h3 font-semibold text-text">
            Compose New Notice
          </h3>

          <Select
            surface="admin"
            label="Notice Classification"
            value={kind}
            onChange={(e) => setKind(e.target.value as AnnouncementKind)}
            options={[
              { value: 'notice', label: 'Standard Notice' },
              { value: 'deadline', label: 'Application Deadline' },
              { value: 'event_change', label: 'Schedule Change' },
              { value: 'venue_change', label: 'Venue Change' },
              { value: 'result', label: 'Competition Result' },
              { value: 'general', label: 'General Message' },
            ]}
          />

          <Field
            surface="admin"
            label="Notice Headline"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Schedule Revision: Turing Hackathon Midnight Checkpoint"
          />

          <Field
            surface="admin"
            multiline
            rows={4}
            label="Body Text"
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Detailed statement..."
          />

          <label className="flex items-center gap-2 cursor-pointer text-small text-text">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="h-4 w-4 rounded text-accent"
            />
            <span>Pin this notice to top of public board</span>
          </label>

          <Button
            type="submit"
            surface="admin"
            size="sm"
            fullWidth
            loading={createMutation.isPending}
            icon={<Send className="h-4 w-4" />}
          >
            Publish Notice
          </Button>
        </form>

        {/* Right 6 cols: History Log */}
        <div className="lg:col-span-6 p-5 bg-surface border border-line rounded-panel space-y-3">
          <h3 className="text-h3 font-semibold text-text pb-2 border-b border-line">
            Past Dispatches ({announcements.length})
          </h3>

          {isLoading ? (
            <p className="text-small text-text-3 py-4 text-center">Reading feed...</p>
          ) : announcements.length === 0 ? (
            <p className="text-small text-text-3 py-4 text-center">No past notices posted.</p>
          ) : (
            <div className="divide-y divide-line max-h-[460px] overflow-y-auto">
              {announcements.map((item) => (
                <div key={item.id} className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between text-caption">
                    <div className="flex items-center gap-1.5">
                      {item.pinned && (
                        <span className="bg-accent text-on-accent px-1.5 py-0.5 rounded text-caption font-semibold">
                          Pinned
                        </span>
                      )}
                      <span className="border border-line bg-subtle px-1.5 py-0.5 rounded capitalize text-text">
                        {item.kind.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-text-3">{formatDate(item.publishedAt)}</span>
                  </div>

                  <h4 className="text-small font-semibold text-text">{item.title}</h4>
                  <p className="text-small text-text-2 line-clamp-2">{item.body}</p>

                  <div className="flex justify-end pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-text-3 hover:text-danger p-1 transition-colors"
                      title="Delete notice"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
