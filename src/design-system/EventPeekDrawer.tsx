import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Share2,
  Bookmark,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { Event } from '@/api/contracts'
import { PosterArtwork } from './PosterArtwork'
import { Button } from './primitives/Button'
import { Badge } from './primitives/Badge'
import { formatCardDate, formatPrice } from './EventCard'
import { triggerConfetti } from '@/lib/confetti'
import { useToast } from './primitives/Toast'

export interface EventPeekDrawerProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  onBookmarkToggle?: (eventId: string) => void
  isBookmarked?: boolean
}

export const EventPeekDrawer: React.FC<EventPeekDrawerProps> = ({
  event,
  isOpen,
  onClose,
  onBookmarkToggle,
  isBookmarked = false,
}) => {
  const { toast } = useToast()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!event) return null

  const clubColor = event.club?.color || event.organizerColor || '#2F4BD6'
  const isVerified = event.club?.verified ?? true
  const dateStr = formatCardDate(event.startsAt)
  const isFree = event.isFree || event.price === 0 || !event.features?.paid
  const eventHref = `/events/${event.slug || event.id}`
  const registerHref = `/events/${event.slug || event.id}/register`

  const handleShare = () => {
    const url = `${window.location.origin}${eventHref}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
      triggerConfetti()
      toast({
        title: 'Event Link Copied',
        message: 'Share link has been copied to your clipboard.',
        type: 'success',
      })
    }
  }

  const handleBookmark = () => {
    onBookmarkToggle?.(event.id)
    triggerConfetti()
    toast({
      title: isBookmarked ? 'Removed from Bookmarks' : 'Saved to Bookmarks',
      message: `${event.title} is now in your saved tray.`,
      type: 'info',
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop with frosted blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-champion/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Quick View: ${event.title}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 w-full max-w-lg bg-surface text-ink border-l border-line shadow-2xl flex flex-col h-full overflow-hidden"
          >
            {/* Header Toolbar */}
            <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-surface/90 backdrop-blur sticky top-0 z-20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: clubColor }} />
                <span className="text-[13px] font-semibold text-ink-muted uppercase tracking-wider">
                  {event.club?.name || event.organizerName}
                </span>
                {isVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 fill-[#1FA34A] text-white" />
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBookmark}
                  aria-label="Bookmark event"
                  className="p-2 rounded-full hover:bg-subtle text-ink-muted hover:text-champion transition-colors"
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-champion text-champion' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share event"
                  className="p-2 rounded-full hover:bg-subtle text-ink-muted hover:text-champion transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close preview"
                  className="p-2 rounded-full hover:bg-subtle text-ink-muted hover:text-ink transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Artwork Banner */}
              <div className="relative aspect-[16/10] rounded-[22px] overflow-hidden border border-line shadow-sm">
                <PosterArtwork
                  id={event.id}
                  title={event.title}
                  category={event.category}
                  clubName={event.club?.name || event.organizerName}
                  clubColor={clubColor}
                  imageUrl={event.poster}
                  priority
                />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <Badge variant={isFree ? 'free' : 'promoted'}>
                    {formatPrice(event)}
                  </Badge>
                  {event.category && (
                    <span className="px-2.5 py-0.5 rounded-full text-caption font-semibold bg-white/90 backdrop-blur text-ink border border-line">
                      {event.category.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Headline */}
              <div>
                <span className="text-caption font-bold text-champion tracking-wider uppercase">
                  {dateStr}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-ink mt-1 leading-snug">
                  {event.title}
                </h2>
                {event.subtitle && (
                  <p className="text-small text-ink-muted mt-1 leading-relaxed">
                    {event.subtitle}
                  </p>
                )}
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-panel bg-subtle/50 border border-line/80">
                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-champion mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-caption text-ink-muted block font-medium">Date & Time</span>
                    <span className="text-small font-semibold text-ink">{dateStr}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-champion mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-caption text-ink-muted block font-medium">Location</span>
                    <span className="text-small font-semibold text-ink truncate block">
                      {event.venue?.name || 'Main Auditorium'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-champion mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-caption text-ink-muted block font-medium">Admission</span>
                    <span className="text-small font-semibold text-ink">
                      {isFree ? 'Free Admission' : formatPrice(event)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-champion mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-caption text-ink-muted block font-medium">Certificate</span>
                    <span className="text-small font-semibold text-ink">Verified Digital Pass</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-caption font-bold text-ink-muted uppercase tracking-wider mb-2">
                  About Event
                </h4>
                <p className="text-small text-ink/80 leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-caption font-medium bg-subtle text-ink-muted border border-line"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sticky Action Footer */}
            <div className="p-4 sm:p-6 border-t border-line bg-surface flex items-center gap-3">
              <Link to={eventHref} className="flex-1">
                <Button variant="secondary" fullWidth size="md">
                  <span>Full Details</span>
                  <ExternalLink className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>

              <Link to={registerHref} className="flex-1">
                <Button variant="primary" fullWidth size="md" className="bg-champion hover:bg-champion/90 text-white">
                  <span>Register Now</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
