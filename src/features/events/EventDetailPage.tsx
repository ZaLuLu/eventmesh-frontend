import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Share2,
  CalendarPlus,
  ChevronRight,
  Mail,
} from 'lucide-react'
import { useEvent } from '@/hooks/useEvents'
import { Button } from '@/design-system/primitives/Button'
import { Tabs } from '@/design-system/primitives/Tabs'
import { formatDate, formatTime } from '@/lib/dates'
import { downloadICS } from '@/lib/ics'
import { useToast } from '@/design-system/primitives/Toast'
import { Skeleton } from '@/design-system/primitives/Skeleton'
import { PosterArtwork } from '@/design-system/PosterArtwork'
import { fireCelebrationConfetti } from '@/lib/confetti'
import { BellToggle } from '@/design-system/micro/BellToggle'
import { ProfileCard } from '@/design-system/3d/ProfileCard'

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const { toast } = useToast()
  const { data: event, isLoading, error } = useEvent(slug || '')
  const [activeTab, setActiveTab] = useState('about')
  const [isReminded, setIsReminded] = useState(false)

  if (isLoading) {
    return (
      <div className="app-container py-12 max-w-4xl max-h-[240px] flex flex-col justify-center gap-4">
        <Skeleton height="h-8" width="w-2/3" />
        <Skeleton height="h-4" width="w-1/2" />
        <Skeleton height="h-32" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="app-container py-12 text-center max-w-md max-h-[240px] flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold text-text mb-2">Event not found</h2>
        <p className="text-small text-text-2 mb-4">
          The requested event could not be found or may have concluded.
        </p>
        <Link to="/explore">
          <Button variant="secondary" size="compact">
            Explore all events
          </Button>
        </Link>
      </div>
    )
  }

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
      message: 'Added event entry to your calendar file (.ics).',
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

  const isRegistrationOpen = event.status === 'published'

  const registeredCount = (event.capacity || 100) - (event.seatsLeft || 0)
  const clubColor = event.organizerColor || '#C93E27'

  const speakerPhotos = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  ]

  const speakersList = event.people && event.people.length > 0
    ? event.people.map((p, idx) => ({
        name: p.name,
        role: p.role,
        bio: p.bio,
        photo: (p as any).photo || speakerPhotos[idx % speakerPhotos.length],
        status: p.role.toLowerCase().includes('keynote') ? 'Keynote Speaker' : 'Expert Mentor',
        statusColor: p.role.toLowerCase().includes('keynote') ? '#EC4899' : '#6366F1',
      }))
    : [
        {
          name: 'Dr. Aris Thorne',
          role: 'Keynote Speaker & AI Research Director',
          bio: 'Former principal investigator leading applied distributed agentic systems.',
          photo: speakerPhotos[0],
          status: 'Keynote Speaker',
          statusColor: '#EC4899',
        },
        {
          name: 'Kavya Patel',
          role: 'Lead Systems Architect & Mentor',
          bio: 'Specialist in low-latency infrastructure and high-throughput event streaming architectures.',
          photo: speakerPhotos[1],
          status: 'Expert Mentor',
          statusColor: '#6366F1',
        },
      ]

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'schedule', label: 'Schedule', count: event.schedule?.length },
    { id: 'speakers', label: 'Speakers', count: speakersList.length },
    { id: 'rules', label: 'Rules' },
    { id: 'contact', label: 'Contact' },
  ]

  return (
    <div className="w-full bg-bg text-text pb-20 sm:pb-12">
      {/* Breadcrumb & Action Row */}
      <div className="border-b border-line bg-surface py-3">
        <div className="app-container flex flex-wrap items-center justify-between gap-3 text-small">
          <div className="flex items-center gap-2 text-text-2">
            <Link to="/" className="hover:text-text transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-text-3" />
            <Link to="/explore" className="hover:text-text transition-colors">Events</Link>
            <ChevronRight className="h-3.5 w-3.5 text-text-3" />
            <span className="text-text font-medium truncate max-w-[200px]">{event.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <BellToggle
              size="sm"
              pressed={isReminded}
              onChange={(next) => {
                setIsReminded(next)
                toast({
                  title: next ? 'Reminder Activated' : 'Reminder Disabled',
                  message: next
                    ? `You'll get an alert 2 hours before ${event.title} begins.`
                    : 'Event reminder has been cleared.',
                  type: 'info',
                })
              }}
              onLabel="Reminder set"
              offLabel="Remind me"
            />
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-subtle text-text hover:bg-line text-caption font-medium transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadCalendar}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-subtle text-text hover:bg-line text-caption font-medium transition-colors"
            >
              <CalendarPlus className="h-3.5 w-3.5 text-accent" />
              <span>Add to calendar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="app-container py-6 sm:py-8 space-y-6">
        {/* Cover image (max 300px tall) with 4px club top edge and radiant aura */}
        <div className="relative w-full max-h-[300px] h-56 sm:h-72 md:h-[300px] rounded-panel overflow-hidden border border-line bg-subtle group">
          <div
            className="absolute top-0 left-0 right-0 h-1.5 z-10 shadow-sm"
            style={{ backgroundColor: clubColor }}
            aria-hidden="true"
          />
          {/* Ambient blurred aura backdrop */}
          <div
            className="absolute -inset-4 blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: clubColor }}
            aria-hidden="true"
          />
          <PosterArtwork
            event={event}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </div>

        {/* Title and Meta Rows */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-caption font-semibold bg-accent-soft text-accent">
              {event.category}
            </span>
            {event.certificateInfo && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-medium bg-subtle text-success">
                <Award className="h-3.5 w-3.5 text-success" />
                Certificate verified
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-caption font-medium bg-subtle text-text-2">
              {event.isFree ? 'Free admission' : `₹${event.price || 0}`}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text tracking-[-0.025em]">
            {event.title}
          </h1>

          {event.subtitle && (
            <p className="text-body text-text-2">
              {event.subtitle}
            </p>
          )}

          {/* Logistics meta row */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-small text-text-2 border-b border-line pb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-accent" />
              <span>{formatDate(event.startsAt, 'EEE, MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-accent" />
              <span>{formatTime(event.startsAt)} – {formatTime(event.endsAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-accent" />
              <span>{event.venue?.name || 'Main Campus Venue'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: clubColor }}
                aria-hidden="true"
              />
              <span className="font-medium text-text">{event.organizerName}</span>
            </div>
          </div>
        </div>

        {/* Two Columns on Desktop (Details left 8 cols, Sticky registration right 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Details Left (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Text Tabs with 2px accent underline */}
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            {/* Tab: About */}
            {activeTab === 'about' && (
              <div className="bg-surface border border-line rounded-panel p-6 space-y-4">
                <h3 className="text-h3 font-semibold text-text">About the event</h3>
                <div className="text-small text-text leading-relaxed whitespace-pre-line space-y-3">
                  {event.description}
                </div>
              </div>
            )}

            {/* Tab: Schedule */}
            {activeTab === 'schedule' && (
              <div className="bg-surface border border-line rounded-panel p-6 space-y-4">
                <h3 className="text-h3 font-semibold text-text">Schedule & timeline</h3>
                {event.schedule && event.schedule.length > 0 ? (
                  <div className="divide-y divide-line">
                    {event.schedule.map((item, idx) => (
                      <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-4">
                        <span className="px-2.5 py-1 rounded-[6px] bg-subtle text-caption font-mono font-semibold text-text flex-shrink-0">
                          {item.time}
                        </span>
                        <div>
                          <h4 className="font-semibold text-small text-text">{item.title}</h4>
                          {item.description && (
                            <p className="text-caption text-text-2 mt-0.5">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-small text-text-2">
                    Schedule details will be announced closer to the event date.
                  </p>
                )}
              </div>
            )}

            {/* Tab: Speakers & Mentors with 3D Profile Cards */}
            {activeTab === 'speakers' && (
              <div className="bg-surface border border-line rounded-panel p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-line pb-3">
                  <div>
                    <h3 className="text-h3 font-semibold text-text">Speakers & Mentors</h3>
                    <p className="text-caption text-text-2 mt-0.5">
                      Distinguished guest speakers and expert mentors guiding this session
                    </p>
                  </div>
                  <span className="hidden sm:inline-block text-caption font-mono text-text-3">
                    Tilt cards for 3D holographic specular sheen
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {speakersList.map((person, idx) => (
                    <div key={idx} className="flex justify-center">
                      <ProfileCard
                        avatarUrl={person.photo}
                        name={person.name}
                        title={person.role}
                        handle={`${person.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.eth`}
                        status={person.status}
                        statusColor={person.statusColor}
                        contactText="Connect with speaker"
                        onContactClick={() => {
                          toast({
                            title: `Connecting with ${person.name}`,
                            message: `Direct channel dispatched to ${person.name}.`,
                            type: 'info',
                          })
                        }}
                        theme="dark"
                        radius={20}
                        tiltStrength={14}
                        className="w-full max-w-[300px]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Rules */}
            {activeTab === 'rules' && (
              <div className="bg-surface border border-line rounded-panel p-6 space-y-4">
                <h3 className="text-h3 font-semibold text-text">Rules & eligibility</h3>
                {event.rules && event.rules.length > 0 ? (
                  <ul className="space-y-2.5 text-small text-text">
                    {event.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="h-5 w-5 rounded-full bg-subtle text-caption font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-small text-text-2">Standard campus code of conduct applies to all attendees.</p>
                )}
              </div>
            )}

            {/* Tab: Contact */}
            {activeTab === 'contact' && (
              <div className="bg-surface border border-line rounded-panel p-6 space-y-4">
                <h3 className="text-h3 font-semibold text-text">Organizer contact</h3>
                <div className="space-y-2 text-small">
                  <p className="font-semibold text-text">{event.organizerName}</p>
                  {event.contact?.email && (
                    <div className="flex items-center gap-2 text-text-2">
                      <Mail className="h-4 w-4 text-text-3" />
                      <a href={`mailto:${event.contact.email}`} className="text-accent hover:underline">
                        {event.contact.email}
                      </a>
                    </div>
                  )}
                  {event.venue?.address && (
                    <div className="flex items-center gap-2 text-text-2">
                      <MapPin className="h-4 w-4 text-text-3" />
                      <span>{event.venue.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Registration Panel Right (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-surface border border-line rounded-panel p-6 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-caption font-semibold text-text-2">Registration</span>
                  <span className="text-caption font-semibold text-success">
                    {event.isFree ? 'Free pass' : `₹${event.price}`}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-text">
                  {isRegistrationOpen ? 'Registration open' : 'Registration closed'}
                </h3>
              </div>

              {/* Seats left indicator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-caption text-text-2">
                  <span>Available capacity</span>
                  <span className="font-semibold text-text">{event.seatsLeft} of {event.capacity} seats left</span>
                </div>
                <div className="h-2 w-full rounded-full bg-subtle overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${Math.min(100, Math.round((registeredCount / (event.capacity || 100)) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Primary Action Button: Link with text 'Register Now' for Playwright Flow A */}
              <div>
                {isRegistrationOpen ? (
                  <Link to={`/events/${event.slug}/register`} className="block w-full">
                    <Button
                      variant="primary"
                      size="default"
                      fullWidth
                    >
                      Register Now
                    </Button>
                  </Link>
                ) : (
                  <Button variant="primary" size="default" fullWidth disabled>
                    Registration Closed
                  </Button>
                )}
              </div>

              {/* Event Summary Details */}
              <div className="pt-4 border-t border-line space-y-2 text-small">
                <div className="flex items-center justify-between text-text-2">
                  <span>Entry type</span>
                  <span className="font-medium text-text">
                    {event.features?.team ? 'Team participation' : 'Individual pass'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-text-2">
                  <span>Ticket delivery</span>
                  <span className="font-medium text-text">Instant digital QR pass</span>
                </div>
                <div className="flex items-center justify-between text-text-2">
                  <span>Venue</span>
                  <span className="font-medium text-text truncate max-w-[150px]">{event.venue?.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar on Mobile with status and Register */}
      <div className="sm:hidden fixed bottom-14 left-0 right-0 z-30 bg-surface border-t border-line px-4 py-3 flex items-center justify-between gap-4 shadow-floating">
        <div>
          <span className="text-caption font-semibold text-accent block">
            {event.seatsLeft} seats remaining
          </span>
          <span className="text-small font-semibold text-text truncate max-w-[160px] block">
            {event.title}
          </span>
        </div>

        <Link to={`/events/${event.slug}/register`}>
          <Button variant="primary" size="compact" disabled={!isRegistrationOpen}>
            Register Now
          </Button>
        </Link>
      </div>
    </div>
  )
}
