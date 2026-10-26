// Hallmark macrostructure: Gallery-Masonry
import React, { useState } from 'react'
import { MagnifyingGlassPlus, X, Sparkle, Camera } from '@phosphor-icons/react'
import { useClubs } from '@/hooks/useClubs'
import { PageShell } from '@/design-system/layout/PageShell'
import { SectionHeader } from '@/design-system/SectionHeader'
import { Sticker } from '@/design-system/primitives/Sticker'
import { getClubTheme } from '@/design-system/clubColors'

interface GalleryItem {
  id: string
  url: string
  caption?: string
  clubName: string
  clubColor?: string
}

export const GalleryPage: React.FC = () => {
  const { data: clubs = [], isLoading } = useClubs()
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null)
  const [selectedClub, setSelectedClub] = useState<string>('all')

  const allPhotos: GalleryItem[] = clubs.flatMap((c) =>
    (c.gallery || []).map((g) => ({
      ...g,
      clubName: c.name,
      clubColor: c.color,
    }))
  )

  const filteredPhotos = selectedClub === 'all'
    ? allPhotos
    : allPhotos.filter((p) => p.clubName.toLowerCase() === selectedClub.toLowerCase())

  // Subtle rotation array within funk budget (±2°)
  const rotations = [-2, 1.5, -1, 2, -1.5, 1, -2, 1.5, -1]

  return (
    <PageShell className="py-8 sm:py-12 space-y-8">
      {/* Editorial Header */}
      <div className="space-y-4">
        <SectionHeader
          badge="CAMPUS ARCHIVES"
          badgeColor="pink"
          title="Community Polaroid Gallery"
          accentWord="Polaroid"
          subtitle="Candid snapshots, build sessions, and stage moments captured across hackathons, robotics arenas, and technical workshops."
        />

        {/* Club Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2">
          <button
            type="button"
            onClick={() => setSelectedClub('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-colors border-2 border-ink ${
              selectedClub === 'all'
                ? 'bg-ink text-paper shadow-[2px_2px_0_#151130]'
                : 'bg-card text-ink-soft hover:text-ink'
            }`}
          >
            All Clubs ({allPhotos.length})
          </button>

          {clubs.map((club) => {
            const theme = getClubTheme(club.name)
            const isSelected = selectedClub.toLowerCase() === club.name.toLowerCase()
            return (
              <button
                key={club.id}
                type="button"
                onClick={() => setSelectedClub(isSelected ? 'all' : club.name)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-colors border-2 border-ink ${
                  isSelected
                    ? 'bg-ink text-paper shadow-[2px_2px_0_#151130]'
                    : 'bg-card text-ink hover:bg-paper-2'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-ink"
                  style={{ backgroundColor: theme.hex }}
                />
                <span>{club.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Polaroid Masonry Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 rounded-[18px] bg-paper-2 border-2 border-ink animate-pulse shadow-[4px_4px_0_#151130]"
            />
          ))}
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="rounded-[20px] border-2 border-ink bg-card p-12 text-center space-y-3 shadow-[4px_4px_0_#151130]">
          <Camera className="w-10 h-10 text-ink-soft mx-auto" weight="duotone" />
          <h3 className="font-display font-bold text-xl text-ink">No photos found</h3>
          <p className="text-ink-soft text-sm">
            No snapshots match this filter. Try selecting "All Clubs" to browse campus moments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
          {filteredPhotos.map((photo, idx) => {
            const rotation = rotations[idx % rotations.length]
            const theme = getClubTheme(photo.clubName)

            return (
              <div
                key={photo.id || idx}
                onClick={() => setActivePhoto(photo)}
                style={{ transform: `rotate(${rotation}deg)` }}
                className="group relative rounded-[20px] border-2 border-ink bg-card p-4 pb-6 shadow-[5px_5px_0_#151130] hover:shadow-[8px_8px_0_#151130] hover:scale-[1.02] hover:rotate-0 transition-[box-shadow,transform] duration-200 cursor-pointer select-none flex flex-col justify-between"
              >
                {/* Washi Tape Accent on Top Edge */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-mustard/80 border border-ink/40 shadow-sm rotate-1 z-10"
                  aria-hidden="true"
                />

                {/* Photo Area */}
                <div className="relative aspect-[4/3] rounded-[12px] border-2 border-ink bg-paper-2 overflow-hidden mb-4">
                  <img
                    src={photo.url}
                    alt={photo.caption || `${photo.clubName} moment`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Hover Zoom Overlay */}
                  <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-2.5 rounded-full bg-card border-2 border-ink shadow-[2px_2px_0_#151130] text-ink">
                      <MagnifyingGlassPlus className="w-5 h-5" weight="bold" />
                    </span>
                  </div>
                </div>

                {/* Handwritten-Style Polaroid Footer */}
                <div className="space-y-2 px-1">
                  <div className="flex items-center justify-between gap-2">
                    <Sticker color={theme.token} size="sm" className="font-bold text-[11px]">
                      {photo.clubName}
                    </Sticker>
                    <span className="text-xs font-mono font-bold text-ink-soft">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {photo.caption && (
                    <p className="font-serif italic text-ink text-sm sm:text-base leading-relaxed line-clamp-2 pt-1">
                      "{photo.caption}"
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-ink/85 p-4 sm:p-8 flex items-center justify-center cursor-pointer animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full rounded-[24px] border-2 border-ink bg-card p-4 sm:p-6 shadow-[8px_8px_0_#151130] space-y-4 cursor-default"
          >
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full border-2 border-ink bg-paper hover:bg-paper-2 text-ink transition-colors z-20"
              aria-label="Close photo"
            >
              <X className="w-5 h-5" weight="bold" />
            </button>

            <div className="aspect-[16/10] sm:aspect-[16/9] max-h-[70vh] rounded-[16px] border-2 border-ink overflow-hidden bg-paper-2">
              <img
                src={activePhoto.url}
                alt={activePhoto.caption || 'Expanded photograph'}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between gap-4 pt-1 px-1">
              <div className="space-y-1">
                <Sticker color={getClubTheme(activePhoto.clubName).token} size="sm" className="font-bold text-xs">
                  {activePhoto.clubName}
                </Sticker>
                {activePhoto.caption && (
                  <p className="font-serif italic text-base sm:text-lg text-ink">
                    "{activePhoto.caption}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}
