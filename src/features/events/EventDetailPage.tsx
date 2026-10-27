import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useEvent } from '@/hooks/useEvents'
import { useMyRegistrations, useCancelMyRegistration, useJoinWaitlist, useRegister } from '@/hooks/useRegistrations'
import { useAuth } from '@/hooks/useAuth'
import { PageShell } from '@/design-system/layout/PageShell'
import { PosterArt } from '@/design-system/visuals/PosterArt'
import { Button } from '@/design-system/primitives/Button'
import { Badge } from '@/design-system/primitives/Badge'
import { BellToggle } from '@/design-system/micro/BellToggle'
import { QRCode } from '@/design-system/primitives/QRCode'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/design-system/ui/sheet'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/design-system/ui/accordion'
import { fireCelebrationConfetti } from '@/lib/confetti'
import { formatDate, formatTime, formatCurrency } from '@/lib/format'
import { Modal } from '@/design-system/primitives/Modal'
import { downloadICS, getGoogleCalendarUrl, getEventIcsUrl } from '@/lib/ics'
import { buildShareMeta } from '@/lib/shareMeta'
import { useToast } from '@/design-system/primitives/Toast'
import { Icon } from '@/design-system/Icon'
import { eventPriceLabel, eventDestination } from '@/lib/eventPresentation'
import { getCategoryAccent } from '@/design-system/VerticalPosterCard'
import { cn } from '@/lib/utils'
import {
  CheckCircle,
  CalendarPlus,
  Ticket,
  Copy,
  ArrowSquareOut,
  Fire,
  Buildings,
  User,
  ShieldCheck,
  ShareNetwork,
  CaretRight,
  Clock,
  MapPin,
  Check,
} from '@phosphor-icons/react'

interface TicketTierOption {
  id: string
  name: string
  price: number
  description: string
  perks: string[]
}

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: event, isLoading, error } = useEvent(slug || '')
  const { session } = useAuth()
  const { data: myRegistrations = [] } = useMyRegistrations()
  const cancelMutation = useCancelMyRegistration()
  const waitlistMutation = useJoinWaitlist()
  const registerMutation = useRegister()

  const [isReminded, setIsReminded] = useState(false)
  const [selectedTierId, setSelectedTierId] = useState('tier-standard')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [waitlistSuccess, setWaitlistSuccess] = useState(false)
  const [isFastRsvpOpen, setIsFastRsvpOpen] = useState(false)
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const [justConfirmedReg, setJustConfirmedReg] = useState<any>(null)

  const isImported = Boolean(event?.kind === 'imported' || event?.sourceUrl)
  const isFreeEvent = event ? Boolean(event.isFree || event.price === 0 || !event.features?.paid) : false
  const isTeamEvent = Boolean(event?.features?.team)
  const hasCustomQuestions = Boolean(event?.formSchema && event.formSchema.length > 0)
  const canUseFastRsvp = isFreeEvent && !isTeamEvent && !hasCustomQuestions && !isImported

  const catAccent = getCategoryAccent(event?.category)

  const getProviderName = () => {
    const prov = (event?.provider || '').toLowerCase()
    const url = (event?.sourceUrl || '').toLowerCase()
    if (prov.includes('eventbrite') || url.includes('eventbrite')) return 'Eventbrite'
    if (prov.includes('meetup') || url.includes('meetup')) return 'Meetup'
    if (prov.includes('luma') || url.includes('lu.ma')) return 'Luma'
    if (event?.provider) return event.provider.charAt(0).toUpperCase() + event.provider.slice(1)
    return 'External Platform'
  }

  const getProviderCta = () => {
    const name = getProviderName()
    return `Register on ${name} ↗`
  }

  if (isLoading) {
    return (
      <PageShell className="py-12">
        <div className="space-y-8 max-w-6xl mx-auto animate-pulse">
          <div className="h-5 bg-surface-subtle rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 lg:col-span-4 aspect-[3/4] bg-surface-subtle rounded-2xl" />
            <div className="md:col-span-7 lg:col-span-8 space-y-4">
              <div className="h-6 bg-surface-subtle rounded w-32" />
              <div className="h-12 bg-surface-subtle rounded w-4/5" />
              <div className="h-24 bg-surface-subtle rounded-xl w-full" />
            </div>
          </div>
        </div>
      </PageShell>
    )
  }

  const isForbiddenOrPrivate = Boolean(
    error &&
      ((error as any)?.status === 403 ||
        (error as any)?.message?.toLowerCase().includes('institution') ||
        (error as any)?.message?.toLowerCase().includes('private') ||
        (error as any)?.message?.toLowerCase().includes('forbidden'))
  )

  if (isForbiddenOrPrivate) {
    return (
      <PageShell className="py-20 text-center">
        <div className="max-w-md mx-auto space-y-5 bg-card border border-line rounded-panel p-8 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto text-3xl">
            🏛️
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider block">
              Campus Institution Access
            </span>
            <h2 className="font-display font-bold text-2xl text-ink">
              Institutional Pass Required
            </h2>
            <p className="text-xs text-ink/80 leading-relaxed">
              This event is exclusively open to enrolled students and faculty of this collegiate institution. Please sign in with your verified campus email to verify affiliation and register.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="primary"
              size="default"
              fullWidth
              onClick={() => navigate(`/login?next=/events/${slug}`)}
            >
              Sign in with Campus Email
            </Button>
            <Button
              variant="secondary"
              size="default"
              fullWidth
              onClick={() => navigate('/explore')}
            >
              Browse Public Events
            </Button>
          </div>
        </div>
      </PageShell>
    )
  }

  if (error || !event) {
    return (
      <PageShell className="py-20 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-subtle border border-line flex items-center justify-center mx-auto text-ink-soft">
            <Icon name="CalendarBlank" size={28} />
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
            {error ? 'Event could not be loaded' : 'Event not found'}
          </h2>
          <p className="text-ink/80 text-sm">
            This event is unavailable or could not be found.
          </p>
          <Link to="/explore">
            <Button variant="secondary" size="compact">Explore events</Button>
          </Link>
        </div>
      </PageShell>
    )
  }

  const shareMeta = buildShareMeta(event)
  const isRegistrationOpen = event.registrationState
    ? event.registrationState === 'open'
    : event.status === 'published' || event.status === 'live'
  const isSoldOut = event.registrationState ? event.registrationState === 'full' : event.seatsLeft === 0
  const registeredCount =
    event.capacity != null && event.seatsLeft != null ? Math.max(0, event.capacity - event.seatsLeft) : null

  // Check if current user is already registered for this event
  const existingReg = myRegistrations.find((r) => r.eventId === event.id && r.status !== 'cancelled')

  const basePrice = event.isFree ? 0 : event.price || 0
  const isUrgentScarcity = event.seatsLeft != null && event.seatsLeft <= 10 && event.seatsLeft > 0
  const percentClaimed =
    event.capacity && event.seatsLeft != null
      ? Math.min(100, Math.round(((event.capacity - event.seatsLeft) / event.capacity) * 100))
      : null

  // Real or configured tiers (only for paid multi-tier internal events)
  const showTierPicker = !isImported && !isFreeEvent && (event.features?.paid || basePrice > 0)
  const tiers: TicketTierOption[] = [
    {
      id: 'tier-standard',
      name: 'General Admission',
      price: basePrice,
      description: 'Standard attendee pass with full session access and materials.',
      perks: ['Full keynote access', 'Networking lounge', 'Digital certificate'],
    },
    {
      id: 'tier-vip',
      name: 'VIP & Early Access',
      price: Math.round(basePrice * 1.35),
      description: 'Priority fast-track check-in desk, front seating, and mentor breakout.',
      perks: ['Front-row seating', 'Mentor breakout lounge', 'Verified Certificate'],
    },
  ]

  const handleDownloadCalendar = () => {
    downloadICS({
      title: event.title,
      description: event.description,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      venueName: event.venue?.name,
      venueAddress: event.venue?.address,
      url: window.location.href,
    })
    toast({
      title: 'Calendar file downloaded',
      message: 'Added event entry to your calendar (.ics).',
      type: 'success',
    })
  }

  const handleCopyWebCalUrl = () => {
    const webcalUrl = getEventIcsUrl(event.slug).replace(/^https?:\/\//i, 'webcal://')
    navigator.clipboard.writeText(webcalUrl)
    toast({
      title: 'WebCal link copied',
      message: 'Paste into Apple Calendar or Outlook to subscribe to live updates.',
      type: 'success',
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        })
        .catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: 'Link copied',
        message: 'Direct link to event copied to clipboard.',
        type: 'info',
      })
    }
  }

  const handleCancelRegistration = async () => {
    if (!existingReg) return
    try {
      await cancelMutation.mutateAsync(existingReg.id)
      setShowCancelConfirm(false)
      toast({
        title: 'Registration cancelled',
        message: 'Your registration pass has been cancelled and seat returned to pool.',
        type: 'info',
      })
    } catch {
      toast({
        title: 'Error cancelling',
        message: 'Failed to cancel registration. Please try again.',
        type: 'error',
      })
    }
  }

  const handleJoinWaitlist = async () => {
    try {
      await waitlistMutation.mutateAsync({ eventId: event.id })
      setWaitlistSuccess(true)
      toast({
        title: 'Joined waitlist',
        message: "You're on the waitlist! We'll alert you if a seat opens up.",
        type: 'success',
      })
    } catch {
      toast({
        title: 'Error joining waitlist',
        message: 'Unable to join waitlist at this time.',
        type: 'error',
      })
    }
  }

  const handleConfirmFastRsvp = async () => {
    if (!event) return
    if (!session) {
      navigate(`/login?next=/events/${event.slug}`)
      return
    }
    try {
      const newReg = await registerMutation.mutateAsync({
        eventId: event.id,
        tierId: selectedTierId,
        answers: {},
      })
      setJustConfirmedReg(newReg)
      fireCelebrationConfetti()
      toast({
        title: 'Pass Issued!',
        message: 'Your free registration is locked. Boarding pass is ready.',
        type: 'success',
      })
    } catch (err: any) {
      toast({
        title: 'RSVP Failed',
        message: err?.message || 'Could not complete registration. Please try again.',
        type: 'error',
      })
    }
  }

  const handleOpenRegistration = () => {
    if (canUseFastRsvp) {
      setIsFastRsvpOpen(true)
    } else {
      navigate(`/events/${event.slug}/register?tier=${selectedTierId}`)
    }
  }

  const speakersList = event.people || []
  const hasSchedule = Boolean(event.schedule && event.schedule.length > 0)
  const hasSpeakers = Boolean(speakersList.length > 0)
  const hasVenueDetails = Boolean(event.venue?.name || event.venue?.address)

  return (
    <>
      <Helmet>
        <title>{shareMeta.title}</title>
        <meta name="description" content={shareMeta.description} />
        <meta property="og:title" content={shareMeta.title} />
        <meta property="og:description" content={shareMeta.description} />
        <meta property="og:url" content={shareMeta.url} />
        <meta property="og:type" content={shareMeta.ogType} />
        {shareMeta.imageUrl && <meta property="og:image" content={shareMeta.imageUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={shareMeta.title} />
        <meta name="twitter:description" content={shareMeta.description} />
      </Helmet>

      {/* Main container with pb-36 for mobile dock clearance */}
      <PageShell className="py-6 sm:py-8 space-y-10 pb-36 sm:pb-16 max-w-6xl mx-auto">
        {/* Navigation Breadcrumb & Quick Action Utilities */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-ink/70 min-w-0">
            <Link to="/explore" className="hover:text-accent font-medium transition-colors">
              Events
            </Link>
            <CaretRight size={13} className="text-ink/40 flex-shrink-0" />
            <span className="text-ink font-semibold line-clamp-1 max-w-[280px] sm:max-w-[420px]" title={event.title}>
              {event.title}
            </span>
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            <BellToggle
              size="sm"
              pressed={isReminded}
              onChange={(next) => {
                setIsReminded(next)
                toast({
                  title: next ? 'Reminder set' : 'Reminder disabled',
                  message: next
                    ? `We will alert you 2 hours before ${event.title} begins.`
                    : 'Event alert removed.',
                  type: 'info',
                })
              }}
              onLabel="Reminded"
              offLabel="Remind me"
            />
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-line text-ink hover:text-accent hover:border-accent font-medium text-xs transition-colors shadow-xs"
            >
              <ShareNetwork size={14} />
              <span>Share</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCalendarModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-line text-ink hover:text-accent hover:border-accent font-medium text-xs transition-colors shadow-xs"
            >
              <CalendarPlus size={14} />
              <span>Calendar</span>
            </button>
          </div>
        </div>

        {/* HERO SECTION: Split Hero (Refactoring UI + Hallmark Dynamic Scale) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: 3:4 Portrait Poster Artwork Card */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="relative aspect-[3/4] w-full max-w-sm mx-auto md:max-w-none rounded-2xl overflow-hidden border border-line bg-surface shadow-md">
              <PosterArt
                eventId={event.id}
                title={event.title}
                category={event.category}
                clubId={event.organizerId || event.club?.id}
                date={formatDate(event.startsAt, 'short')}
                aspectRatio="poster"
                className="w-full h-full object-cover"
              />
              {/* Bottom solid badges on poster */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="px-3 py-1 rounded-md bg-ink text-paper font-mono font-bold text-xs shadow-md">
                  {eventPriceLabel(event)}
                </span>
                {event.features?.team && (
                  <span className="px-2.5 py-1 rounded-md bg-violet-600 text-white font-mono font-bold text-xs shadow-md">
                    Team Pass
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Confident Typographic Scale & Logistics Block */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Chromatic Tags Row (Refactoring UI Category System) */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'rounded-md border px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider shadow-xs',
                    catAccent.badgeClass
                  )}
                >
                  {event.category || 'Event'}
                </span>

                {event.institutionName && (
                  <span className="rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-xs font-bold text-accent shadow-xs flex items-center gap-1">
                    🏛️ {event.institutionName}
                  </span>
                )}

                {isImported && (
                  <span className="rounded-md border border-line bg-card px-2.5 py-1 font-mono text-xs font-bold text-ink shadow-xs">
                    Hosted on {getProviderName()}
                  </span>
                )}

                {event.features?.certificate && (
                  <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-xs flex items-center gap-1">
                    ✓ Verified Certificate
                  </span>
                )}
              </div>

              {/* Bold Display Headline (Bringhurst Dynamic Typographic Scale) */}
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-ink tracking-tight leading-[1.08]">
                {event.title}
              </h1>

              {/* Subtitle / Tagline */}
              {event.subtitle && (
                <p className="text-base sm:text-lg text-ink/80 leading-relaxed font-normal">
                  {event.subtitle}
                </p>
              )}
            </div>

            {/* Logistics Card Block (Chromatic Visual Anchors) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-card border border-line space-y-5 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date & Time */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5">
                    <Icon name="CalendarBlank" size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 block">
                      Date & Schedule
                    </span>
                    <p className="text-base font-bold text-ink mt-0.5">
                      {formatDate(event.startsAt, 'full')}
                    </p>
                    <p className="text-sm font-mono font-semibold text-ink/80 mt-0.5">
                      {formatTime(event.startsAt)} – {formatTime(event.endsAt)}
                    </p>
                  </div>
                </div>

                {/* Venue & Location */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5">
                    <Icon name="MapPin" size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                      Venue Location
                    </span>
                    <p className="text-base font-bold text-ink mt-0.5 line-clamp-1">
                      {event.venue?.name || 'Main Campus Venue'}
                    </p>
                    {event.venue?.address ? (
                      <p className="text-sm text-ink/80 mt-0.5 line-clamp-1">
                        {event.venue.address}
                      </p>
                    ) : (
                      <p className="text-sm text-ink/80 mt-0.5">Campus Grounds</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Host & Organizer Line */}
              <div className="pt-4 border-t border-line/40 flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 text-ink">
                  <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-xs font-bold text-accent">
                    🏛️
                  </div>
                  <span>
                    Organized by{' '}
                    <span className="font-bold text-ink">
                      {event.organizerName || event.club?.name || 'Campus Club'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                  <ShieldCheck size={16} weight="fill" />
                  <span>Verified Campus Host</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TWO-COLUMN GRID: Continuous Story Flow (Left 8 cols) vs Sticky Checkout (Right 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Story Content (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* 1. About This Event */}
            <section className="bg-card border border-line rounded-panel p-6 sm:p-8 space-y-6 shadow-xs">
              <div>
                <span className="text-xs font-mono font-bold tracking-widest text-accent uppercase block mb-1">
                  01 · OVERVIEW
                </span>
                <h2 className="font-display text-2xl font-bold text-ink">About this Event</h2>
              </div>

              <div className="text-ink/90 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4 font-normal">
                {event.description}
              </div>

              {/* Key Highlights Grid (High-Contrast Colored Edge Bars) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-line/40">
                <div className="p-4 rounded-xl bg-surface border border-line border-l-4 border-l-emerald-500 space-y-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    Admission
                  </span>
                  <p className="text-base font-bold text-ink">
                    {eventPriceLabel(event)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-line border-l-4 border-l-accent space-y-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent block">
                    Eligibility
                  </span>
                  <p className="text-base font-bold text-ink">
                    {event.eligibility || 'Open to all enrolled students & faculty'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-line border-l-4 border-l-violet-500 space-y-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 block">
                    Format
                  </span>
                  <p className="text-base font-bold text-ink">
                    {event.features?.team ? 'Team Participation (2–4 members)' : 'Individual Attendee Pass'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-line border-l-4 border-l-amber-500 space-y-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                    Credentials
                  </span>
                  <p className="text-base font-bold text-ink">
                    {event.features?.certificate
                      ? 'Verified digital certificate awarded upon attendance'
                      : 'Digital check-in QR pass'}
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Schedule & Agenda (Rendered only if schedule items exist) */}
            {hasSchedule && (
              <section className="bg-card border border-line rounded-panel p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold tracking-widest text-violet-600 dark:text-violet-400 uppercase block mb-1">
                      02 · AGENDA
                    </span>
                    <h2 className="font-display text-2xl font-bold text-ink">Event Schedule & Timeline</h2>
                  </div>
                  <span className="text-xs sm:text-sm font-mono font-bold px-3 py-1 rounded-md bg-surface border border-line text-ink">
                    {event.schedule?.length} sessions planned
                  </span>
                </div>

                <div className="divide-y divide-line/40">
                  {event.schedule?.map((item, idx) => (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                      <span className="px-2.5 py-1 rounded-md bg-violet-500/15 border border-violet-500/30 text-xs sm:text-sm font-mono font-bold text-violet-700 dark:text-violet-300 flex-shrink-0 mt-0.5">
                        {item.time}
                      </span>
                      <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="font-bold text-base text-ink">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-ink/80 leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3. Speakers & Facilitators (Rendered only if speakers exist) */}
            {hasSpeakers && (
              <section className="bg-card border border-line rounded-panel p-6 sm:p-8 space-y-6 shadow-xs">
                <div>
                  <span className="text-xs font-mono font-bold tracking-widest text-accent uppercase block mb-1">
                    03 · LINEUP
                  </span>
                  <h2 className="font-display text-2xl font-bold text-ink">Speakers & Mentors</h2>
                  <p className="text-sm text-ink/80 mt-1">
                    Industry practitioners and mentors facilitating this session.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {speakersList.map((person, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-surface border border-line flex items-start gap-3.5 hover:border-accent transition-colors"
                    >
                      {person.photo ? (
                        <img
                          src={person.photo}
                          alt={person.name}
                          className="h-12 w-12 flex-shrink-0 rounded-full object-cover border-2 border-line"
                        />
                      ) : (
                        <div className="h-12 w-12 flex-shrink-0 rounded-full bg-card border-2 border-line flex items-center justify-center text-ink-soft">
                          <User size={20} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base text-ink truncate">{person.name}</h3>
                        <span className="text-sm font-semibold text-accent block truncate">{person.role}</span>
                        {person.bio && (
                          <p className="text-sm text-ink/80 mt-1 line-clamp-2 leading-relaxed">{person.bio}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Venue & Arrival Logistics */}
            {hasVenueDetails && (
              <section className="bg-card border border-line rounded-panel p-6 sm:p-8 space-y-4 shadow-xs">
                <div>
                  <span className="text-xs font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase block mb-1">
                    04 · LOCATION
                  </span>
                  <h2 className="font-display text-2xl font-bold text-ink">Venue & Arrival Logistics</h2>
                </div>
                <div className="p-5 rounded-xl bg-surface border border-line space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5">
                      <Icon name="MapPin" size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-ink">
                        {event.venue?.name || 'Main Campus Auditorium'}
                      </h3>
                      {event.venue?.address && (
                        <p className="text-sm text-ink/80 mt-0.5">{event.venue.address}</p>
                      )}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-line/40 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ Campus Verified Facility
                    </span>
                    <span className="text-sm text-ink/80">· Check-in gate opens 30 minutes prior</span>
                  </div>
                </div>

                {/* Organizer Contact Info */}
                {(event.contact?.email || event.contact?.name) && (
                  <div className="pt-3 border-t border-line/30 flex flex-wrap items-center justify-between gap-2 text-sm text-ink/80">
                    {event.contact?.name && (
                      <span className="flex items-center gap-1.5 font-medium text-ink">
                        <User size={14} /> Coordinator: {event.contact.name}
                      </span>
                    )}
                    {event.contact?.email && (
                      <a
                        href={`mailto:${event.contact.email}`}
                        className="text-accent hover:underline font-mono font-semibold"
                      >
                        {event.contact.email}
                      </a>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* 5. House Rules & FAQs (Solid Radix Accordion) */}
            <section className="bg-card border border-line rounded-panel p-6 sm:p-8 space-y-4 shadow-xs">
              <div>
                <span className="text-xs font-mono font-bold tracking-widest text-accent uppercase block mb-1">
                  05 · FAQ & RULES
                </span>
                <h2 className="font-display text-2xl font-bold text-ink">
                  House Rules & Frequently Asked Questions
                </h2>
              </div>

              <Accordion type="single" collapsible className="w-full divide-y divide-line/40">
                <AccordionItem value="faq-checkin" className="border-b border-line/40">
                  <AccordionTrigger className="text-base font-bold text-ink hover:no-underline py-4 text-left">
                    What credentials do I need for door check-in?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-ink/80 leading-relaxed pb-3">
                    Present your digital pass QR code on EventMesh (or in Apple/Google Wallet) on your mobile device, or show your physical student/faculty campus ID card.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-eligibility" className="border-b border-line/40">
                  <AccordionTrigger className="text-base font-bold text-ink hover:no-underline py-4 text-left">
                    Can beginners or students from other departments attend?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-ink/80 leading-relaxed pb-3">
                    Yes! Unless marked strictly institutional or department-locked, all sessions are open to interested learners across all disciplines.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-cert" className="border-b border-line/40">
                  <AccordionTrigger className="text-base font-bold text-ink hover:no-underline py-4 text-left">
                    When and how are attendance certificates distributed?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-ink/80 leading-relaxed pb-3">
                    For events featuring verified certificates, credentials are automatically linked to your EventMesh profile within 24 hours after your gate QR code is scanned.
                  </AccordionContent>
                </AccordionItem>

                {event.rules && event.rules.length > 0 && (
                  <AccordionItem value="faq-rules" className="border-b border-line/40">
                    <AccordionTrigger className="text-base font-bold text-ink hover:no-underline py-4 text-left">
                      Official Organizer Rules & Conduct Policy
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-ink/80 leading-relaxed pb-3">
                      <ul className="space-y-1.5 list-disc pl-4 text-sm text-ink/80">
                        {event.rules.map((rule, idx) => (
                          <li key={idx}>{rule}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </section>
          </div>

          {/* Right Rail: ADAPTIVE CHECKOUT PANEL (Sticky Column) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-card border border-line rounded-panel p-6 space-y-6 shadow-md">
              {/* Header: Pass Type and Pricing */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-accent font-bold">
                    {isImported ? 'Partner Event' : 'Admission Pass'}
                  </span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {eventPriceLabel(event)}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold tracking-tight text-ink">
                  {existingReg
                    ? 'Registration Confirmed'
                    : isSoldOut
                    ? 'Event Full / Waitlist'
                    : isImported
                    ? `Hosted on ${getProviderName()}`
                    : event.registrationState === 'not_required'
                    ? 'No Registration Required'
                    : isRegistrationOpen
                    ? 'Reserve Your Spot'
                    : 'Registration Closed'}
                </h3>
              </div>

              {/* Scarcity Banner (Only if seats <= 10 and not sold out) */}
              {isUrgentScarcity && !isSoldOut && !existingReg && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-sm">
                  <Fire size={22} className="shrink-0 text-amber-600 dark:text-amber-400 animate-pulse" weight="fill" />
                  <div>
                    <p className="font-bold">Only {event.seatsLeft} spots remaining</p>
                    <p className="text-xs sm:text-sm opacity-90">High demand. Reserve before spots run out.</p>
                  </div>
                </div>
              )}

              {/* Available Capacity Meter */}
              {!isImported && event.capacity && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-ink/80">
                    <span className="font-semibold">Capacity Status</span>
                    <span className="font-mono text-ink font-bold">
                      {isSoldOut ? (
                        <span className="text-rose-500 font-bold">Sold Out</span>
                      ) : event.seatsLeft == null ? (
                        'Capacity open'
                      ) : (
                        `${event.seatsLeft} remaining`
                      )}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-surface-subtle overflow-hidden border border-line/40">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSoldOut
                          ? 'bg-rose-500'
                          : (percentClaimed ?? 0) >= 90
                          ? 'bg-rose-500'
                          : (percentClaimed ?? 0) >= 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(((registeredCount ?? 0) / (event.capacity || 1)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TICKET OPTIONS: Rendered only for real multi-tier paid events */}
              {showTierPicker && !existingReg && !isSoldOut && (
                <div className="space-y-2.5 pt-1">
                  <label className="text-xs font-mono uppercase tracking-wider text-accent font-bold block">
                    Select Pass Option
                  </label>
                  <div className="space-y-2">
                    {tiers.map((tier) => {
                      const isSelected = selectedTierId === tier.id
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setSelectedTierId(tier.id)}
                          className={`w-full text-left p-3.5 rounded-xl transition-all border ${
                            isSelected
                              ? 'bg-surface border-accent ring-2 ring-accent/30 text-ink'
                              : 'bg-surface hover:bg-surface-subtle border-line text-ink/80'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-base text-ink">{tier.name}</span>
                            <span className="text-sm font-mono font-black text-ink">
                              {formatCurrency(tier.price)}
                            </span>
                          </div>
                          <p className="text-sm text-ink/80">{tier.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* CTA ACTION AREA */}
              <div className="pt-2">
                {/* 1. If user already registered */}
                {existingReg ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-surface border border-emerald-500/30 text-sm space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle size={18} weight="fill" /> Active Pass Confirmed
                        </span>
                        <span className="font-mono font-black text-ink text-sm">{existingReg.ticketCode}</span>
                      </div>
                      <p className="text-ink/80 text-sm">
                        Your entry pass is registered. Present the QR code upon venue arrival.
                      </p>
                    </div>

                    <Link to="/attendee/dashboard" className="block w-full">
                      <Button variant="primary" size="default" fullWidth>
                        <Ticket size={18} className="mr-1.5" />
                        View Pass in My Tickets
                      </Button>
                    </Link>

                    {showCancelConfirm ? (
                      <div className="p-3.5 rounded-xl bg-surface border border-line space-y-2 text-sm">
                        <p className="font-bold text-ink">Release registration?</p>
                        <p className="text-ink/80 text-xs sm:text-sm">
                          Your reserved seat will be immediately reassigned to waitlisted students.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleCancelRegistration}
                            disabled={cancelMutation.isPending}
                            className="px-3.5 py-1.5 bg-rose-600 text-white rounded-md font-bold text-xs sm:text-sm hover:bg-rose-700 transition-colors"
                          >
                            {cancelMutation.isPending ? 'Releasing...' : 'Yes, release pass'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCancelConfirm(false)}
                            className="px-3.5 py-1.5 bg-surface border border-line text-ink rounded-md font-semibold text-xs sm:text-sm hover:bg-surface-subtle"
                          >
                            Keep pass
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full text-center text-xs sm:text-sm text-ink/60 hover:text-rose-600 font-semibold transition-colors pt-1"
                      >
                        Cancel or release this pass
                      </button>
                    )}
                  </div>
                ) : isSoldOut ? (
                  /* 2. Sold out -> Waitlist */
                  <div className="space-y-3">
                    <p className="text-sm text-ink/80 leading-relaxed">
                      This event has reached full capacity. Join the waitlist to receive priority access if a seat opens up.
                    </p>
                    {waitlistSuccess ? (
                      <div className="p-3.5 rounded-xl bg-surface border border-emerald-500/30 text-sm font-bold text-emerald-600 text-center">
                        Waitlist Spot Reserved! We will notify you if a place becomes available.
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        size="default"
                        fullWidth
                        loading={waitlistMutation.isPending}
                        onClick={handleJoinWaitlist}
                      >
                        Join Waitlist
                      </Button>
                    )}
                  </div>
                ) : isImported ? (
                  /* 3. Honest Imported Event Card (Outbound Redirect) */
                  <div className="space-y-3">
                    <p className="text-sm text-ink/80 leading-relaxed">
                      Official registration for this event is managed directly on {getProviderName()}. Click below to view details and secure your ticket.
                    </p>
                    <a
                      href={eventDestination(event) || event.sourceUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button variant="primary" size="default" fullWidth>
                        {getProviderCta()}
                      </Button>
                    </a>
                  </div>
                ) : isRegistrationOpen ? (
                  /* 4. Native In-App Registration */
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="default"
                      fullWidth
                      onClick={handleOpenRegistration}
                    >
                      {canUseFastRsvp ? 'Get Free Pass' : 'Register Now'}
                    </Button>
                  </div>
                ) : (
                  /* 5. Closed */
                  <Button variant="secondary" size="default" fullWidth disabled>
                    {event.registrationState === 'not_required'
                      ? 'No Registration Required'
                      : 'Registration Closed'}
                  </Button>
                )}
              </div>

              {/* Order Specifics Checklist */}
              <div className="pt-4 border-t border-line/40 space-y-2.5 text-sm text-ink/80">
                <div className="flex items-center justify-between">
                  <span>Pass Type</span>
                  <span className="font-bold text-ink">
                    {event.features?.team ? 'Team Admission' : 'Individual Pass'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery</span>
                  <span className="font-bold text-ink flex items-center gap-1.5">
                    <Check size={15} className="text-emerald-500" weight="bold" /> Instant Digital QR
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Check-in</span>
                  <span className="font-bold text-ink flex items-center gap-1.5">
                    <Check size={15} className="text-emerald-500" weight="bold" /> Door Scanner Entry
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageShell>

      {/* Floating Bottom Action Dock on Mobile (Solid surface, zero blur) */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 z-30 bg-card border-t border-line px-4 py-3 flex items-center justify-between gap-4 shadow-md">
        <div className="min-w-0">
          <span className="text-xs sm:text-sm font-mono text-accent block truncate font-bold">
            {isSoldOut
              ? 'Waitlist Open'
              : event.seatsLeft == null
              ? 'Open Admission'
              : `${event.seatsLeft} spots left`}
          </span>
          <span className="text-base sm:text-lg font-black text-ink truncate block">
            {eventPriceLabel(event)}
          </span>
        </div>

        <div>
          {existingReg ? (
            <Link to="/attendee/dashboard">
              <Button variant="primary" size="compact">
                View Pass
              </Button>
            </Link>
          ) : isSoldOut ? (
            <Button
              variant="secondary"
              size="compact"
              onClick={handleJoinWaitlist}
              loading={waitlistMutation.isPending}
            >
              Join Waitlist
            </Button>
          ) : isImported ? (
            <a
              href={eventDestination(event) || event.sourceUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary" size="compact">
                {getProviderName()} ↗
              </Button>
            </a>
          ) : isRegistrationOpen ? (
            <Button variant="primary" size="compact" onClick={handleOpenRegistration}>
              {canUseFastRsvp ? 'Get Free Pass' : 'Register'}
            </Button>
          ) : (
            <Button variant="secondary" size="compact" disabled>
              Closed
            </Button>
          )}
        </div>
      </div>

      {/* 1-Step Fast RSVP Slide-Over Drawer (100% Solid Card Surface) */}
      <Sheet open={isFastRsvpOpen} onOpenChange={setIsFastRsvpOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto flex flex-col justify-between bg-card border-l border-line">
          <div>
            <SheetHeader className="text-left pb-4 border-b border-line">
              <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider">
                1-Step Fast Pass
              </span>
              <SheetTitle className="text-lg font-bold text-ink">
                {justConfirmedReg ? 'Boarding Pass Ready' : 'Instant Event RSVP'}
              </SheetTitle>
              <SheetDescription className="text-xs text-ink/80">
                {event.title}
              </SheetDescription>
            </SheetHeader>

            <div className="py-6 space-y-5">
              {justConfirmedReg ? (
                <div className="text-center space-y-4">
                  <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                    <CheckCircle size={36} weight="fill" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-ink">You are officially in!</h3>
                    <p className="text-xs text-ink/80 mt-1">
                      Present this scannable QR ticket at the campus door.
                    </p>
                  </div>

                  <div className="flex justify-center py-2">
                    <QRCode value={justConfirmedReg.ticketCode || 'EM-TK-PASS'} size={160} />
                  </div>

                  <div className="p-3 rounded-xl bg-surface border border-line font-mono text-center space-y-1">
                    <span className="text-xs text-ink-muted uppercase tracking-wider block">Pass Token</span>
                    <span className="font-black text-accent text-sm tracking-wider">
                      {justConfirmedReg.ticketCode || 'EM-TK-CONFIRMED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="compact"
                      fullWidth
                      onClick={() => setIsCalendarModalOpen(true)}
                    >
                      <CalendarPlus size={16} className="mr-1.5" />
                      Add to Cal
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="compact"
                      fullWidth
                      onClick={() => {
                        setIsFastRsvpOpen(false)
                        navigate('/attendee/dashboard')
                      }}
                    >
                      <Ticket size={16} className="mr-1.5" />
                      My Passes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Event Snapshot */}
                  <div className="p-3.5 rounded-xl bg-surface border border-line space-y-2 text-xs">
                    <div className="flex items-center justify-between text-ink/80">
                      <span>Schedule:</span>
                      <span className="font-bold text-ink font-mono">{formatDate(event.startsAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-ink/80">
                      <span>Time:</span>
                      <span className="font-bold text-ink font-mono">{formatTime(event.startsAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-ink/80">
                      <span>Venue:</span>
                      <span className="font-bold text-ink truncate max-w-[200px]">
                        {event.venue?.name || 'Campus Venue'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-ink/80 pt-1 border-t border-line/40">
                      <span>Admission:</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">FREE RSVP</span>
                    </div>
                  </div>

                  {/* Identity Check */}
                  {!session ? (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 space-y-3">
                      <p className="font-bold">Sign in required to link this pass</p>
                      <p className="text-xs leading-relaxed">
                        To issue and store your verifiable QR pass, please sign in with your student email.
                      </p>
                      <Button
                        type="button"
                        variant="primary"
                        size="compact"
                        fullWidth
                        onClick={() => navigate(`/login?next=/events/${event.slug}`)}
                      >
                        Sign in with Campus Email
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-surface border border-line space-y-1">
                      <span className="text-xs font-mono text-ink-muted uppercase tracking-wider block">
                        Verified Profile
                      </span>
                      <p className="text-sm font-bold text-ink">{session.name || 'Campus Student'}</p>
                      <p className="text-xs font-mono text-ink/75">{session.email}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {!justConfirmedReg && session && (
            <div className="pt-4 border-t border-line">
              <Button
                type="button"
                variant="primary"
                size="default"
                fullWidth
                loading={registerMutation.isPending}
                disabled={registerMutation.isPending}
                onClick={handleConfirmFastRsvp}
              >
                Confirm 1-Tap Free RSVP
              </Button>
              <p className="text-xs text-ink-muted text-center mt-2">
                Instant digital pass generation · Zero transaction fees
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Live Calendar Subscription Modal (Solid surfaces) */}
      <Modal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        title="Add to Calendar"
        subtitle="Sync this event directly to your phone, desktop, or cloud calendar."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-1">
          <div className="p-3 rounded-xl bg-surface border border-line text-xs space-y-1">
            <p className="font-bold text-ink line-clamp-1">{event.title}</p>
            <p className="text-ink/80">
              {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
            </p>
          </div>

          <div className="space-y-2">
            {/* Google Calendar */}
            <a
              href={getGoogleCalendarUrl({
                title: event.title,
                description: event.description,
                startsAt: event.startsAt,
                endsAt: event.endsAt,
                venueName: event.venue?.name,
                venueAddress: event.venue?.address,
                url: window.location.href,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-surface hover:bg-surface-subtle text-ink transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📅</span>
                <div>
                  <p className="text-sm font-bold">Google Calendar</p>
                  <p className="text-xs text-ink/75">Opens directly in web or app</p>
                </div>
              </div>
              <ArrowSquareOut size={16} className="text-ink-muted group-hover:text-ink transition-colors" />
            </a>

            {/* Apple Calendar / Outlook WebCal Subscription */}
            <a
              href={getEventIcsUrl(event.slug).replace(/^https?:\/\//i, 'webcal://')}
              className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-surface hover:bg-surface-subtle text-ink transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🍏</span>
                <div>
                  <p className="text-sm font-bold">Apple Calendar / Outlook</p>
                  <p className="text-xs text-ink/75">Subscribes via native WebCal protocol</p>
                </div>
              </div>
              <ArrowSquareOut size={16} className="text-ink-muted group-hover:text-ink transition-colors" />
            </a>

            {/* Direct .ics file download */}
            <button
              type="button"
              onClick={() => {
                handleDownloadCalendar()
                setIsCalendarModalOpen(false)
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-line bg-surface hover:bg-surface-subtle text-ink transition-colors group text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📥</span>
                <div>
                  <p className="text-sm font-bold">Download .ICS file</p>
                  <p className="text-xs text-ink/75">Universal calendar file for any client</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-ink-muted group-hover:text-ink">.ics</span>
            </button>
          </div>

          {/* WebCal URL copy */}
          <div className="pt-2 border-t border-line">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-accent block mb-1.5">
              Live WebCal Feed URL
            </label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={getEventIcsUrl(event.slug).replace(/^https?:\/\//i, 'webcal://')}
                className="flex-1 bg-surface-subtle border border-line rounded-input px-3 py-1.5 text-xs font-mono text-ink select-all"
              />
              <button
                type="button"
                onClick={handleCopyWebCalUrl}
                className="px-3 py-1.5 bg-ink text-paper rounded-input text-xs font-bold hover:bg-accent hover:text-white active:scale-95 transition-all shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Copy size={13} />
                <span>Copy</span>
              </button>
            </div>
            <p className="text-xs text-ink/70 mt-1.5">
              Paste this URL into any calendar app to receive real-time schedule adjustments.
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}
