import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useEvent } from '@/hooks/useEvents'
import {
  useMyRegistrations,
  useCancelMyRegistration,
  useJoinWaitlist,
  useRegister,
} from '@/hooks/useRegistrations'
import { useAuth } from '@/hooks/useAuth'
import { PageShell } from '@/design-system/layout/PageShell'
import { PosterArt } from '@/design-system/visuals/PosterArt'
import { Button } from '@/design-system/primitives/Button'
import { BellToggle } from '@/design-system/micro/BellToggle'
import { QRCode } from '@/design-system/primitives/QRCode'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/design-system/ui/sheet'
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
  User,
  ShieldCheck,
  ShareNetwork,
  CaretRight,
  Clock,
  MapPin,
  Check,
  Sparkle,
  ArrowRight,
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
  const [isMobile, setIsMobile] = useState(false)

  // Track responsive viewport for ergonomic mobile bottom sheet vs desktop side drawer
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const isImported = Boolean(event?.kind === 'imported' || event?.sourceUrl)
  const isFreeEvent = event
    ? Boolean(event.isFree || event.price === 0 || !event.features?.paid)
    : false
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
    if (event?.provider)
      return event.provider.charAt(0).toUpperCase() + event.provider.slice(1)
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
          <div className="h-5 bg-slate-200 dark:bg-white/10 rounded-[8px] w-48" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 lg:col-span-4 aspect-[3/4] bg-slate-200 dark:bg-white/10 rounded-[14px]" />
            <div className="md:col-span-7 lg:col-span-8 space-y-4">
              <div className="h-6 bg-slate-200 dark:bg-white/10 rounded-[8px] w-32" />
              <div className="h-12 bg-slate-200 dark:bg-white/10 rounded-[8px] w-4/5" />
              <div className="h-32 bg-slate-200 dark:bg-white/10 rounded-[14px] w-full" />
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
        <div className="max-w-md mx-auto space-y-5 bg-white dark:bg-[#0D0E12] border border-[#E2E8F0] dark:border-white/10 rounded-[14px] p-8 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400 border border-violet-200 dark:border-violet-800/40 flex items-center justify-center mx-auto text-2xl">
            🏛️
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider block">
              Campus Institution Access
            </span>
            <h2 className="font-semibold text-2xl text-slate-900 dark:text-white tracking-tight">
              Institutional Pass Required
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              This event is exclusively open to enrolled students and faculty of this collegiate
              institution. Please sign in with your verified campus email to confirm affiliation.
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
        <div className="max-w-md mx-auto space-y-4 bg-white dark:bg-[#0D0E12] border border-[#E2E8F0] dark:border-white/10 rounded-[14px] p-8 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto text-slate-500">
            <Icon name="CalendarBlank" size={26} />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {error ? 'Event could not be loaded' : 'Event not found'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            This event is unavailable, expired, or could not be found.
          </p>
          <Link to="/explore" className="inline-block pt-2">
            <Button variant="secondary" size="compact">
              Explore events
            </Button>
          </Link>
        </div>
      </PageShell>
    )
  }

  const shareMeta = buildShareMeta(event)
  const isRegistrationOpen = event.registrationState
    ? event.registrationState === 'open'
    : event.status === 'published' || event.status === 'live'
  const isSoldOut = event.registrationState
    ? event.registrationState === 'full'
    : event.seatsLeft === 0
  const registeredCount =
    event.capacity != null && event.seatsLeft != null
      ? Math.max(0, event.capacity - event.seatsLeft)
      : null

  // Check if current user is already registered for this event
  const existingReg = myRegistrations.find(
    (r) => r.eventId === event.id && r.status !== 'cancelled'
  )

  const basePrice = event.isFree ? 0 : event.price || 0
  const isUrgentScarcity =
    event.seatsLeft != null && event.seatsLeft <= 10 && event.seatsLeft > 0
  const percentClaimed =
    event.capacity && event.seatsLeft != null
      ? Math.min(
          100,
          Math.round(((event.capacity - event.seatsLeft) / event.capacity) * 100)
        )
      : null

  // Real or configured tiers (for paid multi-tier events)
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
      title: 'Calendar downloaded',
      message: 'Universal .ics calendar entry saved to downloads.',
      type: 'success',
    })
  }

  const handleCopyWebCalUrl = () => {
    const webcalUrl = getEventIcsUrl(event.slug).replace(/^https?:\/\//i, 'webcal://')
    navigator.clipboard.writeText(webcalUrl)
    toast({
      title: 'WebCal link copied',
      message: 'Paste into Apple Calendar or Outlook for live sync.',
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
        title: 'Registration released',
        message: 'Your registration pass has been cancelled and seat returned to pool.',
        type: 'info',
      })
    } catch {
      toast({
        title: 'Error cancelling',
        message: 'Failed to release pass. Please try again.',
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
        message: "You're in line! We'll alert you instantly if a seat opens.",
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
        message: 'Your admission pass is locked. Verification QR is ready.',
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

  // Subcomponents for the Fast RSVP Sheet content
  const FastRsvpContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        <SheetHeader className="text-left pb-4 border-b border-[#E2E8F0] dark:border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
              Instant Check-in Pass
            </span>
          </div>
          <SheetTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            {justConfirmedReg ? 'Boarding Pass Ready' : '1-Tap Free RSVP'}
          </SheetTitle>
          <SheetDescription className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
            {event.title}
          </SheetDescription>
        </SheetHeader>

        <div className="py-5 space-y-4">
          {justConfirmedReg ? (
            <div className="text-center space-y-4">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle size={32} weight="fill" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                  You are officially registered!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Present this verified QR code at the door for turnstile admission.
                </p>
              </div>

              <div className="flex justify-center py-2">
                <div className="p-3 bg-white rounded-[14px] border border-slate-200 shadow-sm inline-block">
                  <QRCode
                    value={justConfirmedReg.ticketCode || 'EM-TK-PASS'}
                    size={160}
                  />
                </div>
              </div>

              <div className="p-3 rounded-[8px] bg-slate-50 dark:bg-white/5 border border-[#E2E8F0] dark:border-white/10 font-mono text-center space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Pass Security Token
                </span>
                <span className="font-bold text-violet-600 dark:text-violet-400 text-sm tracking-wider">
                  {justConfirmedReg.ticketCode || 'EM-TK-CONFIRMED'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCalendarModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[8px] border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xs font-semibold transition-colors active:scale-[0.98] cursor-pointer"
                >
                  <CalendarPlus size={15} weight="bold" />
                  <span>Add to Cal</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFastRsvpOpen(false)
                    navigate('/attendee/dashboard')
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[8px] bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition-colors active:scale-[0.98] cursor-pointer"
                >
                  <Ticket size={15} weight="bold" />
                  <span>View in Wallet</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Event Snapshot */}
              <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-white/[0.03] border border-[#E2E8F0] dark:border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Schedule:</span>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                    {formatDate(event.startsAt, 'full')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Time:</span>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                    {formatTime(event.startsAt)} – {formatTime(event.endsAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Venue:</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                    {event.venue?.name || 'Campus Venue'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1.5 border-t border-[#E2E8F0] dark:border-white/10">
                  <span>Admission:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    FREE RSVP
                  </span>
                </div>
              </div>

              {/* Verified Identity Check */}
              {!session ? (
                <div className="p-4 rounded-[10px] bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-3">
                  <p className="font-semibold">Sign in required to issue pass</p>
                  <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300/90">
                    To generate your verifiable admission QR code and link it to your wallet, please
                    sign in with your campus account.
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
                <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-white/[0.03] border border-[#E2E8F0] dark:border-white/10 space-y-1">
                  <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider block">
                    Verified Profile
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {session.name || 'Campus Student'}
                  </p>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {session.email}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!justConfirmedReg && session && (
        <div className="pt-4 border-t border-[#E2E8F0] dark:border-white/10">
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
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Instant digital ticket delivery · Zero transaction fees
          </p>
        </div>
      )}
    </div>
  )

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

      {/* Main container with pb-32 for mobile dock clearance */}
      <PageShell className="py-6 sm:py-8 space-y-10 pb-32 sm:pb-16 max-w-6xl mx-auto">
        {/* Navigation Breadcrumb & Quick Action Utilities */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 min-w-0"
          >
            <Link
              to="/explore"
              className="hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors"
            >
              Events
            </Link>
            <CaretRight size={12} className="text-slate-400 shrink-0" />
            <span
              className="text-slate-900 dark:text-white font-semibold truncate max-w-[240px] sm:max-w-[420px]"
              title={event.title}
            >
              {event.title}
            </span>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#0D0E12] border border-[#E2E8F0] dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-300 dark:hover:border-violet-700 font-medium text-xs transition-colors shadow-xs active:scale-[0.98] cursor-pointer"
            >
              <ShareNetwork size={14} />
              <span>Share</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCalendarModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#0D0E12] border border-[#E2E8F0] dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-300 dark:hover:border-violet-700 font-medium text-xs transition-colors shadow-xs active:scale-[0.98] cursor-pointer"
            >
              <CalendarPlus size={14} />
              <span>Calendar</span>
            </button>
          </div>
        </div>

        {/* HERO SECTION: Split Hero Billboard */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: 3:4 Portrait Poster Artwork Card */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="relative aspect-[3/4] w-full max-w-sm mx-auto md:max-w-none rounded-[14px] overflow-hidden border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#0D0E12] shadow-xl">
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
                <span className="px-2.5 py-1 rounded-[6px] bg-[#0D0E12] text-white font-mono font-bold text-xs shadow-md border border-white/15">
                  {eventPriceLabel(event)}
                </span>
                {event.features?.team && (
                  <span className="px-2.5 py-1 rounded-[6px] bg-violet-600 text-white font-mono font-bold text-xs shadow-md border border-white/20">
                    Team Pass
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Confident Typographic Scale & Logistics Block */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Semantic Chips Row */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider',
                    catAccent.badgeClass
                  )}
                >
                  {event.category || 'Event'}
                </span>

                {event.institutionName && (
                  <span className="rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300 px-2.5 py-0.5 font-mono text-[11px] font-semibold flex items-center gap-1">
                    🏛️ {event.institutionName}
                  </span>
                )}

                {isImported && (
                  <span className="rounded-full border border-[#E2E8F0] dark:border-white/10 bg-slate-50 dark:bg-white/5 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Hosted on {getProviderName()}
                  </span>
                )}

                {event.features?.certificate && (
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 font-mono text-[11px] font-semibold flex items-center gap-1">
                    ✓ Verified Certificate
                  </span>
                )}
              </div>

              {/* Bold Display Headline (Bringhurst Optimal Measure) */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-[65ch]">
                {event.title}
              </h1>

              {/* Subtitle / Tagline */}
              {event.subtitle && (
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-[65ch]">
                  {event.subtitle}
                </p>
              )}
            </div>

            {/* Logistics Card Block */}
            <div className="p-5 sm:p-6 rounded-[14px] bg-white dark:bg-[#0D0E12] border border-[#E2E8F0] dark:border-white/10 space-y-5 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date & Time */}
                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-[8px] bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400 border border-violet-200 dark:border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={18} weight="bold" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400 block">
                      Date & Schedule
                    </span>
                    <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                      {formatDate(event.startsAt, 'full')}
                    </p>
                    <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                      {formatTime(event.startsAt)} – {formatTime(event.endsAt)}
                    </p>
                  </div>
                </div>

                {/* Venue & Location */}
                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-[8px] bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={18} weight="bold" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                      Venue Location
                    </span>
                    <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                      {event.venue?.name || 'Main Campus Venue'}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {event.venue?.address || 'Campus Grounds & Lecture Halls'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Host & Organizer Line */}
              <div className="pt-4 border-t border-[#E2E8F0] dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <div className="h-7 w-7 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40 flex items-center justify-center text-xs font-bold">
                    🏛️
                  </div>
                  <span>
                    Organized by{' '}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {event.organizerName || event.club?.name || 'Campus Club'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono font-medium text-xs">
                  <ShieldCheck size={16} weight="fill" />
                  <span>Verified Campus Host</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TWO-COLUMN GRID: Story Content (Left 8 cols) vs Sticky Checkout (Right 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Story Content (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. About This Event */}
            <section className="bg-white dark:bg-[#0D0E12] border border-[#E2E8F0] dark:border-white/10 rounded-[14px] p-6 sm:p-8 space-y-6 shadow-sm">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-violet-600 dark:text-violet-400 uppercase block mb-1">
                  01 · OVERVIEW
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  About this Event
                </h2>
              </div>

              <div className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4 max-w-[65ch]">
                {event.description}
              </div>

              {/* Key Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#E2E8F0] dark:border-white/10">
                <div className="p-3.5 rounded-[8px] bg-slate-50 dark:bg-white/[0.02] border border-[#E2E8F0] dark:border-white/10 space-y-0.5">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    Admission
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                    {eventPriceLabel(event)}
                  </p>
                </div>
                <div className="p-3.5 rounded-[8px] bg-slate-50 dark:bg-white/[0.02] border border-[#E2E8F0] dark:border-white/10 space-y-0.5">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400 block">
                    Eligibility
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                    {event.eligibility || 'Open to all enrolled students & faculty'}
                  </p>
                </div>
                <div className="p-3.5 rounded-[8px] bg-slate-50 dark:bg-white/[0.02] border border-[#E2E8F0] dark:border-white/10 space-y-0.5">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                    Format
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                    {event.features?.team
                      ? 'Team Participation (2–4 members)'
                      : 'Individual Attendee Pass'}
                  </p>
                </div>
                <div className="p-3.5 rounded-[8px] bg-slate-50 dark:bg-white/[0.02] border border-[#E2E8F0] dark:border-white/10 space-y-0.5">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                    Credentials
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                    {event.features?.certificate
                      ? 'Verified digital certificate awarded upon attendance'
                      : 'Digital check-in QR pass'}
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Schedule & Agenda */}
            {hasSchedule && (
              <section className="bg-white dark:bg-[#0D0E12] border border-[#E2E8F0] dark:border-white/10 rounded-[14px] p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-violet-600 dark:text-violet-400 uppercase block mb-1">
                      02 · AGENDA
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Event Schedule & Timeline
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-[6px] bg-slate-100 dark:bg-white/5 border border-[#E2E8F0] dark:border-white/10 text-slate-700 dark:text-slate-300">
                    {event.schedule?.length} sessions
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {event.schedule?.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5"
                    >
                      <span className="px-2.5 py-1 rounded-[6px] bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40 text-xs font-mono font-semibold shrink-0 mt-0.5 tabular-nums">
                        {item.time}
                      </span>
                      <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3. Speakers & Facilitators */}
            {hasSpeakers && (
              <section className="bg-white dark:bg-[#0D0E12] border border-[#E2E8F0] dark:border-white/10 rounded-[14px] p-6 sm:p-8 space-y-6 shadow-sm">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-violet-600 dark:text-violet-400 uppercase block mb-1">
                    03 · LINEUP
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Speakers & Mentors
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Industry practitioners and mentors facilitating this session.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {speakersList.map((person, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-[10px] bg-slate-50 dark:bg-white/[0.02] border border-[#E2E8F0] dark:border-white/10 flex items-start gap-3.5 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                    >
                      {person.photo ? (
                        <img
                          src={person.photo}
                          alt={person.name}
                          className="h-11 w-11 shrink-0 rounded-full object-cover border border-[#E2E8F0] dark:border-white/10"
                        />
                      ) : (
                        <div className="h-11 w-11 shrink-0 rounded-full bg-slate-200 dark:bg-white/10 border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400">
                          <User size={18} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                          {person.name}
                        </h3>
                        <span className="text-xs font-medium text-violet-600 dark:text-violet-400 block truncate">
                          {person.role}
                        </span>
                        {person.bio && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                            {person.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Venue & Arrival Logistics */}
            {hasVenueDetails && (
              <section className="bg-white dark:bg-[#0D0E12] border border-[#E2E8F0] dark:border-white/10 rounded-[14px] p-6 sm:p-8 space-y-4 shadow-sm">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase block mb-1">
                    04 · LOCATION
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Venue & Arrival Logistics
                  </h2>
                </div>
                <div className="p-4 sm:p-5 rounded-[10px] bg-slate-50 dark:bg-white/[0.02] border border-[#E2E8F0] dark:border-white/10 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-[8px] bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={16} weight="bold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white">
                        {event.venue?.name || 'Main Campus Auditorium'}
                      </h3>
                      {event.venue?.address && (
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                          {event.venue.address}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="pt-2.5 border-t border-[#E2E8F0] dark:border-white/10 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Campus Verified Facility
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      · Check-in desk opens 30 minutes prior
                    </span>
                  </div>
                </div>

                {/* Organizer Contact Info */}
                {(event.contact?.email || event.contact?.name) && (
                  <div className="pt-2 border-t border-[#E2E8F0] dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
                    {event.contact?.name && (
                      <span className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
                        <User size={13} /> Coordinator: {event.contact.name}
                      </span>
                    )}
                    {event.contact?.email && (
                      <a
                        href={`mailto:${event.contact.email}`}
                        className="text-violet-600 dark:text-violet-400 hover:underline font-mono font-semibold"
                      >
                        {event.contact.email}
                      </a>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* 5. House Rules & FAQs */}
            <section className="bg-white dark:bg-[#0D0E12] border border-[#E2E8F0] dark:border-white/10 rounded-[14px] p-6 sm:p-8 space-y-4 shadow-sm">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-violet-600 dark:text-violet-400 uppercase block mb-1">
                  05 · FAQ & RULES
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  House Rules & Frequently Asked Questions
                </h2>
              </div>

              <Accordion type="single" collapsible className="w-full divide-y divide-[#E2E8F0] dark:divide-white/10">
                <AccordionItem value="faq-checkin" className="border-b border-[#E2E8F0] dark:border-white/10">
                  <AccordionTrigger className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white hover:no-underline py-3.5 text-left">
                    What credentials do I need for door check-in?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pb-3">
                    Present your digital pass QR code on EventMesh (or in Apple/Google Wallet) on your
                    mobile device, or show your physical student/faculty campus ID card.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-eligibility" className="border-b border-[#E2E8F0] dark:border-white/10">
                  <AccordionTrigger className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white hover:no-underline py-3.5 text-left">
                    Can beginners or students from other departments attend?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pb-3">
                    Yes! Unless marked strictly institutional or department-locked, all sessions are
                    open to interested learners across all disciplines.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-cert" className="border-b border-[#E2E8F0] dark:border-white/10">
                  <AccordionTrigger className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white hover:no-underline py-3.5 text-left">
                    When and how are attendance certificates distributed?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pb-3">
                    For events featuring verified certificates, credentials are automatically linked
                    to your EventMesh profile within 24 hours after your gate QR code is scanned.
                  </AccordionContent>
                </AccordionItem>

                {event.rules && event.rules.length > 0 && (
                  <AccordionItem value="faq-rules" className="border-b border-[#E2E8F0] dark:border-white/10">
                    <AccordionTrigger className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white hover:no-underline py-3.5 text-left">
                      Official Organizer Rules & Conduct Policy
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pb-3">
                      <ul className="space-y-1.5 list-disc pl-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
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
            <div className="sticky top-24 bg-white dark:bg-[#0D0E12] border border-[#E2E8F0] dark:border-white/10 rounded-[14px] p-6 space-y-5 shadow-xl">
              {/* Header: Pass Type and Pricing */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold">
                    {isImported ? 'Partner Event' : 'Admission Pass'}
                  </span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                    {eventPriceLabel(event)}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
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
                <div className="flex items-center gap-2.5 p-3 rounded-[8px] bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs">
                  <Fire
                    size={20}
                    className="shrink-0 text-amber-600 dark:text-amber-400 animate-pulse"
                    weight="fill"
                  />
                  <div>
                    <p className="font-bold">Only {event.seatsLeft} spots remaining</p>
                    <p className="text-[11px] opacity-90">
                      High demand. Reserve before capacity is reached.
                    </p>
                  </div>
                </div>
              )}

              {/* Available Capacity Meter */}
              {!isImported && event.capacity && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Capacity Status</span>
                    <span className="font-mono text-slate-900 dark:text-white font-semibold tabular-nums">
                      {isSoldOut ? (
                        <span className="text-rose-500 font-bold">Sold Out</span>
                      ) : event.seatsLeft == null ? (
                        'Capacity open'
                      ) : (
                        `${event.seatsLeft} remaining`
                      )}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden border border-[#E2E8F0] dark:border-white/10">
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
                          Math.round(
                            ((registeredCount ?? 0) / (event.capacity || 1)) * 100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TICKET OPTIONS: Rendered only for real multi-tier paid events */}
              {showTierPicker && !existingReg && !isSoldOut && (
                <div className="space-y-2 pt-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold block">
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
                          className={`w-full text-left p-3 rounded-[8px] transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-violet-50/50 dark:bg-violet-950/20 border-violet-500 ring-1 ring-violet-500/40 text-slate-900 dark:text-white'
                              : 'bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/5 border-[#E2E8F0] dark:border-white/10 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-semibold text-sm text-slate-900 dark:text-white">
                              {tier.name}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                              {formatCurrency(tier.price)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                            {tier.description}
                          </p>
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
                    <div className="p-3.5 rounded-[8px] bg-emerald-500/10 border border-emerald-500/25 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle size={16} weight="fill" /> Active Pass Confirmed
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {existingReg.ticketCode}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        Your entry pass is registered. Present the QR code upon venue arrival.
                      </p>
                    </div>

                    <Link to="/attendee/dashboard" className="block w-full">
                      <Button variant="primary" size="default" fullWidth>
                        <Ticket size={16} className="mr-1.5" />
                        View Pass in My Tickets
                      </Button>
                    </Link>

                    {showCancelConfirm ? (
                      <div className="p-3.5 rounded-[8px] bg-slate-50 dark:bg-white/5 border border-[#E2E8F0] dark:border-white/10 space-y-2 text-xs">
                        <p className="font-bold text-slate-900 dark:text-white">
                          Release registration?
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          Your reserved seat will be immediately reassigned to waitlisted
                          students.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleCancelRegistration}
                            disabled={cancelMutation.isPending}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-[6px] font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {cancelMutation.isPending ? 'Releasing...' : 'Yes, release pass'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCancelConfirm(false)}
                            className="px-3 py-1.5 bg-white dark:bg-white/10 border border-[#E2E8F0] dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-[6px] font-semibold text-xs hover:bg-slate-50 dark:hover:bg-white/15 cursor-pointer"
                          >
                            Keep pass
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full text-center text-xs text-slate-400 hover:text-rose-600 font-medium transition-colors pt-1 cursor-pointer"
                      >
                        Cancel or release this pass
                      </button>
                    )}
                  </div>
                ) : isSoldOut ? (
                  /* 2. Sold out -> Waitlist */
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      This event has reached full capacity. Join the waitlist to receive priority
                      access if a seat opens up.
                    </p>
                    {waitlistSuccess ? (
                      <div className="p-3.5 rounded-[8px] bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-700 dark:text-emerald-300 text-center">
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
                  /* 3. Honest Imported Event Card */
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Official registration for this event is managed directly on{' '}
                      {getProviderName()}. Click below to view details and secure your ticket.
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
                      {canUseFastRsvp ? '1-Tap Fast Pass' : 'Continue to Register →'}
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
              <div className="pt-3.5 border-t border-[#E2E8F0] dark:border-white/10 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Pass Type</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {event.features?.team ? 'Team Admission' : 'Individual Pass'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery</span>
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-500" weight="bold" /> Instant
                    Digital QR
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Check-in</span>
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-500" weight="bold" /> Door Scanner
                    Entry
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageShell>

      {/* Floating Bottom Action Dock on Mobile (Solid Deep Obsidian surface, zero blur) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0D0E12] border-t border-white/15 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] flex items-center justify-between gap-4 text-white shadow-2xl">
        <div className="min-w-0">
          <span className="text-[11px] font-mono text-violet-400 block truncate font-semibold">
            {isSoldOut
              ? 'Waitlist Open'
              : event.seatsLeft == null
              ? 'Open Admission'
              : `${event.seatsLeft} spots left`}
          </span>
          <span className="text-base font-bold text-white truncate block tabular-nums">
            {eventPriceLabel(event)}
          </span>
        </div>

        <div className="shrink-0">
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
            <Button
              variant="primary"
              size="compact"
              onClick={handleOpenRegistration}
              className="h-10 px-4 text-xs font-semibold"
            >
              {canUseFastRsvp ? '1-Tap Pass' : 'Register'}
            </Button>
          ) : (
            <Button variant="secondary" size="compact" disabled>
              Closed
            </Button>
          )}
        </div>
      </div>

      {/* Responsive Fast RSVP Drawer (Mobile Bottom Sheet vs Desktop Right Panel) */}
      <Sheet open={isFastRsvpOpen} onOpenChange={setIsFastRsvpOpen}>
        <SheetContent
          side={isMobile ? 'bottom' : 'right'}
          className={cn(
            '!p-5 sm:!p-6 bg-white dark:bg-[#0D0E12] border-[#E2E8F0] dark:border-white/10 shadow-2xl z-50 overflow-y-auto',
            isMobile
              ? 'rounded-t-[20px] max-h-[90vh] border-t border-x-0 pb-[max(20px,env(safe-area-inset-bottom))]'
              : 'w-full sm:max-w-md border-l border-y-0 h-full'
          )}
        >
          {/* Subtle Mobile Drag Indicator Pill */}
          {isMobile && (
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-auto -mt-1 mb-4 shrink-0" />
          )}
          {FastRsvpContent}
        </SheetContent>
      </Sheet>

      {/* Live Calendar Subscription Modal */}
      <Modal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        title="Add to Calendar"
        subtitle="Sync this event directly to your phone, desktop, or cloud calendar."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-1">
          <div className="p-3 rounded-[8px] bg-slate-50 dark:bg-white/[0.03] border border-[#E2E8F0] dark:border-white/10 text-xs space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">
              {event.title}
            </p>
            <p className="text-slate-600 dark:text-slate-400 tabular-nums">
              {formatDate(event.startsAt, 'full')} · {formatTime(event.startsAt)}
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
              className="flex items-center justify-between p-3.5 rounded-[8px] border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white transition-colors group active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📅</span>
                <div>
                  <p className="text-xs sm:text-sm font-semibold">Google Calendar</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Opens directly in web or app
                  </p>
                </div>
              </div>
              <ArrowSquareOut
                size={16}
                className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors"
              />
            </a>

            {/* Apple Calendar / Outlook WebCal Subscription */}
            <a
              href={getEventIcsUrl(event.slug).replace(/^https?:\/\//i, 'webcal://')}
              className="flex items-center justify-between p-3.5 rounded-[8px] border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white transition-colors group active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🍏</span>
                <div>
                  <p className="text-xs sm:text-sm font-semibold">Apple Calendar / Outlook</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Subscribes via native WebCal protocol
                  </p>
                </div>
              </div>
              <ArrowSquareOut
                size={16}
                className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors"
              />
            </a>

            {/* Direct .ics file download */}
            <button
              type="button"
              onClick={() => {
                handleDownloadCalendar()
                setIsCalendarModalOpen(false)
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-[8px] border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white transition-colors group text-left active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📥</span>
                <div>
                  <p className="text-xs sm:text-sm font-semibold">Download .ICS file</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Universal calendar file for any client
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">
                .ics
              </span>
            </button>
          </div>

          {/* WebCal URL copy */}
          <div className="pt-2 border-t border-[#E2E8F0] dark:border-white/10">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 block mb-1.5">
              Live WebCal Feed URL
            </label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={getEventIcsUrl(event.slug).replace(/^https?:\/\//i, 'webcal://')}
                className="flex-1 bg-slate-50 dark:bg-white/5 border border-[#E2E8F0] dark:border-white/10 rounded-[8px] px-3 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-200 select-all"
              />
              <button
                type="button"
                onClick={handleCopyWebCalUrl}
                className="px-3 py-1.5 bg-[#0D0E12] text-white hover:bg-violet-600 rounded-[8px] text-xs font-semibold active:scale-[0.98] transition-all shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Copy size={13} />
                <span>Copy</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
              Paste this URL into any calendar app to receive real-time schedule adjustments.
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}
