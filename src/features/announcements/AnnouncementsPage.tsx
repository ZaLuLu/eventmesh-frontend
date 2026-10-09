import React, { useState } from 'react'
import { Pin } from 'lucide-react'
import { useAnnouncements } from '@/hooks/useAnnouncements'
import { Chip } from '@/design-system/primitives/Chip'
import { formatDate } from '@/lib/dates'
import { Skeleton } from '@/design-system/primitives/Skeleton'
import { EmptyState } from '@/design-system/primitives/EmptyState'

export const AnnouncementsPage: React.FC = () => {
  const [selectedKind, setSelectedKind] = useState('all')
  const { data: announcements = [], isLoading } = useAnnouncements()

  const kinds = [
    { id: 'all', label: 'All notices' },
    { id: 'notice', label: 'Notices' },
    { id: 'deadline', label: 'Deadlines' },
    { id: 'event_change', label: 'Schedule changes' },
    { id: 'result', label: 'Results' },
    { id: 'general', label: 'General' },
  ]

  const filtered = announcements.filter((a) => {
    if (selectedKind !== 'all' && a.kind !== selectedKind) return false
    return true
  })

  return (
    <div className="w-full bg-bg text-text pb-16">
      {/* Header Banner */}
      <div className="border-b border-line bg-surface">
        <div className="app-container py-6 sm:py-8 space-y-4">
          <div>
            <span className="text-caption font-semibold text-accent block mb-1">
              Official broadcasts
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text tracking-tight">
              Announcements & Notices
            </h1>
            <p className="text-small text-text-2 mt-0.5 max-w-xl">
              Communications, application deadlines, room updates, and results from campus collectives.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {kinds.map((k) => (
              <Chip
                key={k.id}
                label={k.label}
                size="sm"
                active={selectedKind === k.id}
                onClick={() => setSelectedKind(k.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="app-container py-8 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="h-32" rounded="rounded-panel" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No notices found"
            description="There are currently no active announcements matching this filter."
          />
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-panel border border-line bg-surface p-6 space-y-2.5"
            >
              <div className="flex flex-wrap items-center gap-2.5 text-small">
                {item.pinned && (
                  <span className="inline-flex items-center gap-1 bg-accent-soft text-accent px-2.5 py-0.5 rounded-full font-semibold text-caption">
                    <Pin className="h-3.5 w-3.5" />
                    <span>Pinned</span>
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-subtle text-text-2 font-medium text-caption border border-line">
                  {item.kind.replace('_', ' ')}
                </span>
                {item.organizerName && (
                  <span className="text-text-2 flex items-center gap-1.5 font-medium">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.organizerColor || '#C93E27' }}
                      aria-hidden="true"
                    />
                    <span>{item.organizerName}</span>
                  </span>
                )}
                <span className="text-line">·</span>
                <span className="text-text-3 text-caption">{formatDate(item.publishedAt, 'MMM d, yyyy')}</span>
              </div>

              <h3 className="font-semibold text-lg text-text">
                {item.title}
              </h3>

              <p className="text-small text-text-2 leading-relaxed whitespace-pre-line max-w-4xl">
                {item.body}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
