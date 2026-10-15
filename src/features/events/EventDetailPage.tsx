// Hallmark macrostructure: Cover Stage & Sticky Checkout Dock
import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useEvent } from '@/hooks/useEvents'
import { useMyRegistrations, useCancelMyRegistration, useJoinWaitlist } from '@/hooks/useRegistrations'
import { PageShell } from '@/design-system/layout/PageShell'
import { PosterArt } from '@/design-system/visuals/PosterArt'
import { Button } from '@/design-system/primitives/Button'
import { Badge } from '@/design-system/primitives/Badge'
import { BellToggle } from '@/design-system/micro/BellToggle'
import { formatDate, formatTime, formatCurrency } from '@/lib/format'
import { downloadICS } from '@/lib/ics'
import { buildShareMeta } from '@/lib/shareMeta'
import { useToast } from '@/design-system/primitives/Toast'
import { Icon } from '@/design-system/Icon'

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
  const { data: myRegistrations = [] } = useMyRegistrations()
  const cancelMutation = useCancelMyRegistration()
  const waitlistMutation = useJoinWaitlist()

  const [activeTab, setActiveTab] = useState<'about' | 'schedule' | 'speakers' | 'venue' | 'faq' | 'rules' | 'contact'>('about')
  const [isReminded, setIsReminded] = useState(false)
  const [selectedTierId, setSelectedTierId] = useState('tier-standard')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [waitlistSuccess, setWaitlistSuccess] = useState(false)

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

  if (error || !event) {
    return (
      <PageShell className="py-20 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-subtle border border-line/40 flex items-center justify-center mx-auto text-ink-soft">
            <Icon name="CalendarBlank" size={28} />
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">Event not found</h2>
          <p className="text-ink-soft text-sm">
            This campus event may have concluded, been archived, or moved to another link.
          </p>
          <Link to="/explore">
            <Button variant="secondary" size="compact">Explore campus happenings</Button>
          </Link>
        </div>
      </PageShell>
    )
  }

  const shareMeta = buildShareMeta(event)
  const isRegistrationOpen = event.status === 'published' || event.status === 'live'
  const isSoldOut = event.seatsLeft <= 0
  const registeredCount = Math.max(0, (event.capacity || 100) - (event.seatsLeft || 0))

  // Check if current user is already registered for this event
  const existingReg = myRegistrations.find((r) => r.eventId === event.id && r.status !== 'cancelled')

  // Available ticket tiers (F-07)
  const basePrice = event.isFree ? 0 : (event.price || 0)
  const tiers: TicketTierOption[] = [{
    id: 'tier-standard',
    name: 'Event pass',
    price: basePrice,
    description: 'Admission to this event.',
    perks: [],
  }]

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

  const tabs = [
    { id: 'about' as const, label: 'About' },
    { id: 'schedule' as const, label: 'Schedule', count: event.schedule?.length },
    { id: 'speakers' as const, label: 'Speakers', count: event.people?.length || 0 },
    { id: 'venue' as const, label: 'Venue' },
    { id: 'faq' as const, label: 'FAQ' },
    { id: 'rules' as const, label: 'Rules' },
    { id: 'contact' as const, label: 'Contact' },
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
              onClick={handleDownloadCalendar}
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
              {event.isFree ? 'Free pass' : formatCurrency(event.price || 0)}
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
                    <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                      activeTab === tab.id ? 'bg-accent text-white' : 'bg-surface-subtle text-ink-soft'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab 1: About */}
            {activeTab === 'about' && (
              <div className="bg-card border border-line rounded-panel p-6 sm:p-8 space-y-8">
                <div>
                  <h3 className="font-display text-lg font-medium text-ink mb-3">About this session</h3>
                  <div className="text-ink-soft text-sm leading-relaxed whitespace-pre-line space-y-4">
                    {event.description}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-line/30">
                  <div className="p-4 rounded-xl bg-card space-y-1">
                    <span className="text-[11px] font-medium text-ink-soft/70 block uppercase tracking-wider">Eligibility</span>
                    <p className="text-sm font-medium text-ink">{event.eligibility || 'Open to all enrolled students'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card space-y-1">
                    <span className="text-[11px] font-medium text-ink-soft/70 block uppercase tracking-wider">Format</span>
                    <p className="text-sm font-medium text-ink">
                      {event.features?.team ? 'Team participation (2–4 members)' : 'Individual attendee pass'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Schedule */}
            {activeTab === 'schedule' && (
              <div className="bg-card border border-line rounded-panel p-6 sm:p-8 space-y-4">
                <h3 className="font-display text-lg font-medium text-ink">Event schedule</h3>
                {event.schedule && event.schedule.length > 0 ? (
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
                ) : (
                  <div className="py-10 text-center text-ink-soft space-y-2">
                    <Icon name="CalendarBlank" size={24} className="mx-auto text-ink-soft/40" />
                    <p className="text-sm">Detailed session timings will be announced 48 hours before commencement.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Speakers & Mentors */}
            {activeTab === 'speakers' && (
              <div className="bg-card border border-line rounded-panel p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="font-display text-lg font-medium text-ink">Speakers & Mentors</h3>
                  <p className="text-xs text-ink-soft mt-0.5">Industry practitioners and faculty leads facilitating this session.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {speakersList.length === 0 && <p className="text-sm text-ink-soft">Speakers have not been announced.</p>}
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

            {/* Tab 4: Venue */}
            {activeTab === 'venue' && (
              <div className="bg-card border border-line rounded-panel p-6 sm:p-8 space-y-4">
                <h3 className="font-display text-lg font-medium text-ink">Venue details</h3>
                <div className="p-5 rounded-xl bg-card space-y-3">
                  <div className="flex items-start gap-3">
                    <Icon name="MapPin" size={18} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-base text-ink">{event.venue?.name || 'Main Campus Auditorium'}</h4>
                      <p className="text-sm text-ink-soft">{event.venue?.address || 'Central Campus Block, Academic Quadrant'}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-line/20 flex flex-wrap items-center gap-3">
                    <Badge variant="success" size="sm">
                      Air conditioned & Wi-Fi enabled
                    </Badge>
                    <span className="text-xs text-ink-soft">Gate check-in opens 30m prior</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: FAQ */}
            {activeTab === 'faq' && (
              <div className="bg-card border border-line rounded-panel p-6 sm:p-8 space-y-4">
                <h3 className="font-display text-lg font-medium text-ink">Frequently asked questions</h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-card space-y-1">
                    <h4 className="font-medium text-sm text-ink">What do I need to bring for venue check-in?</h4>
                    <p className="text-xs text-ink-soft leading-relaxed">
                      Bring your smartphone with the digital pass open on EventMesh (QR code face intact) or your physical student ID card.
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
                      Certificates are automatically minted on EventMesh within 24 hours of gate check-in and session conclusion.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 6: Rules */}
            {activeTab === 'rules' && (
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
            )}

            {/* Tab 7: Contact */}
            {activeTab === 'contact' && (
              <div className="bg-card border border-line rounded-panel p-6 sm:p-8 space-y-4">
                <h3 className="font-display text-lg font-medium text-ink">Organizer contact</h3>
                <div className="space-y-3 text-sm">
                  <p className="font-medium text-ink text-base">{event.organizerName || 'Lead Club Coordinator'}</p>
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

          {/* Sticky Ticket Panel Column (Option B Borderless Plate) */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-card border border-line rounded-panel p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-ink-soft/70">Admission Pass</span>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                    {event.isFree ? 'Free' : formatCurrency(event.price || 0)}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
                  {isRegistrationOpen ? 'Reserve seat' : 'Registration closed'}
                </h3>
              </div>

              {/* Capacity indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-ink-soft">
                  <span>Available capacity</span>
                  <span className="font-mono text-ink">
                    {isSoldOut ? 'Sold out' : `${event.seatsLeft} / ${event.capacity} left`}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isSoldOut ? 'bg-amber-500' : 'bg-primary'}`}
                    style={{ width: `${Math.min(100, Math.round((registeredCount / (event.capacity || 100)) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Ticket Tier Selector */}
              <div className="space-y-2.5 pt-1">
                <label className="text-[11px] font-medium uppercase tracking-wider text-ink-soft/70 block">
                  Select tier
                </label>
                <div className="space-y-2">
                  {tiers.map((tier) => {
                    const isSelected = selectedTierId === tier.id
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setSelectedTierId(tier.id)}
                        className={`w-full text-left p-3.5 rounded-xl transition-all ${
                          isSelected
                            ? 'bg-surface shadow-xs text-ink ring-1 ring-primary/40'
                            : 'bg-surface hover:bg-card text-ink-soft'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-ink">{tier.name}</span>
                          <span className="text-xs font-mono font-medium text-ink">
                            {tier.price === 0 ? 'Free' : formatCurrency(tier.price)}
                          </span>
                        </div>
                        <p className="text-xs text-ink-soft mt-0.5 line-clamp-1">{tier.description}</p>
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
                ) : isRegistrationOpen ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="default"
                    fullWidth
                    onClick={() => navigate(`/events/${event.slug}/register?tier=${selectedTierId}`)}
                  >
                    Register now
                  </Button>
                ) : (
                  <Button variant="secondary" size="default" fullWidth disabled>
                    Registration closed
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
            {isSoldOut ? 'Waitlist open' : `${event.seatsLeft} seats left`}
          </span>
          <span className="text-sm font-medium text-ink truncate block">
            {event.isFree ? 'Free pass' : formatCurrency(event.price || 0)}
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
        ) : isRegistrationOpen ? (
          <Button
            variant="primary"
            size="compact"
            onClick={() => navigate(`/events/${event.slug}/register?tier=${selectedTierId}`)}
          >
            Register now
          </Button>
        ) : (
          <Button variant="secondary" size="compact" disabled>Closed</Button>
        )}
      </div>
    </>
  )
}
