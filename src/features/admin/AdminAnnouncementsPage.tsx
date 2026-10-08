import React, { useState } from 'react'
import { Pin, Send, Trash2, Megaphone } from 'lucide-react'
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
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#C9D0D4]">
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-60 block mb-1">
          Public Wire Dispatch
        </span>
        <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink">
          Announcements & Bulletins
        </h1>
        <p className="font-body text-xs text-ink-60 mt-0.5">
          Publish official notices, schedule modifications, and results to the federation feed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 cols: Compose Form */}
        <form onSubmit={handlePublish} className="lg:col-span-6 p-6 bg-paper border border-[#C9D0D4] space-y-5">
          <h3 className="font-display text-xl uppercase text-ink">
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
            rows={5}
            label="Body Text"
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Detailed statement..."
          />

          <label className="flex items-center gap-2 cursor-pointer font-mono text-xs uppercase text-ink">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="h-4 w-4 rounded-none border border-ink text-admin-accent"
            />
            <span>Pin this notice to top of public board</span>
          </label>

          <Button
            type="submit"
            surface="admin"
            size="md"
            fullWidth
            loading={createMutation.isPending}
            icon={<Send className="h-4 w-4" />}
          >
            Publish Notice
          </Button>
        </form>

        {/* Right 6 cols: History Log */}
        <div className="lg:col-span-6 p-6 bg-paper border border-[#C9D0D4] space-y-4">
          <h3 className="font-display text-xl uppercase text-ink pb-3 border-b border-[#C9D0D4]">
            Past Dispatches ({announcements.length})
          </h3>

          {isLoading ? (
            <p className="font-mono text-xs uppercase text-ink-60 py-4">Reading feed...</p>
          ) : announcements.length === 0 ? (
            <p className="font-mono text-xs uppercase text-ink-60 py-4">No past notices posted.</p>
          ) : (
            <div className="divide-y divide-[#C9D0D4] max-h-[500px] overflow-y-auto">
              {announcements.map((item) => (
                <div key={item.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase">
                    <div className="flex items-center gap-2">
                      {item.pinned && (
                        <span className="bg-ink text-paper px-1.5 py-0.2 font-bold">PINNED</span>
                      )}
                      <span className="border border-ink px-1.5 py-0.2 font-semibold">
                        {item.kind}
                      </span>
                    </div>
                    <span className="text-ink-60">{formatDate(item.publishedAt)}</span>
                  </div>

                  <h4 className="font-display text-lg uppercase text-ink">{item.title}</h4>
                  <p className="font-body text-xs text-ink-60 line-clamp-2">{item.body}</p>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-ink-60 hover:text-[#A32828] p-1"
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
