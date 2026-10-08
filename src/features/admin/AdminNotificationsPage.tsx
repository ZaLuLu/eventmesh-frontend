import React, { useState } from 'react'
import { BellRing, Send, Users, CheckSquare, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { useAdminEvents } from '@/hooks/useEvents'
import { useOrg } from '@/hooks/useOrg'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, Notification, AudienceType } from '@/api'
import { Button } from '@/design-system/primitives/Button'
import { Field } from '@/design-system/primitives/Field'
import { Select } from '@/design-system/primitives/Select'
import { formatDate } from '@/lib/dates'
import { useToast } from '@/design-system/primitives/Toast'

export const AdminNotificationsPage: React.FC = () => {
  const { session } = useAuth()
  const { clubId } = usePermission()
  const { labels } = useOrg()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: events = [] } = useAdminEvents({
    orgId: session?.orgId || 'org-1',
    clubId: clubId || undefined,
  })

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['admin-notifications', clubId],
    queryFn: () => api.notifications.getNotifications({ orgId: 'org-1', clubId: clubId || undefined }),
  })

  const sendMutation = useMutation({
    mutationFn: (notif: Partial<Notification>) => api.notifications.sendNotification(notif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '')
  const [audienceType, setAudienceType] = useState<AudienceType>('all')
  const [customSegment, setCustomSegment] = useState(labels.audienceSegments[0] || 'Technical Faculty')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [includePoster, setIncludePoster] = useState(true)
  const [includeLink, setIncludeLink] = useState(true)
  const [includeContact, setIncludeContact] = useState(true)

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0]

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      toast({ title: 'Validation Error', message: 'Subject and message body required.', type: 'error' })
      return
    }

    try {
      await sendMutation.mutateAsync({
        orgId: 'org-1',
        organizerId: clubId || undefined,
        organizerName: session?.clubName,
        eventId: selectedEvent?.id,
        eventTitle: selectedEvent?.title,
        title,
        body,
        audience: {
          type: audienceType,
          segmentId: audienceType === 'segment' ? customSegment : undefined,
          description:
            audienceType === 'segment'
              ? `Configured Segment: ${customSegment}`
              : `Audience Target: ${audienceType.replace('_', ' ').toUpperCase()}`,
        },
        includes: {
          poster: includePoster,
          registrationLink: includeLink,
          contact: includeContact,
        },
        channel: 'email',
      })

      toast({
        title: 'Dispatch Delivered',
        message: 'Direct audience notification sent to all targeted participants.',
        type: 'success',
      })
      setTitle('')
      setBody('')
    } catch {
      toast({ title: 'Dispatch failed', type: 'error' })
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#C9D0D4]">
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-60 block mb-1">
          Audience Engagement & Dispatch
        </span>
        <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink">
          Audience Notifications
        </h1>
        <p className="font-body text-xs text-ink-60 mt-0.5">
          Dispatch email and app notices to followers, past symposium attendees, or institutional segments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 cols: Dispatch Composer */}
        <form onSubmit={handleSend} className="lg:col-span-6 p-6 bg-paper border border-[#C9D0D4] space-y-5">
          <h3 className="font-display text-xl uppercase text-ink">
            Compose Targeted Dispatch
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[10px] uppercase text-ink-60 block mb-1">
                Attach Event Dossier:
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-paper border border-[#C9D0D4] p-2 font-mono text-xs uppercase focus:outline-none"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase text-ink-60 block mb-1">
                Target Audience Cohort:
              </label>
              <select
                value={audienceType}
                onChange={(e) => setAudienceType(e.target.value as AudienceType)}
                className="w-full bg-paper border border-[#C9D0D4] p-2 font-mono text-xs uppercase focus:outline-none"
              >
                <option value="all">All Subscribed Members</option>
                <option value="followers">Club Dedicated Followers</option>
                <option value="club_members">Active Club Members</option>
                <option value="past_attendees">Past Event Attendees</option>
                <option value="segment">Configurable Audience Segment</option>
              </select>
            </div>
          </div>

          {audienceType === 'segment' && (
            <div>
              <label className="font-mono text-[10px] uppercase text-ink-60 block mb-1">
                Select Configured Institutional Segment:
              </label>
              <select
                value={customSegment}
                onChange={(e) => setCustomSegment(e.target.value)}
                className="w-full bg-paper border border-[#C9D0D4] p-2 font-mono text-xs uppercase focus:outline-none"
              >
                {labels.audienceSegments.map((seg) => (
                  <option key={seg} value={seg}>
                    {seg}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Field
            surface="admin"
            label="Dispatch Subject"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Official Call for Registrations · Hackathon Tracks"
          />

          <Field
            surface="admin"
            multiline
            rows={5}
            label="Message Body"
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Dear fellows, we are pleased to announce..."
          />

          {/* Attachments checklist */}
          <div className="space-y-2 border-t border-[#C9D0D4] pt-3">
            <span className="font-mono text-[10px] uppercase text-ink-60 block">
              Auto-Appended Embeds:
            </span>
            <div className="flex flex-wrap gap-4 font-mono text-xs uppercase">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePoster}
                  onChange={(e) => setIncludePoster(e.target.checked)}
                  className="rounded-none border-ink"
                />
                <span>Include Event Poster</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLink}
                  onChange={(e) => setIncludeLink(e.target.checked)}
                  className="rounded-none border-ink"
                />
                <span>Direct Pass Link</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeContact}
                  onChange={(e) => setIncludeContact(e.target.checked)}
                  className="rounded-none border-ink"
                />
                <span>Lead Contact Card</span>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            surface="admin"
            size="md"
            fullWidth
            loading={sendMutation.isPending}
            icon={<Send className="h-4 w-4" />}
          >
            Dispatch Broadcast
          </Button>
        </form>

        {/* Right 6 cols: Dispatch History Log */}
        <div className="lg:col-span-6 p-6 bg-paper border border-[#C9D0D4] space-y-4">
          <h3 className="font-display text-xl uppercase text-ink pb-3 border-b border-[#C9D0D4]">
            Notification History Log ({notifications.length})
          </h3>

          {isLoading ? (
            <p className="font-mono text-xs uppercase text-ink-60 py-4">Reading dispatch log...</p>
          ) : notifications.length === 0 ? (
            <p className="font-mono text-xs uppercase text-ink-60 py-4">No broadcast dispatches sent yet.</p>
          ) : (
            <div className="divide-y divide-[#C9D0D4] max-h-[500px] overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="py-4 space-y-2 font-body text-xs">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase text-ink-60">
                    <span className="font-bold text-ink">
                      Cohort: {n.audience.type.toUpperCase()}{' '}
                      {n.audience.segmentId ? `(${n.audience.segmentId})` : ''}
                    </span>
                    <span>{formatDate(n.sentAt)}</span>
                  </div>

                  <h4 className="font-display text-lg uppercase text-ink">{n.title}</h4>
                  <p className="text-ink-60 line-clamp-2">{n.body}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#C9D0D4] font-mono text-[10px] uppercase text-ink-60">
                    <span>Sender: {n.sentBy}</span>
                    <span>Delivered: {n.stats.deliveredCount} recipients</span>
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
