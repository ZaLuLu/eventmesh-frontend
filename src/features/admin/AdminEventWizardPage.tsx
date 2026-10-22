import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Trash, FloppyDisk, CurrencyInr, ShieldCheck, Sparkle, Info } from '@phosphor-icons/react'
import { useAuth } from '@/hooks/useAuth'
import { useClubs } from '@/hooks/useClubs'
import { useEvent, useCreateEvent, useUpdateEvent, usePublishEvent } from '@/hooks/useEvents'
import { useFeeQuote } from '@/hooks/usePayments'
import { Button } from '@/design-system/primitives/Button'
import { Field } from '@/design-system/primitives/Field'
import { Select } from '@/design-system/primitives/Select'
import { Stepper } from '@/design-system/primitives/Stepper'
import { AdminFormBuilder } from './AdminFormBuilder'
import { FormField, ScheduleItem, EventPerson } from '@/api'
import { useToast } from '@/design-system/primitives/Toast'

export const AdminEventWizardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { session } = useAuth()
  const { toast } = useToast()
  const { data: clubs = [] } = useClubs()
  const { data: existingEvent } = useEvent(id || '')

  const createMutation = useCreateEvent()
  const updateMutation = useUpdateEvent()
  const publishMutation = usePublishEvent()

  const [step, setStep] = useState(0)
  const steps = [
    { id: 'details', label: '1. Details' },
    { id: 'media', label: '2. Media' },
    { id: 'pricing', label: '3. Tickets & Pricing' },
    { id: 'schedule', label: '4. Schedule & People' },
    { id: 'form', label: '5. Form Builder' },
    { id: 'settings', label: '6. Quotas & Settings' },
    { id: 'review', label: '7. Review & Publish' },
  ]

  // Form State
  const [organizerId, setOrganizerId] = useState(session?.clubId || clubs[0]?.id || 'club-devcraft')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [category, setCategory] = useState('hackathon')
  const [type, setType] = useState('hackathon')
  const [description, setDescription] = useState('Automated event description for community builders.')
  const [venueName, setVenueName] = useState('Campus Main Auditorium')
  const [venueAddress, setVenueAddress] = useState('Engineering Block')
  const [startsAt, setStartsAt] = useState('2026-11-20T10:00')
  const [endsAt, setEndsAt] = useState('2026-11-20T16:00')

  // Media
  const [poster, setPoster] = useState(
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
  )
  const [banner, setBanner] = useState('')

  // Schedule & People
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { time: '10:00 AM', title: 'Opening & Technical Keynote' },
  ])
  const [people, setPeople] = useState<EventPerson[]>([
    { name: 'Dr. Vikramaditya Sen', role: 'speaker', bio: 'Staff Systems Architect' },
  ])

  // Form Builder
  const [formSchema, setFormSchema] = useState<FormField[]>([
    { id: 'f-github', type: 'text', label: 'GitHub Profile or Repository URL', required: true },
  ])

  // Settings
  const [capacity, setCapacity] = useState<number | null>(100)
  const [eligibility, setEligibility] = useState('Open to all registered members')
  const [waitlistEnabled, setWaitlistEnabled] = useState(true)
  const [isTeamEnabled, setIsTeamEnabled] = useState(false)
  const [minTeamSize, setMinTeamSize] = useState(2)
  const [maxTeamSize, setMaxTeamSize] = useState(4)
  const [isCertificateEnabled, setIsCertificateEnabled] = useState(true)
  const [isCheckinEnabled, setIsCheckinEnabled] = useState(true)
  const [contactName, setContactName] = useState(session?.name || 'Priya Ramanathan')
  const [contactEmail, setContactEmail] = useState(session?.email || 'lead@devcraft.org')

  // Admission & Pricing State
  const [isPaid, setIsPaid] = useState(false)
  const [ticketPriceInr, setTicketPriceInr] = useState<number>(499)
  const { data: feeQuote, isLoading: isQuoteLoading } = useFeeQuote(
    Math.round(ticketPriceInr * 100),
    { enabled: isPaid && ticketPriceInr > 0 }
  )

  // Update organizerId when session becomes available
  useEffect(() => {
    if (session?.clubId && !isEditing) {
      setOrganizerId(session.clubId)
    }
  }, [session, isEditing])

  // Populate if editing
  useEffect(() => {
    if (existingEvent) {
      setOrganizerId(existingEvent.organizerId)
      setTitle(existingEvent.title)
      setSubtitle(existingEvent.subtitle || '')
      setCategory(existingEvent.category)
      setType(existingEvent.type)
      setDescription(existingEvent.description)
      setVenueName(existingEvent.venue.name)
      setVenueAddress(existingEvent.venue.address || '')
      setStartsAt(existingEvent.startsAt.substring(0, 16))
      setEndsAt(existingEvent.endsAt.substring(0, 16))
      setPoster(existingEvent.poster)
      setBanner(existingEvent.banner || '')
      setSchedule(existingEvent.schedule || [])
      setPeople(existingEvent.people || [])
      setFormSchema(existingEvent.formSchema || [])
      setCapacity(existingEvent.capacity)
      setEligibility(existingEvent.eligibility)
      setWaitlistEnabled(existingEvent.waitlistEnabled)
      setIsTeamEnabled(existingEvent.features.team)
      setIsCertificateEnabled(existingEvent.features.certificate)
      setIsCheckinEnabled(existingEvent.features.checkin)
      setContactName(existingEvent.contact.name)
      setContactEmail(existingEvent.contact.email)
      setIsPaid(Boolean(existingEvent.features?.paid || (!existingEvent.isFree && existingEvent.price)))
      if (existingEvent.price) setTicketPriceInr(existingEvent.price)
    }
  }, [existingEvent])

  const handleSaveDraft = async () => {
    try {
      const payload = {
        organizerId: session?.clubId || organizerId,
        title,
        subtitle,
        category,
        type: type as any,
        description,
        venue: { name: venueName, address: venueAddress },
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        poster,
        banner: banner || undefined,
        schedule,
        people,
        formSchema,
        capacity: capacity == null ? null : Number(capacity),
        eligibility,
        waitlistEnabled,
        contact: { name: contactName, email: contactEmail },
        features: {
          team: isTeamEnabled,
          certificate: isCertificateEnabled,
          checkin: isCheckinEnabled,
          paid: isPaid,
        },
        isFree: !isPaid,
        price: isPaid ? ticketPriceInr : 0,
        currency: 'INR',
        teamConfig: isTeamEnabled ? { minSize: minTeamSize, maxSize: maxTeamSize } : undefined,
        status: 'draft' as const,
      }

      if (isEditing && id) {
        await updateMutation.mutateAsync({ id, updates: payload })
        toast({ title: 'Draft Saved', message: 'Event updates preserved.', type: 'success' })
      } else {
        const created = await createMutation.mutateAsync(payload)
        toast({ title: 'Draft Created', message: 'New draft event created.', type: 'success' })
        navigate(`/admin/events/${created.id}/edit`)
      }
    } catch {
      toast({ title: 'Save Failed', type: 'error' })
    }
  }

  const handleFinalPublish = async () => {
    try {
      const activeOrgId = session?.clubId || organizerId
      const orgMatch = clubs.find((c) => c.id === activeOrgId)
      const payload = {
        organizerId: activeOrgId,
        organizerName: orgMatch?.name || session?.clubName || 'DevCraft',
        organizerColor: orgMatch?.color || session?.clubColor || '#C66A4A',
        title,
        subtitle,
        category,
        type: type as any,
        description,
        venue: { name: venueName, address: venueAddress },
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        poster,
        banner: banner || undefined,
        schedule,
        people,
        formSchema,
        capacity: capacity == null ? null : Number(capacity),
        eligibility,
        waitlistEnabled,
        contact: { name: contactName, email: contactEmail },
        features: {
          team: isTeamEnabled,
          certificate: isCertificateEnabled,
          checkin: isCheckinEnabled,
          paid: isPaid,
        },
        isFree: !isPaid,
        price: isPaid ? ticketPriceInr : 0,
        currency: 'INR',
        teamConfig: isTeamEnabled ? { minSize: minTeamSize, maxSize: maxTeamSize } : undefined,
        status: 'published' as const,
      }

      let targetId = id
      if (!isEditing || !targetId) {
        const created = await createMutation.mutateAsync(payload)
        targetId = created.id
      } else {
        await updateMutation.mutateAsync({ id: targetId, updates: payload })
      }

      await publishMutation.mutateAsync(targetId)
      toast({
        title: 'Event Published to Federation!',
        message: 'The event is now visible on the public website, calendar, and club page.',
        type: 'success',
      })
      navigate('/admin/events')
    } catch {
      toast({ title: 'Publish failed', type: 'error' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Wizard Header */}
      <div className="pb-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-caption font-semibold text-accent block mb-0.5">
            Exhibition Master · {isEditing ? 'Editing Event Dossier' : 'New Exhibition Wizard'}
          </span>
          <h1 className="text-h2 font-semibold text-text">
            {title || 'Create Exhibition'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            surface="admin"
            variant="secondary"
            size="sm"
            icon={<FloppyDisk size={16} weight="bold" />}
            onClick={handleSaveDraft}
          >
            Save Draft
          </Button>
          <Link to="/admin/events">
            <Button surface="admin" variant="tertiary" size="sm">
              Cancel
            </Button>
          </Link>
        </div>
      </div>

      {/* Stepper Progress */}
      <Stepper
        steps={steps}
        currentStep={step}
        onStepClick={(i) => setStep(i)}
        surface="admin"
      />

      {/* STEP 0: DETAILS */}
      {step === 0 && (
        <div className="p-5 sm:p-6 bg-surface border border-line rounded-panel space-y-4">
          <h3 className="text-h3 font-semibold text-text">1. Core Particulars</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              surface="admin"
              label="Organizing Club"
              required
              value={organizerId}
              onChange={(e) => setOrganizerId(e.target.value)}
              options={clubs.map((c) => ({ value: c.id, label: c.name }))}
            />
            <Select
              surface="admin"
              label="Exhibition Format / Category"
              required
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                setType(e.target.value)
              }}
              options={[
                { value: 'hackathon', label: 'Hackathon' },
                { value: 'workshop', label: 'Workshop' },
                { value: 'competition', label: 'Competition' },
                { value: 'talk', label: 'Talk / Keynote' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </div>

          <Field
            surface="admin"
            label="Event Display Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Grand Turing Hackathon 2026"
          />

          <Field
            surface="admin"
            label="Editorial Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. 36-hour competitive systems marathon"
          />

          <Field
            surface="admin"
            multiline
            rows={4}
            label="Curatorial Description & Statement"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              surface="admin"
              label="Venue Name"
              required
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
            />
            <Field
              surface="admin"
              label="Physical Address / Hall"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              surface="admin"
              type="datetime-local"
              label="Commencement (Starts At)"
              required
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
            <Field
              surface="admin"
              type="datetime-local"
              label="Conclusion (Ends At)"
              required
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-line flex justify-end">
            <Button surface="admin" size="sm" arrow onClick={() => setStep(1)}>
              Next Step
            </Button>
          </div>
        </div>
      )}

      {/* STEP 1: MEDIA */}
      {step === 1 && (
        <div className="p-5 sm:p-6 bg-surface border border-line rounded-panel space-y-4">
          <h3 className="text-h3 font-semibold text-text">2. Documentary & Poster Media</h3>

          <Field
            surface="admin"
            label="Poster URL (4:5 Aspect Ratio Recommended)"
            required
            value={poster}
            onChange={(e) => setPoster(e.target.value)}
          />

          <Field
            surface="admin"
            label="Header Banner URL (Optional 16:9)"
            value={banner}
            onChange={(e) => setBanner(e.target.value)}
          />

          {poster && (
            <div className="pt-2">
              <span className="text-caption text-text-3 block mb-1.5 font-medium">
                Poster Preview Frame
              </span>
              <img
                src={poster}
                alt="Poster preview"
                className="max-w-xs h-auto rounded-panel border border-line object-cover"
              />
            </div>
          )}

          <div className="pt-4 border-t border-line flex justify-between">
            <Button surface="admin" variant="secondary" size="sm" onClick={() => setStep(0)}>
              ← Back
            </Button>
            <Button surface="admin" size="sm" arrow onClick={() => setStep(2)}>
              Next Step
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: TICKETS & PRICING */}
      {step === 2 && (
        <div className="p-5 sm:p-6 bg-surface border border-line rounded-panel space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
            <div>
              <h3 className="text-h3 font-semibold text-text">3. Admission & Pricing Architecture</h3>
              <p className="text-small text-text-2 mt-0.5">
                Configure ticketing mode, admission fee tiers, and inspect real-time automated split fee deductions.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-subtle p-1 border border-line rounded-btn shrink-0">
              <button
                type="button"
                onClick={() => setIsPaid(false)}
                className={`px-3 py-1 rounded-btn text-caption font-medium transition-colors ${
                  !isPaid ? 'bg-surface text-text shadow-sm' : 'text-text-3 hover:text-text'
                }`}
              >
                Free Pass
              </button>
              <button
                type="button"
                onClick={() => setIsPaid(true)}
                className={`px-3 py-1 rounded-btn text-caption font-medium transition-colors ${
                  isPaid ? 'bg-accent text-on-accent shadow-sm' : 'text-text-3 hover:text-text'
                }`}
              >
                Paid Ticket
              </button>
            </div>
          </div>

          {!isPaid ? (
            <div className="p-6 border border-dashed border-line rounded-panel bg-subtle/40 text-center space-y-2">
              <ShieldCheck size={32} weight="duotone" className="mx-auto text-success" />
              <h4 className="text-body font-semibold text-text">Complimentary Free Admission</h4>
              <p className="text-small text-text-2 max-w-md mx-auto">
                No payment collection or gateway fee applied. Attendees obtain their pass directly via 1-click confirmation or approval workflow.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  surface="admin"
                  type="number"
                  label="Attendee Ticket Price (INR)"
                  required
                  value={ticketPriceInr}
                  onChange={(e) => setTicketPriceInr(Math.max(0, Number(e.target.value)))}
                />
                <div className="flex flex-col justify-end pb-1.5">
                  <div className="text-caption text-text-3 flex items-center gap-1.5">
                    <Info size={16} className="text-accent shrink-0" />
                    <span>Currency locked to Indian Rupee (INR) for automated Cashfree Instant Settlements.</span>
                  </div>
                </div>
              </div>

              {/* Fee Quote Breakdown Card */}
              <div className="p-5 border border-line rounded-panel bg-subtle/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CurrencyInr size={20} weight="bold" className="text-accent" />
                    <h4 className="text-body font-semibold text-text">
                      Automated Split Settlement Calculation
                    </h4>
                  </div>
                  <span className="text-caption font-mono px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30 font-medium">
                    Cashfree Gateway Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-small">
                  <div className="p-3 bg-surface border border-line rounded-btn">
                    <span className="text-caption text-text-3 block mb-1">Base Price</span>
                    <span className="text-h3 font-bold text-text">
                      ₹{feeQuote ? feeQuote.base_amount_inr.toFixed(2) : ticketPriceInr.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-text-3 block mt-0.5">Attendee Ticket Face Value</span>
                  </div>

                  <div className="p-3 bg-surface border border-line rounded-btn">
                    <span className="text-caption text-text-3 block mb-1">
                      Gateway & Platform Fee
                    </span>
                    <span className="text-h3 font-bold text-danger">
                      -₹{feeQuote ? (feeQuote.platform_fee_inr + feeQuote.tax_amount_inr).toFixed(2) : ((ticketPriceInr * 0.05) + 3.5).toFixed(2)}
                    </span>
                    <span className="text-[11px] text-text-3 block mt-0.5">
                      Fee ({feeQuote?.attendee_fee_rate || 5}%) + GST
                    </span>
                  </div>

                  <div className="p-3 bg-iris/10 border border-iris/25 rounded-btn">
                    <span className="text-caption text-iris block mb-1 font-medium">
                      Net Organizer Payout / Ticket
                    </span>
                    <span className="text-h3 font-bold text-text">
                      ₹{feeQuote ? feeQuote.organizer_share_inr.toFixed(2) : (ticketPriceInr * 0.95).toFixed(2)}
                    </span>
                    <span className="text-[11px] text-iris block mt-0.5">
                      Direct disbursement to verified bank
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-surface border border-line rounded-btn flex items-center justify-between text-caption text-text-2">
                  <div className="flex items-center gap-2">
                    <Sparkle size={16} weight="fill" className="text-accent" />
                    <span>Total charged to attendee checkout:</span>
                  </div>
                  <span className="font-mono font-bold text-text text-body">
                    ₹{feeQuote ? feeQuote.total_payable_inr.toFixed(2) : ticketPriceInr.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-line flex justify-between">
            <Button surface="admin" variant="secondary" size="sm" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button surface="admin" size="sm" arrow onClick={() => setStep(3)}>
              Next Step
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: SCHEDULE & PEOPLE */}
      {step === 3 && (
        <div className="p-5 sm:p-6 bg-surface border border-line rounded-panel space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-h3 font-semibold text-text">4. Schedule Timeline</h3>
              <Button
                surface="admin"
                variant="secondary"
                size="sm"
                onClick={() => setSchedule([...schedule, { time: '12:00 PM', title: 'New Item' }])}
              >
                + Add Session
              </Button>
            </div>

            <div className="space-y-2">
              {schedule.map((item, idx) => (
                <div key={idx} className="p-2.5 border border-line rounded-btn bg-subtle flex items-center gap-2">
                  <input
                    type="text"
                    value={item.time}
                    onChange={(e) => {
                      const copy = [...schedule]
                      copy[idx].time = e.target.value
                      setSchedule(copy)
                    }}
                    className="w-28 text-small p-1.5 border border-line rounded-btn bg-surface"
                  />
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const copy = [...schedule]
                      copy[idx].title = e.target.value
                      setSchedule(copy)
                    }}
                    className="flex-1 text-small p-1.5 border border-line rounded-btn bg-surface"
                  />
                  <button
                    type="button"
                    onClick={() => setSchedule(schedule.filter((_, i) => i !== idx))}
                    className="text-text-3 hover:text-danger p-1"
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-line pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-h3 font-semibold text-text">Keynote Speakers & Judges</h3>
              <Button
                surface="admin"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setPeople([...people, { name: 'New Speaker', role: 'speaker', bio: 'Fellow' }])
                }
              >
                + Add Person
              </Button>
            </div>

            <div className="space-y-2">
              {people.map((person, idx) => (
                <div key={idx} className="p-2.5 border border-line rounded-btn bg-subtle flex items-center gap-2">
                  <input
                    type="text"
                    value={person.name}
                    placeholder="Name"
                    onChange={(e) => {
                      const copy = [...people]
                      copy[idx].name = e.target.value
                      setPeople(copy)
                    }}
                    className="w-40 text-small p-1.5 border border-line rounded-btn bg-surface"
                  />
                  <select
                    value={person.role}
                    onChange={(e) => {
                      const copy = [...people]
                      copy[idx].role = e.target.value as any
                      setPeople(copy)
                    }}
                    className="w-32 text-small p-1.5 border border-line rounded-btn bg-surface"
                  >
                    <option value="speaker">Speaker</option>
                    <option value="judge">Judge</option>
                    <option value="instructor">Instructor</option>
                  </select>
                  <input
                    type="text"
                    value={person.bio || ''}
                    placeholder="Bio"
                    onChange={(e) => {
                      const copy = [...people]
                      copy[idx].bio = e.target.value
                      setPeople(copy)
                    }}
                    className="flex-1 text-small p-1.5 border border-line rounded-btn bg-surface"
                  />
                  <button
                    type="button"
                    onClick={() => setPeople(people.filter((_, i) => i !== idx))}
                    className="text-text-3 hover:text-danger p-1"
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-line flex justify-between">
            <Button surface="admin" variant="secondary" size="sm" onClick={() => setStep(2)}>
              ← Back
            </Button>
            <Button surface="admin" size="sm" arrow onClick={() => setStep(4)}>
              Next Step
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: REGISTRATION FORM BUILDER */}
      {step === 4 && (
        <div className="p-5 sm:p-6 bg-surface border border-line rounded-panel space-y-4">
          <AdminFormBuilder fields={formSchema} onChange={(newFields) => setFormSchema(newFields)} />

          <div className="pt-4 border-t border-line flex justify-between">
            <Button surface="admin" variant="secondary" size="sm" onClick={() => setStep(3)}>
              ← Back
            </Button>
            <Button surface="admin" size="sm" arrow onClick={() => setStep(5)}>
              Next Step
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: QUOTAS & SETTINGS */}
      {step === 5 && (
        <div className="p-5 sm:p-6 bg-surface border border-line rounded-panel space-y-4">
          <h3 className="text-h3 font-semibold text-text">6. Quotas & Capabilities</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              surface="admin"
              type="number"
              label="Maximum Attendee Capacity"
              required
              value={capacity ?? ''}
              onChange={(e) => setCapacity(e.target.value === '' ? null : Number(e.target.value))}
            />
            <Field
              surface="admin"
              label="Eligibility Statement"
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
            />
          </div>

          <div className="space-y-2.5 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-small text-text">
              <input
                type="checkbox"
                checked={waitlistEnabled}
                onChange={(e) => setWaitlistEnabled(e.target.checked)}
                className="h-4 w-4 rounded text-accent"
              />
              <span>Enable automatic waitlist when capacity reached</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-small text-text">
              <input
                type="checkbox"
                checked={isTeamEnabled}
                onChange={(e) => setIsTeamEnabled(e.target.checked)}
                className="h-4 w-4 rounded text-accent"
              />
              <span>Enable team registration mode</span>
            </label>

            {isTeamEnabled && (
              <div className="pl-6 pt-1 flex items-center gap-4">
                <Field
                  surface="admin"
                  type="number"
                  label="Min Team Members"
                  value={minTeamSize}
                  onChange={(e) => setMinTeamSize(Number(e.target.value))}
                />
                <Field
                  surface="admin"
                  type="number"
                  label="Max Team Members"
                  value={maxTeamSize}
                  onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                />
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer text-small text-text">
              <input
                type="checkbox"
                checked={isCertificateEnabled}
                onChange={(e) => setIsCertificateEnabled(e.target.checked)}
                className="h-4 w-4 rounded text-accent"
              />
              <span>Generate cryptographic certificates on event completion</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-small text-text">
              <input
                type="checkbox"
                checked={isCheckinEnabled}
                onChange={(e) => setIsCheckinEnabled(e.target.checked)}
                className="h-4 w-4 rounded text-accent"
              />
              <span>Enable mobile ticket QR check-in desk</span>
            </label>
          </div>

          <div className="pt-4 border-t border-line flex justify-between">
            <Button surface="admin" variant="secondary" size="sm" onClick={() => setStep(4)}>
              ← Back
            </Button>
            <Button surface="admin" size="sm" arrow onClick={() => setStep(6)}>
              Next Step
            </Button>
          </div>
        </div>
      )}

      {/* STEP 6: REVIEW & PUBLISH */}
      {step === 6 && (
        <div className="p-5 sm:p-6 bg-surface border border-line rounded-panel space-y-4">
          <h3 className="text-h3 font-semibold text-text">7. Review & Final Publication</h3>

          <div className="border border-line rounded-panel p-4 space-y-2 text-small bg-subtle">
            <p><strong>Title:</strong> {title}</p>
            <p><strong>Organizing Club:</strong> {clubs.find((c) => c.id === organizerId)?.name || 'DevCraft'}</p>
            <p><strong>Format:</strong> {category}</p>
            <p><strong>Venue:</strong> {venueName}</p>
            <p><strong>Dates:</strong> {startsAt} to {endsAt}</p>
            <p><strong>Admission:</strong> {isPaid ? `Paid Pass (₹${ticketPriceInr} INR)` : 'Free Public Pass'}</p>
            <p><strong>Capacity:</strong> {capacity} attendees ({waitlistEnabled ? 'Waitlist on' : 'Waitlist off'})</p>
            <p><strong>Form Questions:</strong> {formSchema.length} custom fields configured</p>
          </div>

          <div className="p-3 bg-success/10 border border-success/30 rounded-btn text-caption text-success">
            Publishing will automatically synchronize this event to the public website, calendar, and club page without requiring a page reload.
          </div>

          <div className="pt-4 border-t border-line flex justify-between">
            <Button surface="admin" variant="secondary" size="sm" onClick={() => setStep(5)}>
              ← Back
            </Button>

            <div className="flex items-center gap-2">
              <Button
                surface="admin"
                variant="secondary"
                size="sm"
                onClick={handleSaveDraft}
              >
                Save as Draft Only
              </Button>
              <Button
                surface="admin"
                size="sm"
                loading={publishMutation.isPending || createMutation.isPending}
                onClick={handleFinalPublish}
              >
                Publish Exhibition
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
