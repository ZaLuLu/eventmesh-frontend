import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, Trash2, ArrowRight, ArrowLeft, Save, Check } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useClubs } from '@/hooks/useClubs'
import { useEvent, useCreateEvent, useUpdateEvent, usePublishEvent } from '@/hooks/useEvents'
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
  const { data: existingEvent, isLoading: eventLoading } = useEvent(id || '')

  const createMutation = useCreateEvent()
  const updateMutation = useUpdateEvent()
  const publishMutation = usePublishEvent()

  const [step, setStep] = useState(0)
  const steps = [
    { id: 'details', label: '1. Details' },
    { id: 'media', label: '2. Media' },
    { id: 'schedule', label: '3. Schedule & People' },
    { id: 'form', label: '4. Form Builder' },
    { id: 'settings', label: '5. Quotas & Settings' },
    { id: 'review', label: '6. Review & Publish' },
  ]

  // Form State
  const [organizerId, setOrganizerId] = useState(session?.clubId || clubs[0]?.id || 'club-cp')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [category, setCategory] = useState('workshop')
  const [type, setType] = useState('workshop')
  const [description, setDescription] = useState('')
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
  const [capacity, setCapacity] = useState(100)
  const [eligibility, setEligibility] = useState('Open to all registered members')
  const [waitlistEnabled, setWaitlistEnabled] = useState(true)
  const [isTeamEnabled, setIsTeamEnabled] = useState(false)
  const [minTeamSize, setMinTeamSize] = useState(2)
  const [maxTeamSize, setMaxTeamSize] = useState(4)
  const [isCertificateEnabled, setIsCertificateEnabled] = useState(true)
  const [isCheckinEnabled, setIsCheckinEnabled] = useState(true)
  const [contactName, setContactName] = useState(session?.name || 'Sameer Kulkarni')
  const [contactEmail, setContactEmail] = useState(session?.email || 'lead@cpclub.org')

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
    }
  }, [existingEvent])

  const handleSaveDraft = async () => {
    try {
      const payload = {
        organizerId,
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
        capacity: Number(capacity),
        eligibility,
        waitlistEnabled,
        contact: { name: contactName, email: contactEmail },
        features: {
          team: isTeamEnabled,
          certificate: isCertificateEnabled,
          checkin: isCheckinEnabled,
          paid: false,
        },
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
      const payload = {
        organizerId,
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
        capacity: Number(capacity),
        eligibility,
        waitlistEnabled,
        contact: { name: contactName, email: contactEmail },
        features: {
          team: isTeamEnabled,
          certificate: isCertificateEnabled,
          checkin: isCheckinEnabled,
          paid: false,
        },
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
    <div className="space-y-8">
      {/* Wizard Header */}
      <div className="pb-6 border-b border-[#C9D0D4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-60 block mb-1">
            {isEditing ? 'Editing Event Dossier' : 'New Exhibition Wizard'}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink">
            {title || 'Untitled Event'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            surface="admin"
            variant="secondary"
            size="sm"
            icon={<Save className="h-4 w-4" />}
            onClick={handleSaveDraft}
          >
            Save Draft
          </Button>
          <Link to="/admin/events">
            <Button surface="admin" variant="ghost" size="sm">
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
        <div className="p-6 sm:p-8 bg-paper border border-[#C9D0D4] space-y-6">
          <h3 className="font-display text-2xl uppercase text-ink">1. Core Particulars</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                { value: 'workshop', label: 'Workshop' },
                { value: 'hackathon', label: 'Hackathon' },
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
            placeholder="e.g. THE AUTONOMOUS SWARM FLIGHT HACKATHON"
          />

          <Field
            surface="admin"
            label="Editorial Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. 48-Hour Systems & Kinetic Control Sprint"
          />

          <Field
            surface="admin"
            multiline
            rows={5}
            label="Curatorial Description & Statement"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

          <div className="pt-6 border-t border-[#C9D0D4] flex justify-end">
            <Button surface="admin" size="md" arrow onClick={() => setStep(1)}>
              Proceed to Media
            </Button>
          </div>
        </div>
      )}

      {/* STEP 1: MEDIA */}
      {step === 1 && (
        <div className="p-6 sm:p-8 bg-paper border border-[#C9D0D4] space-y-6">
          <h3 className="font-display text-2xl uppercase text-ink">2. Documentary & Poster Media</h3>

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
            <div className="pt-4">
              <span className="font-mono text-xs uppercase text-ink-60 block mb-2">
                Poster Preview Frame
              </span>
              <img
                src={poster}
                alt="Poster preview"
                className="max-w-xs h-auto border border-[#C9D0D4] object-cover"
              />
            </div>
          )}

          <div className="pt-6 border-t border-[#C9D0D4] flex justify-between">
            <Button surface="admin" variant="secondary" onClick={() => setStep(0)}>
              ← Back
            </Button>
            <Button surface="admin" size="md" arrow onClick={() => setStep(2)}>
              Proceed to Schedule
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: SCHEDULE & PEOPLE */}
      {step === 2 && (
        <div className="p-6 sm:p-8 bg-paper border border-[#C9D0D4] space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-2xl uppercase text-ink">3. Schedule Timeline</h3>
              <Button
                surface="admin"
                variant="secondary"
                size="dense"
                onClick={() => setSchedule([...schedule, { time: '12:00 PM', title: 'New Item' }])}
              >
                + Add Session
              </Button>
            </div>

            <div className="space-y-3">
              {schedule.map((item, idx) => (
                <div key={idx} className="p-3 border border-[#C9D0D4] flex items-center gap-3">
                  <input
                    type="text"
                    value={item.time}
                    onChange={(e) => {
                      const copy = [...schedule]
                      copy[idx].time = e.target.value
                      setSchedule(copy)
                    }}
                    className="w-32 font-mono text-xs p-1.5 border border-[#C9D0D4]"
                  />
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const copy = [...schedule]
                      copy[idx].title = e.target.value
                      setSchedule(copy)
                    }}
                    className="flex-1 font-body text-xs p-1.5 border border-[#C9D0D4]"
                  />
                  <button
                    type="button"
                    onClick={() => setSchedule(schedule.filter((_, i) => i !== idx))}
                    className="text-ink-60 hover:text-[#A32828]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#C9D0D4] pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-2xl uppercase text-ink">Keynote Speakers & Judges</h3>
              <Button
                surface="admin"
                variant="secondary"
                size="dense"
                onClick={() =>
                  setPeople([...people, { name: 'New Speaker', role: 'speaker', bio: 'Fellow' }])
                }
              >
                + Add Person
              </Button>
            </div>

            <div className="space-y-3">
              {people.map((person, idx) => (
                <div key={idx} className="p-3 border border-[#C9D0D4] flex items-center gap-3">
                  <input
                    type="text"
                    value={person.name}
                    placeholder="Name"
                    onChange={(e) => {
                      const copy = [...people]
                      copy[idx].name = e.target.value
                      setPeople(copy)
                    }}
                    className="w-48 font-body text-xs p-1.5 border border-[#C9D0D4]"
                  />
                  <select
                    value={person.role}
                    onChange={(e) => {
                      const copy = [...people]
                      copy[idx].role = e.target.value as any
                      setPeople(copy)
                    }}
                    className="w-32 font-mono text-xs p-1.5 border border-[#C9D0D4]"
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
                    className="flex-1 font-body text-xs p-1.5 border border-[#C9D0D4]"
                  />
                  <button
                    type="button"
                    onClick={() => setPeople(people.filter((_, i) => i !== idx))}
                    className="text-ink-60 hover:text-[#A32828]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-[#C9D0D4] flex justify-between">
            <Button surface="admin" variant="secondary" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button surface="admin" size="md" arrow onClick={() => setStep(3)}>
              Proceed to Form Builder
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: REGISTRATION FORM BUILDER */}
      {step === 3 && (
        <div className="p-6 sm:p-8 bg-paper border border-[#C9D0D4] space-y-6">
          <AdminFormBuilder fields={formSchema} onChange={(newFields) => setFormSchema(newFields)} />

          <div className="pt-6 border-t border-[#C9D0D4] flex justify-between">
            <Button surface="admin" variant="secondary" onClick={() => setStep(2)}>
              ← Back
            </Button>
            <Button surface="admin" size="md" arrow onClick={() => setStep(4)}>
              Proceed to Settings
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: QUOTAS & SETTINGS */}
      {step === 4 && (
        <div className="p-6 sm:p-8 bg-paper border border-[#C9D0D4] space-y-6">
          <h3 className="font-display text-2xl uppercase text-ink">5. Quotas & Capabilities</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field
              surface="admin"
              type="number"
              label="Maximum Attendee Capacity"
              required
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
            <Field
              surface="admin"
              label="Eligibility Statement"
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-mono text-xs uppercase text-ink">
              <input
                type="checkbox"
                checked={waitlistEnabled}
                onChange={(e) => setWaitlistEnabled(e.target.checked)}
                className="h-4 w-4 rounded-none border border-ink text-admin-accent"
              />
              <span>Enable Automatic Waitlist When Capacity Reached</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-mono text-xs uppercase text-ink">
              <input
                type="checkbox"
                checked={isTeamEnabled}
                onChange={(e) => setIsTeamEnabled(e.target.checked)}
                className="h-4 w-4 rounded-none border border-ink text-admin-accent"
              />
              <span>Enable Team Registration Mode</span>
            </label>

            {isTeamEnabled && (
              <div className="pl-6 pt-2 flex items-center gap-4">
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

            <label className="flex items-center gap-2 cursor-pointer font-mono text-xs uppercase text-ink">
              <input
                type="checkbox"
                checked={isCertificateEnabled}
                onChange={(e) => setIsCertificateEnabled(e.target.checked)}
                className="h-4 w-4 rounded-none border border-ink text-admin-accent"
              />
              <span>Generate Cryptographic Certificates on Event Completion</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-mono text-xs uppercase text-ink">
              <input
                type="checkbox"
                checked={isCheckinEnabled}
                onChange={(e) => setIsCheckinEnabled(e.target.checked)}
                className="h-4 w-4 rounded-none border border-ink text-admin-accent"
              />
              <span>Enable Mobile Ticket QR Check-in Desk</span>
            </label>
          </div>

          <div className="pt-6 border-t border-[#C9D0D4] flex justify-between">
            <Button surface="admin" variant="secondary" onClick={() => setStep(3)}>
              ← Back
            </Button>
            <Button surface="admin" size="md" arrow onClick={() => setStep(5)}>
              Proceed to Review
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW & PUBLISH */}
      {step === 5 && (
        <div className="p-6 sm:p-8 bg-paper border border-[#C9D0D4] space-y-6">
          <h3 className="font-display text-2xl uppercase text-ink">6. Review & Final Publication</h3>

          <div className="border border-[#C9D0D4] p-6 space-y-3 font-body text-sm bg-[#E6EAEC]/30">
            <p><strong>Title:</strong> {title}</p>
            <p><strong>Organizing Club:</strong> {clubs.find((c) => c.id === organizerId)?.name}</p>
            <p><strong>Format:</strong> {category}</p>
            <p><strong>Venue:</strong> {venueName}</p>
            <p><strong>Dates:</strong> {startsAt} to {endsAt}</p>
            <p><strong>Capacity:</strong> {capacity} attendees ({waitlistEnabled ? 'Waitlist on' : 'Waitlist off'})</p>
            <p><strong>Form Questions:</strong> {formSchema.length} custom fields configured</p>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-400 font-mono text-xs text-emerald-900">
            Publishing will automatically synchronize this event to the public website, calendar, and club page without requiring a page reload.
          </div>

          <div className="pt-6 border-t border-[#C9D0D4] flex justify-between">
            <Button surface="admin" variant="secondary" onClick={() => setStep(4)}>
              ← Back
            </Button>

            <div className="flex items-center gap-3">
              <Button
                surface="admin"
                variant="secondary"
                onClick={handleSaveDraft}
              >
                Save as Draft Only
              </Button>
              <Button
                surface="admin"
                size="lg"
                loading={publishMutation.isPending || createMutation.isPending}
                onClick={handleFinalPublish}
              >
                Publish & Push Live
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
