import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { Check, ChevronRight, Calendar, MapPin, Ticket, Download } from 'lucide-react'
import { useEvent } from '@/hooks/useEvents'
import { useAuth } from '@/hooks/useAuth'
import { useRegister, useMyRegistrations } from '@/hooks/useRegistrations'
import { Button } from '@/design-system/primitives/Button'
import { Field } from '@/design-system/primitives/Field'
import { QRCode } from '@/design-system/primitives/QRCode'
import { FormRenderer } from './FormRenderer'
import { formatDate, formatTime } from '@/lib/dates'
import { Registration } from '@/api'
import { Skeleton } from '@/design-system/primitives/Skeleton'

export const RegisterPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const { data: event, isLoading } = useEvent(slug || '')
  const { session } = useAuth()
  const registerMutation = useRegister()
  const { data: myRegistrations = [] } = useMyRegistrations()

  const [createdRegistration, setCreatedRegistration] = useState<Registration | null>(null)

  // Basic attendee details
  const [name, setName] = useState(session?.name || 'Arun Kumar')
  const [email, setEmail] = useState(session?.email || 'arun@example.com')
  const [phone, setPhone] = useState('+91 9876543210')

  // Dynamic answers
  const [formAnswers, setFormAnswers] = useState<Record<string, any>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Team details if enabled
  const [teamName, setTeamName] = useState('')
  const [teamMembers, setTeamMembers] = useState<{ name: string; email: string }[]>([
    { name: '', email: '' },
  ])

  if (isLoading || !event) {
    return (
      <div className="app-container py-12 max-h-[240px] flex flex-col justify-center gap-4">
        <Skeleton height="h-8" width="w-1/2" />
        <Skeleton height="h-32" />
      </div>
    )
  }

  // Duplicate registration check
  const alreadyRegistered = myRegistrations.some((r) => r.eventId === event.id)

  const handleDynamicChange = (id: string, val: any) => {
    setFormAnswers((prev) => ({ ...prev, [id]: val }))
    if (formErrors[id]) {
      setFormErrors((prev) => {
        const copy = { ...prev }
        delete copy[id]
        return copy
      })
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const errors: Record<string, string> = {}
    if (!name.trim()) errors.name = 'Full name is required'
    if (!email.trim()) errors.email = 'Valid email is required'

    if (event.formSchema) {
      for (const field of event.formSchema) {
        if (field.required && !formAnswers[field.id]) {
          errors[field.id] = `${field.label} is required`
        }
      }
    }

    if (event.features?.team && !teamName.trim()) {
      errors.teamName = 'Team name is required'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      const payload = {
        eventId: event.id,
        answers: formAnswers,
        team: event.features?.team
          ? {
              teamName,
              leaderName: name,
              leaderEmail: email,
              members: [
                { name, email, role: 'Lead' },
                ...teamMembers.filter((m) => m.name.trim() && m.email.trim()),
              ],
            }
          : undefined,
      }

      const res = await registerMutation.mutateAsync(payload)
      setCreatedRegistration(res)
      try {
        confetti({
          particleCount: 60,
          spread: 50,
          origin: { y: 0.6 },
        })
      } catch {
        // confetti is progressive enhancement
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Registration failed:', err)
    }
  }

  const clubColor = event.organizerColor || '#C93E27'

  return (
    <div className="w-full bg-bg text-text py-6 sm:py-8">
      <div className="app-container">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-small text-text-2 mb-6">
          <Link to="/" className="hover:text-text transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 text-text-3" />
          <Link to={`/events/${event.slug}`} className="hover:text-text transition-colors">{event.title}</Link>
          <ChevronRight className="h-3.5 w-3.5 text-text-3" />
          <span className="text-text font-medium">Registration</span>
        </div>

        {/* STEP 2: CONFIRMATION STATE */}
        {createdRegistration ? (
          <div className="max-w-xl mx-auto bg-surface border border-line rounded-panel p-6 sm:p-8 text-center space-y-6">
            <div className="h-12 w-12 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
              <Check className="h-6 w-6" />
            </div>

            <div>
              <span className="text-caption font-semibold text-accent block mb-1">
                Registration Confirmed
              </span>
              <h1 className="text-2xl sm:text-3xl font-semibold text-text tracking-tight">
                Digital pass issued
              </h1>
              <p className="text-small text-text-2 mt-1">
                Your pass has been generated. Present the QR code upon admission.
              </p>
            </div>

            {/* Ticket Pass Preview */}
            <div className="bg-subtle border border-line rounded-[10px] p-5 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: clubColor }}
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-small text-text">{event.organizerName}</span>
                </div>
                <span className="font-mono text-caption font-semibold px-2 py-0.5 rounded-full bg-surface border border-line text-text">
                  PASS-{createdRegistration.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-small text-text">{event.title}</h4>
                <p className="text-caption text-text-2 mt-0.5">
                  {formatDate(event.startsAt, 'EEE, MMM d')} · {formatTime(event.startsAt)} · {event.venue?.name}
                </p>
                <p className="text-caption text-text font-medium mt-1">
                  Passholder: {name} ({email})
                </p>
              </div>

              {/* QR Code Container */}
              <div className="flex justify-center pt-2">
                <QRCode value={`PASS-${createdRegistration.id}`} size={160} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link to="/attendee/dashboard" className="w-full sm:flex-1">
                <Button variant="primary" size="default" fullWidth>
                  View in My Tickets
                </Button>
              </Link>
              <Link to="/explore" className="w-full sm:flex-1">
                <Button variant="secondary" size="default" fullWidth>
                  Explore more events
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM: Desktop two-column layout (Form left max 560px, Summary panel right) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form (max 560px) */}
            <div className="lg:col-span-7 max-w-[560px] w-full bg-surface border border-line rounded-panel p-6 sm:p-7">
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-semibold text-text tracking-tight mb-1">
                  Registration: {event.title}
                </h1>
                <p className="text-small text-text-2">
                  Provide your attendee particulars to confirm reservation.
                </p>
              </div>

              {alreadyRegistered && (
                <div className="mb-6 p-4 rounded-[10px] bg-subtle border border-line flex items-center justify-between gap-3 text-small">
                  <div>
                    <p className="font-semibold text-text">Existing pass on record</p>
                    <p className="text-caption text-text-2">You already hold a registration pass for this event.</p>
                  </div>
                  <Link to="/attendee/dashboard">
                    <Button variant="secondary" size="compact">View pass</Button>
                  </Link>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-5">
                <Field
                  id="name"
                  name="name"
                  label="Full name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={formErrors.name}
                />

                <Field
                  id="email"
                  name="email"
                  type="email"
                  label="Email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={formErrors.email}
                />

                <Field
                  id="phone"
                  name="phone"
                  type="tel"
                  label="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                {/* Team Fields if Team Event */}
                {event.features?.team && (
                  <div className="pt-4 border-t border-line space-y-4">
                    <h4 className="font-semibold text-small text-text">Team collective details</h4>
                    <Field
                      id="teamName"
                      name="teamName"
                      label="Team name"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      error={formErrors.teamName}
                    />

                    <div className="space-y-3">
                      <span className="text-caption font-medium text-text-2 block">
                        Additional teammates (optional)
                      </span>
                      {teamMembers.map((m, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field
                            placeholder={`Member ${idx + 2} name`}
                            value={m.name}
                            onChange={(e) => {
                              const copy = [...teamMembers]
                              copy[idx].name = e.target.value
                              setTeamMembers(copy)
                            }}
                          />
                          <Field
                            type="email"
                            placeholder={`Member ${idx + 2} email`}
                            value={m.email}
                            onChange={(e) => {
                              const copy = [...teamMembers]
                              copy[idx].email = e.target.value
                              setTeamMembers(copy)
                            }}
                          />
                        </div>
                      ))}
                      {teamMembers.length < 3 && (
                        <button
                          type="button"
                          onClick={() => setTeamMembers([...teamMembers, { name: '', email: '' }])}
                          className="text-small font-medium text-accent hover:underline"
                        >
                          + Add teammate
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Dynamic Questions if schema present */}
                {event.formSchema && event.formSchema.length > 0 && (
                  <div className="pt-4 border-t border-line space-y-4">
                    <h4 className="font-semibold text-small text-text">Event questionnaire</h4>
                    <FormRenderer
                      fields={event.formSchema}
                      values={formAnswers}
                      onChange={handleDynamicChange}
                      errors={formErrors}
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-line">
                  <Button
                    type="submit"
                    variant="primary"
                    size="default"
                    fullWidth
                    loading={registerMutation.isPending}
                  >
                    Complete Registration
                  </Button>
                </div>
              </form>
            </div>

            {/* Right Column: Event Summary Panel */}
            <div className="lg:col-span-5 w-full bg-surface border border-line rounded-panel p-6 space-y-4">
              <h3 className="font-semibold text-small text-text border-b border-line pb-3">
                Order summary
              </h3>

              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-[8px] overflow-hidden bg-subtle border border-line flex-shrink-0">
                  <img
                    src={event.banner || event.poster || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: clubColor }}
                      aria-hidden="true"
                    />
                    <span className="text-caption text-text-2 truncate font-medium">{event.organizerName}</span>
                  </div>
                  <h4 className="font-semibold text-small text-text line-clamp-2">{event.title}</h4>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-line text-small text-text-2">
                <div className="flex items-center justify-between">
                  <span>Date & time</span>
                  <span className="font-medium text-text">{formatDate(event.startsAt, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Venue</span>
                  <span className="font-medium text-text truncate max-w-[150px]">{event.venue?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Format</span>
                  <span className="font-medium text-text">{event.features?.team ? 'Team' : 'Individual'}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-line text-text">
                  <span className="font-semibold">Admission fee</span>
                  <span className="font-semibold text-success">
                    {event.isFree ? 'Free' : `₹${event.price || 0}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
