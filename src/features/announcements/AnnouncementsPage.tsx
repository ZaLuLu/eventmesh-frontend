import React, { useState } from 'react'
import { Pin, Filter, Megaphone } from 'lucide-react'
import { useAnnouncements } from '@/hooks/useAnnouncements'
import { Chip } from '@/design-system/primitives/Chip'
import { formatDate } from '@/lib/dates'

export const AnnouncementsPage: React.FC = () => {
  const [selectedKind, setSelectedKind] = useState('all')
  const { data: announcements = [], isLoading } = useAnnouncements()

  const kinds = [
    { id: 'all', label: 'All Notices' },
    { id: 'notice', label: 'Notices' },
    { id: 'deadline', label: 'Deadlines' },
    { id: 'event_change', label: 'Schedule Changes' },
    { id: 'result', label: 'Results' },
    { id: 'general', label: 'General' },
  ]

  const filtered = announcements.filter((a) => {
    if (selectedKind !== 'all' && a.kind !== selectedKind) return false
    return true
  })

  return (
    <div className="w-full bg-paper text-ink min-h-screen">
      <div className="px-[4vw] pt-12 pb-8 border-b border-ink-15">
        <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-2">
          Dispatch Log & Announcements
        </span>
        <h1 className="font-display text-5xl sm:text-7xl uppercase text-ink">
          Notices
        </h1>
        <p className="font-body text-base text-ink-60 max-w-xl mt-3">
          Official communications, application deadlines, venue notifications, and results from member clubs.
        </p>
      </div>

      {/* Filter Chips */}
      <div className="px-[4vw] py-4 border-b border-ink-15 bg-paper-deep/30 flex flex-wrap items-center gap-2">
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

      {/* Announcements List */}
      <div className="px-[4vw] py-8 divide-y divide-ink-15">
        {isLoading ? (
          <div className="py-12 text-center font-mono text-xs uppercase text-ink-60">
            Reading Dispatch Wire...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center font-mono text-xs uppercase text-ink-60">
            No notices recorded under this filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="py-8 space-y-3">
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase">
                {item.pinned && (
                  <span className="inline-flex items-center gap-1 bg-ink text-paper px-2 py-0.5 font-bold">
                    <Pin className="h-3 w-3" />
                    <span>PINNED</span>
                  </span>
                )}
                <span className="px-2 py-0.5 border border-ink font-semibold">
                  {item.kind.replace('_', ' ')}
                </span>
                {item.organizerName && (
                  <span className="text-ink-60 flex items-center gap-1.5 font-medium">
                    <span
                      className="inline-block h-2 w-2"
                      style={{ backgroundColor: item.organizerColor || '#C66A4A' }}
                    />
                    <span>{item.organizerName}</span>
                  </span>
                )}
                <span className="text-ink-60">·</span>
                <span className="text-ink-60">{formatDate(item.publishedAt)}</span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl uppercase text-ink">
                {item.title}
              </h3>

              <p className="font-body text-base text-ink leading-relaxed max-w-4xl whitespace-pre-line">
                {item.body}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
