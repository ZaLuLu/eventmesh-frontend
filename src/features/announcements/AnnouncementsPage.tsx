// Hallmark macrostructure: Feed-Announcements
import React, { useState } from 'react'
import {
  PushPin,
  Megaphone,
  Clock,
  WarningCircle,
  CheckCircle,
  Info,
  CalendarCheck,
} from '@phosphor-icons/react'
import { useAnnouncements } from '@/hooks/useAnnouncements'
import { PageShell } from '@/design-system/layout/PageShell'
import { SectionHeader } from '@/design-system/SectionHeader'
import { Sticker } from '@/design-system/primitives/Sticker'
import { formatDate } from '@/lib/format'
import { getClubTheme } from '@/design-system/clubColors'

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

  const pinnedAnnouncements = filtered.filter((a) => a.pinned)
  const regularAnnouncements = filtered.filter((a) => !a.pinned)

  const getKindBadge = (kind: string) => {
    switch (kind) {
      case 'deadline':
        return { color: 'purple' as const, label: 'Deadline', icon: <Clock className="w-3.5 h-3.5" weight="bold" /> }
      case 'event_change':
        return { color: 'pink' as const, label: 'Schedule Update', icon: <WarningCircle className="w-3.5 h-3.5" weight="bold" /> }
      case 'result':
        return { color: 'mint' as const, label: 'Results Released', icon: <CheckCircle className="w-3.5 h-3.5" weight="bold" /> }
      default:
        return { color: 'sky' as const, label: 'Official Notice', icon: <Info className="w-3.5 h-3.5" weight="bold" /> }
    }
  }

  return (
    <PageShell className="py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <SectionHeader
          badge="CAMPUS DISPATCH"
          badgeColor="purple"
          title="Announcements & Bulletins"
          accentWord="Bulletins"
          subtitle="Official broadcasts, team deadlines, venue relocations, and competition results posted directly by campus club leads."
        />

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2">
          {kinds.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setSelectedKind(k.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold flex-shrink-0 transition-colors border-2 border-ink ${
                selectedKind === k.id
                  ? 'bg-ink text-paper shadow-[2px_2px_0_#151130]'
                  : 'bg-card text-ink-soft hover:text-ink hover:bg-paper-2'
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pinned Announcements Band */}
      {pinnedAnnouncements.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <PushPin className="w-4 h-4 text-accent" weight="fill" />
            <span className="font-display font-extrabold text-sm uppercase tracking-wider text-ink">
              Pinned Announcements
            </span>
          </div>

          <div className="space-y-4">
            {pinnedAnnouncements.map((item) => {
              const badge = getKindBadge(item.kind)
              const theme = getClubTheme(item.organizerName)

              return (
                <div
                  key={item.id}
                  className="rounded-[20px] border-2 border-ink bg-purple-500/10 dark:bg-purple-950/30 border-l-[8px] border-l-accent p-6 shadow-[4px_4px_0_#151130] space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Sticker color="purple" size="sm" icon={<PushPin className="w-3.5 h-3.5" weight="fill" />}>
                        Pinned
                      </Sticker>
                      <Sticker color={badge.color} size="sm" icon={badge.icon}>
                        {badge.label}
                      </Sticker>
                      {item.organizerName && (
                        <Sticker color={theme.token} size="sm">
                          {item.organizerName}
                        </Sticker>
                      )}
                    </div>

                    <span className="text-xs font-mono font-bold text-ink-soft">
                      {formatDate(item.publishedAt, 'medium')}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-xl sm:text-2xl text-ink leading-tight tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-ink-soft text-sm sm:text-base leading-relaxed whitespace-pre-line">
                    {item.body}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Regular Feed List */}
      <section className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 rounded-[18px] bg-paper-2 border-2 border-ink animate-pulse shadow-[4px_4px_0_#151130]"
              />
            ))}
          </div>
        ) : regularAnnouncements.length === 0 && pinnedAnnouncements.length === 0 ? (
          <div className="rounded-[20px] border-2 border-ink bg-card p-12 text-center space-y-3 shadow-[4px_4px_0_#151130]">
            <Megaphone className="w-10 h-10 text-ink-soft mx-auto" weight="duotone" />
            <h3 className="font-display font-bold text-xl text-ink">No announcements found</h3>
            <p className="text-ink-soft text-sm">
              There are currently no active announcements matching this filter category.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {regularAnnouncements.map((item) => {
              const badge = getKindBadge(item.kind)
              const theme = getClubTheme(item.organizerName)

              return (
                <div
                  key={item.id}
                  className="rounded-[20px] border-2 border-ink bg-card p-6 shadow-[4px_4px_0_#151130] space-y-3 hover:shadow-[6px_6px_0_#151130] transition-shadow"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Sticker color={badge.color} size="sm" icon={badge.icon}>
                        {badge.label}
                      </Sticker>
                      {item.organizerName && (
                        <Sticker color={theme.token} size="sm">
                          {item.organizerName}
                        </Sticker>
                      )}
                    </div>

                    <span className="text-xs font-mono font-bold text-ink-soft">
                      {formatDate(item.publishedAt, 'medium')}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-xl text-ink leading-tight tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-ink-soft text-sm sm:text-base leading-relaxed whitespace-pre-line">
                    {item.body}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </PageShell>
  )
}
