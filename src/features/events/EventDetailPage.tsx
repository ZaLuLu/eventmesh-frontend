import { eventPriceLabel, eventDestination } from '@/lib/eventPresentation'
// Hallmark macrostructure: Cover Stage & Sticky Checkout Dock
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
import { fireCelebrationConfetti } from '@/lib/confetti'
import { formatDate, formatTime, formatCurrency } from '@/lib/format'
import { Modal } from '@/design-system/primitives/Modal'
import { downloadICS, getGoogleCalendarUrl, getEventIcsUrl } from '@/lib/ics'
import { buildShareMeta } from '@/lib/shareMeta'
import { useToast } from '@/design-system/primitives/Toast'
import { Icon } from '@/design-system/Icon'
import { CheckCircle, CalendarPlus, Ticket, Copy, ArrowSquareOut, Fire, Sparkle } from '@phosphor-icons/react'

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

  type DetailTabId = 'overview' | 'schedule' | 'faq'
  const [activeTab, setActiveTab] = useState<DetailTabId>('overview')
  const [isReminded, setIsReminded] = useState(false)
  const [selectedTierId, setSelectedTierId] = useState('tier-standard')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [waitlistSuccess, setWaitlistSuccess] = useState(false)
  const [isFastRsvpOpen, setIsFastRsvpOpen] = useState(false)
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const [justConfirmedReg, setJustConfirmedReg] = useState<any>(null)

  const isImported = event?.kind === 'imported' || Boolean(event?.sourceUrl)
  const isFreeEvent = event ? Boolean(event.isFree || event.price === 0 || !event.features?.paid) : false
  const isTeamEvent = Boolean(event?.features?.team)
  const hasCustomQuestions = Boolean(event?.formSchema && event.formSchema.length > 0)
  const canUseFastRsvp = isFreeEvent && !isTeamEvent && !hasCustomQuestions && !isImported
  const getProviderCta = () => {
    const prov = (event?.provider || '').toLowerCase()
    const url = (event?.sourceUrl || '').toLowerCase()
    if (prov.includes('eventbrite') || url.includes('eventbrite')) return 'Register on Eventbrite ↗'
    if (prov.includes('meetup') || url.includes('meetup')) return 'View on Meetup ↗'
    if (prov.includes('luma') || url.includes('lu.ma')) return 'Register on Luma ↗'
    if (event?.provider) return `Register on ${event.provider} ↗`
    return 'Register on Source ↗'
  }
  if (isLoading) {
    return (
      <PageShell className="py-12">
        <div className="space-y-6 max-w-4xl animate-pulse">
          <div className="h-4 bg-surface-subtle rounded w-48" />
          <div className="h-64 sm:h-72 bg-surface-subtle rounded-2xl w-full" />
          <div className="h-10 bg-surface-subtle rounded w-3/4" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 h-80 bg-surface-subtle rounded-2xl" />
            <div className="lg:col-span-4 h-80 bg-surface-subtle rounded-2xl" />
          </div>
        </div>
      </PageShell>
    )
  }

  const isForbiddenOrPrivate =
    Boolean(error && ((error as any)?.status === 403 ||
      (error as any)?.message?.toLowerCase().includes('institution') ||
      (error as any)?.message?.toLowerCase().includes('private') ||
      (error as any)?.message?.toLowerCase().includes('forbidden')))

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
            <p className="text-xs text-ink-soft leading-relaxed">
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
          <div className="w-16 h-16 rounded-2xl bg-surface-subtle border border-line/40 flex items-center justify-center mx-auto text-ink-soft">
            <Icon name="CalendarBlank" size={28} />
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">{error ? 'Event could not be loaded' : 'Event not found'}</h2>
          <p className="text-ink-soft text-sm">
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
  const isRegistrationOpen = event.registrationState ? event.registrationState === 'open' : event.status === 'published' || event.status === 'live'
  const isSoldOut = event.registrationState ? event.registrationState === 'full' : event.seatsLeft === 0
  const registeredCount = event.capacity != null && event.seatsLeft != null ? Math.max(0, event.capacity - event.seatsLeft) : null

  // Check if current user is already registered for this event
  const existingReg = myRegistrations.find((r) => r.eventId === event.id && r.status !== 'cancelled')

  // Available ticket tiers (F-07) & Scarcity metrics
  const basePrice = event.isFree ? 0 : (event.price || 0)
  const isUrgentScarcity = event.seatsLeft != null && event.seatsLeft <= 10 && event.seatsLeft > 0
  const percentClaimed =
    event.capacity && event.seatsLeft != null
      ? Math.min(100, Math.round(((event.capacity - event.seatsLeft) / event.capacity) * 100))
      : null

  const tiers: TicketTierOption[] = [
    {
      id: 'tier-early',
      name: 'Early Bird Pass',
      price: basePrice > 0 ? Math.round(basePrice * 0.8) : 0,
      description: 'Priority access, exclusive swag pack, and front row seating.',
      perks: ['Front-row seating', 'Welcome kit', 'Keynote early access'],
    },
    {
      id: 'tier-standard',
      name: 'General Admission',
      price: basePrice,
      description: 'Full pass to all keynote talks, hack sprints, and exhibition booths.',
      perks: ['All workshops', 'Networking lounge', 'Interactive Q&A'],
    },
    {
      id: 'tier-vip',
      name: 'VIP & Mentor Access',
      price: basePrice > 0 ? Math.round(basePrice * 1.4) : 0,
      description: 'Fast-track check-in desk, 1-on-1 speaker lounges, and merit certificate.',
      perks: ['Express check-in desk', 'Private mentor breakout', 'Verified Certificate'],
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
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      }).catch(() => {})
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

  const hasScheduleOrLineup = Boolean(
    (event.schedule && event.schedule.length > 0) || (event.people && event.people.length > 0)
  )

  const tabs: { id: DetailTabId; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    ...(hasScheduleOrLineup
      ? [
          {
            id: 'schedule' as const,
            label: 'Schedule & Lineup',
            count: (event.schedule?.length || 0) + (event.people?.length || 0),
          },
        ]
      : []),
    { id: 'faq', label: 'FAQs & Rules' },
  ]

  const speakersList = event.people || []

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

      <PageShell className="py-6 sm:py-8 space-y-8">
        {/* Shortened Breadcrumb & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-ink-soft min-w-0">
            <Link to="/explore" className="hover:text-ink font-normal transition-colors">
              Events
            </Link>
            <Icon name="CaretRight" size={13} className="text-ink-soft/40 flex-shrink-0" />
            <span className="text-ink font-medium line-clamp-1 max-w-[280px] sm:max-w-[420px]" title={event.title}>
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-subtle text-ink-soft hover:text-ink hover:bg-surface-subtle text-xs font-medium transition-colors"
            >
              <Icon name="ShareNetwork" size={14} />
              <span>Share</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCalendarModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-subtle text-ink-soft hover:text-ink hover:bg-surface-subtle text-xs font-medium transition-colors"
            >
              <Icon name="CalendarPlus" size={14} />
              <span>Add to calendar</span>
            </button>
          </div>
        </div>

        {/* PosterArt Cover - Borderless Cinematic Banner */}
        <div className="relative w-full h-64 sm:h-80 md:h-[340px] rounded-3xl overflow-hidden bg-surface-subtle">
          <PosterArt
            eventId={event.id}
            title={event.title}
            category={event.category}
            clubId={event.organizerId || event.club?.id}
            date={formatDate(event.startsAt, 'short')}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Title and Meta Bar */}
        <div className="space-y-4 pt-1">
          <div className="flex flex-wrap items-center gap-2.5">
            {event.institutionName && (
              <Badge variant="neutral" size="sm" className="font-semibold border-accent/40 bg-accent/5 text-ink">
                🏛️ {event.institutionName}
              </Badge>
            )}
            <Badge variant="neutral" size="sm">
              {event.organizerName || event.club?.name || 'Campus Club'}
            </Badge>
            <Badge variant="neutral" size="sm" className="capitalize">
              {event.category}
            </Badge>
            {event.features?.team && (
              <Badge variant="iris" size="sm">
                Team event
              </Badge>
            )}
            <Badge variant={event.isFree ? 'success' : 'iris'} size="sm">
              {eventPriceLabel(event)}
            </Badge>
            {event.features?.certificate && (
              <Badge variant="neutral" size="sm">
                Verified certificate
              </Badge>
            )}
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ink tracking-tight leading-[1.12]">
            {event.title}
          </h1>

          {event.subtitle && (
            <p className="text-base sm:text-lg text-ink-soft max-w-3xl leading-relaxed font-normal">
              {event.subtitle}
            </p>
          )}

          {/* Logistics meta bar */}
          <div className="flex flex-wrap items-center gap-6 pt-3 pb-6 border-b border-line/40 text-sm text-ink-soft">
            <div className="flex items-center gap-2">
              <Icon name="CalendarBlank" size={16} className="text-primary flex-shrink-0" />
              <span className="font-medium text-ink">{formatDate(event.startsAt, 'full')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Clock" size={16} className="text-primary flex-shrink-0" />
              <span className="font-mono text-xs">{formatTime(event.startsAt)} – {formatTime(event.endsAt)}</span>
            </div>
            <div className="flex items-center gap-2 max-w-md" title={event.venue?.address || event.venue?.name}>
              <Icon name="MapPin" size={16} className="text-primary flex-shrink-0" />
              <span className="font-medium text-ink line-clamp-1">
                {event.venue?.name || 'Main Campus Venue'}
                {event.venue?.address ? ` · ${event.venue.address}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: minmax(0, 1fr) 380px (V-06 eliminates empty middle) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Tabs Header */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-line/30 scrollbar-none">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-ink text-surface shadow-xs'
                      : 'bg-transparent text-ink-soft hover:text-ink hover:bg-surface-subtle'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-xs font-mono ${
                      activeTab === tab.id ? 'bg-accent text-white' : 'bg-surface-subtle text-ink-soft'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview (About, Eligibility, Venue, Organizer) */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-card border border-line rounded-panel p-6 sm:p-8 space-y-8">
                  <div>
                    <h3 className="font-display text-lg font-medium text-ink mb-3">About this session</h3>
                    <div className="text-ink-soft text-sm leading-relaxed whitespace-pre-line space-y-4">
                      {event.description}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-line/30">
                    <div className="p-4 rounded-xl bg-card space-y-1">
                      <span className="text-xs font-medium text-ink-soft block uppercase tracking-wider">Eligibility</span>
                      <p className="text-sm font-medium text-ink">{event.eligibility || 'Open to all enrolled students'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-card space-y-1">
                      <span className="text-xs font-medium text-ink-soft block uppercase tracking-wider">Format</span>
                      <p className="text-sm font-medium text-ink">
                        {event.features?.team ? 'Team participation (2–4 members)' : 'Individual attendee pass'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Venue Details (auto-hidden if no venue data) */}
                {(event.venue?.name || event.venue?.address) && (
                  <div className="bg-card border border-line rounded-panel p-6 sm:p-8 space-y-4">
                    <h3 className="font-display text-lg font-medium text-ink">Venue details</h3>
                    <div className="p-5 rounded-xl bg-card space-y-3">
                      <div className="flex items-start gap-3">
                        <Icon name="MapPin" size={18} className="text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-base text-ink">{event.venue?.name || 'Main Campus Auditorium'}</h4>
                          {event.venue?.address && (
                            <p className="text-sm text-ink-soft">{event.venue.address}</p>
                          )}
                        </div>
                      </div>
                      <div className="pt-3 border-t border-line/20 flex flex-wrap items-center gap-3">
                        <Badge variant="success" size="sm">
                          Campus verified venue
                        </Badge>
                        <span className="text-xs text-ink-soft">Gate check-in opens 30m prior</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Organizer Contact (auto-hidden if no contact data) */}
                {(event.organizerName || event.contact?.email || event.contact?.name) && (
                  <div className="bg-card border border-line rounded-panel p-6 sm:p-8 space-y-4">
                    <h3 className="font-display text-lg font-medium text-ink">Organizer contact</h3>
                    <div className="space-y-3 text-sm">
                      <p className="font-medium text-ink text-base">{event.organizerName || 'Campus Club'}</p>
                      {event.contact?.email && (
                        <div className="flex items-center gap-2 text-ink-soft">
                          <Icon name="Envelope" size={16} />
                          <a href={`mailto:${event.contact.email}`} className="text-primary hover:underline font-normal">
                            {event.contact.email}
                          </a>
                        </div>
                      )}
                      {event.contact?.name && (
                        <div className="flex items-center gap-2 text-ink-soft">
                          <Icon name="User" size={16} />
                          <span>Coordinator: {event.contact.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Schedule & Lineup (only rendered if schedule or speakers exist) */}
            {activeTab === 'schedule' && hasScheduleOrLineup && (
              <div className="space-y-6">
                {event.schedule && event.schedule.length > 0 && (
                  <div className="bg-card border border-line rounded-panel p-6 sm:p-8 space-y-4">
                    <h3 className="font-display text-lg font-medium text-ink">Event schedule</h3>
                    <div className="divide-y divide-line/20">
                      {event.schedule.map((item, idx) => (
                        <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                          <span className="px-2.5 py-1 rounded-md bg-surface text-xs font-mono font-medium text-ink flex-shrink-0">
                            {item.time}
                          </span>
                          <div>
                            <h4 className="font-medium text-sm text-ink">{item.title}</h4>
                            {item.description && (
                              <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">{item.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {speakersList.length > 0 && (
                  <div className="bg-card border border-line rounded-panel p-6 sm:p-8 space-y-6">
                    <div>
                      <h3 className="font-display text-lg font-medium text-ink">Speakers & Mentors</h3>
                      <p className="text-xs text-ink-soft mt-0.5">Industry practitioners and faculty leads facilitating this session.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {speakersList.map((person, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-card flex items-start gap-3.5">
                          {person.photo && <img src={person.photo} alt="" className="h-12 w-12 flex-shrink-0 rounded-full object-cover" />}
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-sm text-ink truncate">{person.name}</h4>
                            <span className="text-xs font-normal text-primary block truncate">{person.role}</span>
                            {person.bio && (
                              <p className="text-xs text-ink-soft mt-1 line-clamp-2 leading-relaxed">{person.bio}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: FAQs & Rules */}
            {activeTab === 'faq' && (
              <div className="space-y-6">
                <div className="bg-card border border-line rounded-panel p-6 sm:p-8 space-y-4">
                  <h3 className="font-display text-lg font-medium text-ink">Frequently asked questions</h3>
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-card space-y-1">
                      <h4 className="font-medium text-sm text-ink">What do I need to bring for venue check-in?</h4>
                      <p className="text-xs text-ink-soft leading-relaxed">
                        Bring your smartphone with the digital pass open on EventMesh (QR code intact) or your physical student ID card.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-card space-y-1">
                      <h4 className="font-medium text-sm text-ink">Can beginners register?</h4>
                      <p className="text-xs text-ink-soft leading-relaxed">
                        Yes! All sessions feature introductory tracks and mentor checkpoints suitable for students of all branches and years.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-card space-y-1">
                      <h4 className="font-medium text-sm text-ink">When will attendance certificates be issued?</h4>
                      <p className="text-xs text-ink-soft leading-relaxed">
                        Certificates are minted on EventMesh after gate check-in and session conclusion.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-line rounded-panel p-6 sm:p-8 space-y-4">
                  <h3 className="font-display text-lg font-medium text-ink">Rules & code of conduct</h3>
                  {event.rules && event.rules.length > 0 ? (
                    <ul className="space-y-2.5 text-sm text-ink">
                      {event.rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="h-5 w-5 rounded-full bg-surface text-xs font-mono font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-ink-soft">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="space-y-2.5 text-sm text-ink-soft">
                      <li className="flex items-start gap-2.5">
                        <span className="h-5 w-5 rounded-full bg-surface text-xs font-mono font-medium flex items-center justify-center flex-shrink-0 mt-0.5 text-ink">1</span>
                        <span>All attendees must carry valid campus accreditation or verified student registration.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="h-5 w-5 rounded-full bg-surface text-xs font-mono font-medium flex items-center justify-center flex-shrink-0 mt-0.5 text-ink">2</span>
                        <span>Respect the venue code of conduct, guest speakers, and fellow collegiate participants.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="h-5 w-5 rounded-full bg-surface text-xs font-mono font-medium flex items-center justify-center flex-shrink-0 mt-0.5 text-ink">3</span>
                        <span>Registrations are personal and non-transferable without prior organizer confirmation.</span>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Ticket Panel Column (Option B Borderless Plate) */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-card border border-line rounded-panel p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">Admission Pass</span>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                    {eventPriceLabel(event)}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
                  {event.registrationState === 'not_required' ? 'No registration required' : isRegistrationOpen ? 'Reserve a place' : 'Registration closed'}
                </h3>
              </div>

              {/* Scarcity Urgency Banner */}
              {isUrgentScarcity && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">
                  <Fire size={20} className="shrink-0 text-amber-600 dark:text-amber-400 animate-pulse" weight="fill" />
                  <div>
                    <p className="font-bold">Only {event.seatsLeft} passes left!</p>
                    <p className="text-xs opacity-80">High demand. Reserve before spots are claimed.</p>
                  </div>
                </div>
              )}

              {/* Capacity indicator with Scarcity Percentage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-ink-soft">
                  <span className="flex items-center gap-1.5">
                    <span>Available capacity</span>
                    {percentClaimed != null && percentClaimed >= 75 && !isSoldOut && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-bold font-mono bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        {percentClaimed}% claimed
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-ink font-semibold">
                    {isSoldOut ? (
                      <span className="text-rose-500 font-bold">Sold out</span>
                    ) : event.seatsLeft == null ? (
                      'Availability not provided'
                    ) : (
                      <span className={isUrgentScarcity ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}>
                        {event.seatsLeft} remaining
                      </span>
                    )}
                  </span>
                </div>
                <div hidden={registeredCount == null || !event.capacity} className="h-2 w-full rounded-full bg-surface-subtle overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSoldOut
                        ? 'bg-rose-500'
                        : (percentClaimed ?? 0) >= 90
                        ? 'bg-rose-500'
                        : (percentClaimed ?? 0) >= 75
                        ? 'bg-amber-500'
                        : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(100, Math.round(((registeredCount ?? 0) / (event.capacity || 1)) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Ticket Tier Selector */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium uppercase tracking-wider text-ink-soft block">
                    Select Pass Tier
                  </label>
                  <span className="text-xs font-mono text-ink-muted">3 options available</span>
                </div>
                <div className="space-y-2.5">
                  {tiers.map((tier) => {
                    const isSelected = selectedTierId === tier.id
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setSelectedTierId(tier.id)}
                        className={`w-full text-left p-3.5 rounded-xl transition-all border ${
                          isSelected
                            ? 'bg-surface shadow-xs border-primary text-ink ring-1 ring-primary/40'
                            : 'bg-surface hover:bg-card border-line text-ink-soft'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-ink">{tier.name}</span>
                            {tier.id === 'tier-early' && (
                              <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                🔥 85% CLAIMED
                              </span>
                            )}
                            {tier.id === 'tier-vip' && (
                              <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-600 dark:text-purple-400">
                                ⭐ POPULAR
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono font-bold text-ink">
                            {tier.price === 0 ? 'Free' : formatCurrency(tier.price)}
                          </span>
                        </div>
                        <p className="text-xs text-ink-soft line-clamp-1">{tier.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {tier.perks.map((p) => (
                            <span key={p} className="text-xs font-mono px-1.5 py-0.5 rounded bg-surface-subtle text-ink-muted">
                              ✓ {p}
                            </span>
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Status / CTA Area */}
              <div className="pt-2">
                {existingReg ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-surface text-xs text-ink space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">Pass on record</span>
                        <span className="font-mono font-medium text-ink">{existingReg.ticketCode}</span>
                      </div>
                      <p className="text-ink-soft">You hold an active reservation for this session.</p>
                    </div>

                    <Link to="/attendee/dashboard" className="block w-full">
                      <Button variant="primary" size="default" fullWidth>
                        View pass in My Tickets
                      </Button>
                    </Link>

                    {showCancelConfirm ? (
                      <div className="p-3.5 rounded-xl bg-surface space-y-2 text-xs">
                        <p className="font-medium text-ink">Confirm cancellation?</p>
                        <p className="text-ink-soft">Your seat will be released immediately to waitlisted students.</p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleCancelRegistration}
                            disabled={cancelMutation.isPending}
                            className="px-3 py-1 bg-red-600 text-white rounded-md font-medium text-xs hover:bg-red-700"
                          >
                            {cancelMutation.isPending ? 'Cancelling...' : 'Yes, cancel'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCancelConfirm(false)}
                            className="px-3 py-1 bg-surface-subtle text-ink rounded-md font-medium text-xs"
                          >
                            Keep pass
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full text-center text-xs text-ink-soft hover:text-red-600 font-medium transition-colors pt-1"
                      >
                        Cancel my registration
                      </button>
                    )}
                  </div>
                ) : isSoldOut ? (
                  <div className="space-y-2">
                    <div className="p-3.5 rounded-xl bg-surface text-xs text-ink-soft">
                      This session has reached full capacity. Join the waitlist to receive auto-promotion if a seat opens.
                    </div>
                    {waitlistSuccess ? (
                      <div className="p-3.5 rounded-xl bg-surface text-xs font-medium text-emerald-600 text-center">
                        Waitlist spot confirmed! We will alert you upon promotion.
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
                        Join waitlist
                      </Button>
                    )}
                  </div>
                ) : isImported && event.sourceUrl ? (
                  <div className="space-y-2">
                    <a
                      href={event.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button
                        type="button"
                        variant="primary"
                        size="default"
                        fullWidth
                      >
                        {getProviderCta()}
                      </Button>
                    </a>
                  </div>
                ) : isRegistrationOpen ? (
                  <div className="space-y-2">
                    {event.kind === 'imported' ? (
                      <div className="space-y-2.5">
                        <a
                          href={eventDestination(event) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full"
                        >
                          <Button
                            type="button"
                            variant="primary"
                            size="default"
                            fullWidth
                          >
                            View on {event.provider ? (event.provider.charAt(0).toUpperCase() + event.provider.slice(1)) : 'Platform'} ↗
                          </Button>
                        </a>
                        <p className="text-[11px] text-ink-muted text-center leading-normal">
                          Official ticketing & registration are hosted on {event.provider ? (event.provider.charAt(0).toUpperCase() + event.provider.slice(1)) : 'external platform'}.
                        </p>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="primary"
                        size="default"
                        fullWidth
                        onClick={handleOpenRegistration}
                      >
                        {canUseFastRsvp ? 'Get Free Pass' : 'Register now'}
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button variant="secondary" size="default" fullWidth disabled>
                    {event.registrationState === 'not_required' ? 'No registration required' : 'Registration closed'}
                  </Button>
                )}
              </div>

              {/* Order specifics summary */}
              <div className="pt-4 border-t border-line/20 space-y-2 text-xs text-ink-soft">
                <div className="flex items-center justify-between">
                  <span>Entry format</span>
                  <span className="font-medium text-ink">
                    {event.features?.team ? 'Team collective' : 'Individual pass'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pass format</span>
                  <span className="font-medium text-ink">Digital QR pass</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Gate check-in</span>
                  <span className="font-medium text-ink">Instant scan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageShell>

      {/* Sticky Bottom Bar on Mobile */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 z-30 bg-card border-t border-line px-4 py-3 flex items-center justify-between gap-4 shadow-lg">
        <div className="min-w-0">
          <span className="text-[11px] font-mono text-primary block truncate">
            {isSoldOut ? 'Waitlist open' : event.seatsLeft == null ? 'See event details' : `${event.seatsLeft} seats left`}
          </span>
          <span className="text-sm font-medium text-ink truncate block">
            {eventPriceLabel(event)}
          </span>
        </div>

        {existingReg ? (
          <Link to="/attendee/dashboard">
            <Button variant="primary" size="compact">View pass</Button>
          </Link>
        ) : isSoldOut ? (
          <Button
            variant="secondary"
            size="compact"
            onClick={handleJoinWaitlist}
            loading={waitlistMutation.isPending}
          >
            Join waitlist
          </Button>
        ) : isImported && event.sourceUrl ? (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="primary" size="compact">
              {getProviderCta()}
            </Button>
          </a>
        ) : isRegistrationOpen ? (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="compact"
              onClick={handleOpenRegistration}
            >
              {canUseFastRsvp ? 'Get Free Pass' : 'Register now'}
            </Button>
          </div>
        ) : (
          <Button variant="secondary" size="compact" disabled>{event.registrationState === 'not_required' ? 'No registration needed' : 'Closed'}</Button>
        )}
      </div>

      {/* 1-Step Fast RSVP Slide-Over Drawer */}
      <Sheet open={isFastRsvpOpen} onOpenChange={setIsFastRsvpOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto flex flex-col justify-between">
          <div>
            <SheetHeader className="text-left pb-4 border-b border-line">
              <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider">
                1-Step Fast Pass
              </span>
              <SheetTitle className="text-lg font-bold text-ink">
                {justConfirmedReg ? 'Boarding Pass Confirmed' : 'Instant Event RSVP'}
              </SheetTitle>
              <SheetDescription className="text-xs text-ink-soft">
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
                    <p className="text-xs text-ink-soft mt-1">
                      Present this scannable QR ticket at the campus auditorium door.
                    </p>
                  </div>

                  <div className="flex justify-center py-2">
                    <QRCode value={justConfirmedReg.ticketCode || 'EM-TK-PASS'} size={160} />
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-line font-mono text-center space-y-1">
                    <span className="text-xs text-ink-muted uppercase tracking-wider block">Pass Token</span>
                    <span className="font-bold text-accent text-sm tracking-wider">
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
                  <div className="p-3.5 rounded-xl bg-card border border-line space-y-2 text-xs">
                    <div className="flex items-center justify-between text-ink-soft">
                      <span>Schedule:</span>
                      <span className="font-medium text-ink font-mono">{formatDate(event.startsAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-ink-soft">
                      <span>Time:</span>
                      <span className="font-medium text-ink font-mono">{formatTime(event.startsAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-ink-soft">
                      <span>Venue:</span>
                      <span className="font-medium text-ink truncate max-w-[200px]">{event.venue?.name || 'Campus Venue'}</span>
                    </div>
                    <div className="flex items-center justify-between text-ink-soft pt-1 border-t border-line/40">
                      <span>Admission:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE RSVP</span>
                    </div>
                  </div>

                  {/* Identity Check */}
                  {!session ? (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 space-y-3">
                      <p className="font-semibold">Sign in required to link this boarding pass</p>
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
                        Verified Student Profile
                      </span>
                      <p className="text-sm font-semibold text-ink">{session.name || 'Campus Student'}</p>
                      <p className="text-xs font-mono text-ink-soft">{session.email}</p>
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

      {/* Live Calendar Subscription Modal (RFC 5545 WebCal / ICS) */}
      <Modal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        title="Add to Calendar"
        subtitle="Sync this event directly to your phone, desktop, or cloud calendar."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-1">
          <div className="p-3 rounded-xl bg-surface-subtle/80 border border-line text-xs space-y-1">
            <p className="font-semibold text-ink line-clamp-1">{event.title}</p>
            <p className="text-ink-soft">
              {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
            </p>
          </div>

          <div className="space-y-2">
            {/* 1-Click Google Calendar */}
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
              className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-surface hover:bg-card text-ink transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📅</span>
                <div>
                  <p className="text-sm font-semibold">Google Calendar</p>
                  <p className="text-xs text-ink-soft">Opens directly in web or app</p>
                </div>
              </div>
              <ArrowSquareOut size={16} className="text-ink-muted group-hover:text-ink transition-colors" />
            </a>

            {/* Apple Calendar / Outlook WebCal Subscription */}
            <a
              href={getEventIcsUrl(event.slug).replace(/^https?:\/\//i, 'webcal://')}
              className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-surface hover:bg-card text-ink transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🍏</span>
                <div>
                  <p className="text-sm font-semibold">Apple Calendar / Outlook</p>
                  <p className="text-xs text-ink-soft">Subscribes via native WebCal protocol</p>
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
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-line bg-surface hover:bg-card text-ink transition-colors group text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📥</span>
                <div>
                  <p className="text-sm font-semibold">Download .ICS file</p>
                  <p className="text-xs text-ink-soft">Universal calendar file for any client</p>
                </div>
              </div>
              <span className="text-xs font-mono text-ink-muted group-hover:text-ink">.ics</span>
            </button>
          </div>

          {/* WebCal URL copy */}
          <div className="pt-2 border-t border-line">
            <label className="text-xs font-mono uppercase tracking-wider text-ink-muted block mb-1.5">
              Live WebCal Feed URL
            </label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={getEventIcsUrl(event.slug).replace(/^https?:\/\//i, 'webcal://')}
                className="flex-1 bg-surface-subtle border border-line rounded-input px-3 py-1.5 text-xs font-mono text-ink-soft select-all"
              />
              <button
                type="button"
                onClick={handleCopyWebCalUrl}
                className="px-3 py-1.5 bg-ink text-paper rounded-input text-xs font-medium hover:bg-ink-soft active:scale-95 transition-transform shrink-0 flex items-center gap-1"
              >
                <Copy size={13} />
                <span>Copy</span>
              </button>
            </div>
            <p className="text-xs text-ink-muted mt-1.5">
              Paste this URL into any calendar app to receive real-time schedule adjustments.
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}
