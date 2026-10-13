// Hallmark macrostructure: Stepper-Form
import React, { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { useEvent } from '@/hooks/useEvents'
import { useAuth } from '@/hooks/useAuth'
import { useRegister, useMyRegistrations, useCancelMyRegistration, useJoinWaitlist } from '@/hooks/useRegistrations'
import { PageShell } from '@/design-system/layout/PageShell'
import { Button } from '@/design-system/primitives/Button'
import { Field } from '@/design-system/primitives/Field'
import { Sticker } from '@/design-system/primitives/Sticker'
import { QRCode } from '@/design-system/primitives/QRCode'
import { FormRenderer } from './FormRenderer'
import { formatDate, formatTime, formatCurrency } from '@/lib/format'
import { Registration } from '@/api'
import { downloadICS } from '@/lib/ics'
import { getClubTheme } from '@/design-system/clubColors'
import { useToast } from '@/design-system/primitives/Toast'
import { Icon } from '@/design-system/Icon'
import { appConfig } from '@/config/appConfig'

interface TeamMemberItem {
  id: string
  name: string
  email: string
  role: string
  status: 'Joined' | 'Invited'
}

export const RegisterPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const { data: event, isLoading } = useEvent(slug || '')
  const { session } = useAuth()
  const registerMutation = useRegister()
  const cancelMutation = useCancelMyRegistration()
  const waitlistMutation = useJoinWaitlist()
  const { data: myRegistrations = [] } = useMyRegistrations()

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [createdRegistration, setCreatedRegistration] = useState<Registration | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Step 1: Attendee Profile (pre-filled from active session, email locked: F-01)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('+91 98765 43210')
  const [regNumber, setRegNumber] = useState('22BCE1094')
  const [branch, setBranch] = useState('Computer Science & Eng.')

  useEffect(() => {
    if (session) {
      setName(session.name || 'Aarav Deshmukh')
      setEmail(session.email || 'aarav.deshmukh@campus.edu.in')
    } else {
      setName('Aarav Deshmukh')
      setEmail('aarav.deshmukh@campus.edu.in')
    }
  }, [session])

  // Step 2: Team info (F-02)
  const [teamName, setTeamName] = useState('')
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>([])

  // Initialize team members if team event
  useEffect(() => {
    if (event?.features?.team && teamMembers.length === 0) {
      const leadMember: TeamMemberItem = {
        id: 'mem-lead',
        name: name || session?.name || 'Aarav Deshmukh',
        email: email || session?.email || 'aarav.deshmukh@campus.edu.in',
        role: 'Team Lead',
        status: 'Joined',
      }
      const initialTeammate: TeamMemberItem = {
        id: 'mem-1',
        name: 'Rohan Sharma',
        email: 'rohan.sharma@campus.edu.in',
        role: 'Full-Stack Developer',
        status: 'Invited',
      }
      setTeamMembers([leadMember, initialTeammate])
      setTeamName('Team Turing Genesis')
    }
  }, [event, name, email, session])

  // Dynamic Questionnaire answers
  const [formAnswers, setFormAnswers] = useState<Record<string, any>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [agreedToConduct, setAgreedToConduct] = useState(true)

  if (isLoading || !event) {
    return (
      <PageShell className="py-12">
        <div className="space-y-6 max-w-4xl animate-pulse">
          <div className="h-4 bg-paper-2 rounded w-48" />
          <div className="h-10 bg-paper-2 rounded w-1/2" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 h-96 bg-paper-2 rounded-[16px]" />
            <div className="lg:col-span-5 h-96 bg-paper-2 rounded-[16px]" />
          </div>
        </div>
      </PageShell>
    )
  }

  const clubTheme = getClubTheme(event.organizerId || event.club?.id || '')
  const selectedTier = searchParams.get('tier') || 'tier-standard'
  const isSoldOut = event.seatsLeft <= 0
  const isTeamEvent = Boolean(event.features?.team)
  const minTeamSize = event.teamConfig?.minSize || 2
  const maxTeamSize = event.teamConfig?.maxSize || 4

  // Check if existing registration is on record
  const existingReg = myRegistrations.find((r) => r.eventId === event.id && r.status !== 'cancelled')

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

  const validateStep1 = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Full name is required'
    if (!email.trim()) errs.email = 'Valid campus email is required'
    if (!phone.trim()) errs.phone = 'Phone number is required'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep2 = () => {
    const errs: Record<string, string> = {}
    if (isTeamEvent) {
      if (!teamName.trim()) errs.teamName = 'Team name is required'
      if (teamMembers.length < minTeamSize) {
        errs.teamMembers = `Team requires at least ${minTeamSize} members`
      }
      // Check each member has email
      teamMembers.forEach((m, idx) => {
        if (!m.email.trim()) {
          errs[`member_${idx}_email`] = 'Campus email is required'
        }
      })
    }
    if (event.formSchema) {
      for (const field of event.formSchema) {
        if (field.required && !formAnswers[field.id]) {
          errs[field.id] = `${field.label} is required`
        }
      }
    }
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2)
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3)
    }
  }

  const handleAddTeammate = () => {
    if (teamMembers.length >= maxTeamSize) return
    const newIdx = teamMembers.length + 1
    setTeamMembers([
      ...teamMembers,
      {
        id: `mem-${Date.now()}`,
        name: `Teammate ${newIdx}`,
        email: `teammate${newIdx}@campus.edu.in`,
        role: 'Collaborator',
        status: 'Invited',
      },
    ])
  }

  const handleRemoveTeammate = (id: string) => {
    if (teamMembers.length <= minTeamSize) {
      toast({
        title: 'Minimum team limit',
        message: `This event requires at least ${minTeamSize} members.`,
        type: 'info',
      })
      return
    }
    setTeamMembers(teamMembers.filter((m) => m.id !== id))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreedToConduct) {
      toast({
        title: 'Agreement required',
        message: 'Please agree to the Campus Code of Conduct to proceed.',
        type: 'info',
      })
      return
    }

    try {
      const payload = {
        eventId: event.id,
        answers: {
          ...formAnswers,
          phone,
          regNumber,
          branch,
          ticketTier: selectedTier,
        },
        team: isTeamEvent
          ? {
              teamName,
              leaderName: name,
              leaderEmail: email,
              members: teamMembers.map((m) => ({
                name: m.name,
                email: m.email,
                role: m.role,
              })),
            }
          : undefined,
      }

      const res = await registerMutation.mutateAsync(payload)
      setCreatedRegistration(res)
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#0047FF', '#C8BEFA', '#7FD8B8', '#F2B84B', '#FF5C8A'],
        })
      } catch {}
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Registration failed:', err)
      toast({
        title: 'Registration failed',
        message: 'Unable to reserve pass. Please try again.',
        type: 'error',
      })
    }
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
      message: 'Event added to calendar (.ics).',
      type: 'success',
    })
  }

  const handleCancelRegistration = async () => {
    if (!existingReg) return
    try {
      await cancelMutation.mutateAsync(existingReg.id)
      setShowCancelConfirm(false)
      toast({
        title: 'Registration cancelled',
        message: 'Your registration pass has been cancelled.',
        type: 'info',
      })
    } catch {
      toast({
        title: 'Error cancelling',
        message: 'Failed to cancel registration.',
        type: 'error',
      })
    }
  }

  const handleJoinWaitlist = async () => {
    try {
      const res = await waitlistMutation.mutateAsync({
        eventId: event.id,
        answers: { name, email, phone },
      })
      setCreatedRegistration(res)
      toast({
        title: 'Waitlist confirmed',
        message: "You're on the waitlist! We'll alert you if a seat opens up.",
        type: 'success',
      })
    } catch {
      toast({
        title: 'Error joining waitlist',
        message: 'Unable to join waitlist.',
        type: 'error',
      })
    }
  }

  return (
    <PageShell className="py-6 sm:py-8 space-y-6">
      {/* Breadcrumb (V-07) */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-ink-soft">
        <Link to="/explore" className="hover:text-ink font-medium transition-colors">Events</Link>
        <Icon name="CaretRight" size={14} className="text-ink-soft/40 flex-shrink-0" />
        <Link to={`/events/${event.slug}`} className="hover:text-ink font-medium line-clamp-1 max-w-[200px] transition-colors">
          {event.title}
        </Link>
        <Icon name="CaretRight" size={14} className="text-ink-soft/40 flex-shrink-0" />
        <span className="text-ink font-semibold">Registration</span>
      </nav>

      {/* CONFIRMATION STATE: INTACT TICKET WITH QR ON FACE (Mandate 1, zero tear here!) */}
      {createdRegistration ? (
        <div className="max-w-2xl mx-auto space-y-6 text-center">
          <div className="space-y-2">
            <Sticker color="mint" className="text-xs" tilt={0}>
              {createdRegistration.status === 'waitlisted' ? 'Waitlist Confirmed' : 'Registration Confirmed'}
            </Sticker>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
              {createdRegistration.status === 'waitlisted' ? 'Added to Waitlist' : "You're in! Pass is ready."}
            </h1>
            <p className="text-sm text-ink-soft max-w-lg mx-auto">
              {createdRegistration.status === 'waitlisted'
                ? "Your waitlist position is reserved. You'll receive a push notification if a seat is promoted."
                : 'Your intact entry ticket is issued. Present this QR code to the gate volunteer for check-in scan.'}
            </p>
          </div>

          {/* Physical Ticket Object: Perforated paper look, scannable QR on ticket face, zero neon (Mandate 1) */}
          <div className="bg-card border-2 border-ink rounded-[20px] p-6 sm:p-8 text-left shadow-offset relative overflow-hidden">
            {/* Notched stub bite marks */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-paper border border-ink" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-paper border border-ink" />

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/15 pb-4">
              <div className="flex items-center gap-2">
                <Sticker color={clubTheme.token as any} className="text-xs" tilt={0}>
                  {event.organizerName || event.club?.name || 'Campus Club'}
                </Sticker>
                <span className="text-xs font-bold text-ink-soft">
                  {isTeamEvent ? `Team: ${teamName}` : 'Individual Entry'}
                </span>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-paper border border-ink/20 text-ink">
                {createdRegistration.ticketCode}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center py-6">
              <div className="sm:col-span-7 space-y-3">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-ink leading-tight">
                  {event.title}
                </h3>
                <div className="space-y-1 text-xs text-ink-soft">
                  <p className="flex items-center gap-1.5">
                    <Icon name="CalendarBlank" size={14} className="text-cobalt" />
                    <span>{formatDate(event.startsAt, 'full')} · {formatTime(event.startsAt)}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Icon name="MapPin" size={14} className="text-cobalt" />
                    <span>{event.venue?.name || 'Main Campus Auditorium'}</span>
                  </p>
                  <p className="flex items-center gap-1.5 pt-1 text-ink font-medium">
                    <Icon name="User" size={14} className="text-cobalt" />
                    <span>Attendee: {name} ({email})</span>
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-mint/20 text-emerald-800 border border-mint">
                    <Icon name="CheckCircle" size={13} />
                    Ticket Face Intact
                  </span>
                  <span className="text-xs text-ink-soft">Tears only at gate check-in</span>
                </div>
              </div>

              {/* Scannable QR code on ticket face (Mandate 1) */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-[14px] bg-paper border border-ink/10">
                <QRCode
                  value={`EVENTMESH:TKT:${createdRegistration.ticketCode}:${createdRegistration.id}`}
                  size={140}
                  className="rounded"
                />
                <span className="font-mono text-xs text-ink-soft mt-1.5 tracking-wider font-semibold">
                  SCAN AT GATE
                </span>
              </div>
            </div>

            <div className="border-t border-dashed border-ink/20 pt-4 flex flex-wrap items-center justify-between text-xs text-ink-soft">
              <span>Serial: #{createdRegistration.id.slice(0, 8).toUpperCase()}</span>
              <span>EventMesh Campus Pass Protocol v2</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/attendee/dashboard" className="w-full sm:w-auto">
              <Button variant="primary" size="default">
                View in My Tickets & 3D Badge
              </Button>
            </Link>
            <button
              type="button"
              onClick={handleDownloadCalendar}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-card border border-ink text-ink font-bold text-sm hover:bg-paper-2 transition-colors"
            >
              <Icon name="CalendarPlus" size={16} />
              <span>Add to calendar (.ics)</span>
            </button>
            <Link to="/explore" className="w-full sm:w-auto">
              <Button variant="secondary" size="default">
                Explore more events
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* REGISTRATION FLOW: Two-column grid (Form left minmax(0,1fr), Summary right 380px) (V-06) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 3-Step Stepper & Form */}
          <div className="lg:col-span-8 bg-card border border-ink/15 rounded-[20px] p-6 sm:p-8 space-y-6 shadow-sm">
            {/* Stepper Header (F-02) */}
            <div className="border-b border-ink/10 pb-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-soft block">
                    Step {currentStep} of 3
                  </span>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                    {currentStep === 1 && 'Your particulars'}
                    {currentStep === 2 && (isTeamEvent ? 'Team collective & questionnaire' : 'Session questions')}
                    {currentStep === 3 && 'Review & confirm pass'}
                  </h1>
                </div>
                <Sticker color={clubTheme.token as any} className="text-xs" tilt={0}>
                  {event.organizerName || 'Campus'}
                </Sticker>
              </div>

              {/* Step indicator progress bar */}
              <div className="grid grid-cols-3 gap-2">
                <div className={`h-1.5 rounded-full transition-colors ${currentStep >= 1 ? 'bg-cobalt' : 'bg-paper-2'}`} />
                <div className={`h-1.5 rounded-full transition-colors ${currentStep >= 2 ? 'bg-cobalt' : 'bg-paper-2'}`} />
                <div className={`h-1.5 rounded-full transition-colors ${currentStep === 3 ? 'bg-cobalt' : 'bg-paper-2'}`} />
              </div>
            </div>

            {/* Existing Registration Banner (F-03) */}
            {existingReg && (
              <div className="p-4 rounded-[14px] bg-mint/15 border border-mint flex flex-wrap items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-bold text-emerald-900">Pass already held on record</p>
                  <p className="text-xs text-ink-soft">
                    You hold ticket <span className="font-mono font-bold text-ink">{existingReg.ticketCode}</span> for this event.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/attendee/dashboard">
                    <Button variant="secondary" size="compact">View pass</Button>
                  </Link>
                  {showCancelConfirm ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCancelRegistration}
                        disabled={cancelMutation.isPending}
                        className="px-3 py-1 bg-red-600 text-white rounded-full font-bold text-xs"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(false)}
                        className="px-2 py-1 text-xs text-ink-soft hover:underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirm(true)}
                      className="text-xs text-red-600 font-semibold hover:underline px-2"
                    >
                      Cancel pass
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Sold out banner */}
            {isSoldOut && !existingReg && (
              <div className="p-4 rounded-[14px] bg-amber-50 border border-amber-300 flex flex-wrap items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-bold text-amber-900">Event is at full capacity</p>
                  <p className="text-xs text-amber-800">
                    Registration is currently waitlisted. Click below to secure your waitlist position.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="compact"
                  onClick={handleJoinWaitlist}
                  loading={waitlistMutation.isPending}
                >
                  Join waitlist
                </Button>
              </div>
            )}

            {/* STEP 1: Personal particulars (F-01 pre-filled and email locked) */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="p-3.5 rounded-[12px] bg-paper border border-ink/10 flex items-center justify-between text-xs text-ink-soft">
                  <div className="flex items-center gap-2">
                    <Icon name="LockSimple" size={16} className="text-cobalt" />
                    <span>Logged in as <strong>{session?.name || 'Aarav Deshmukh'}</strong></span>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-card border border-ink/15 font-semibold text-ink">
                    Verified Campus SSO
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    id="name"
                    name="name"
                    label="Full Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={formErrors.name}
                  />

                  {/* Email is locked to signed-in identity (F-01) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-ink-soft flex items-center justify-between">
                      <span>Campus Email</span>
                      <span className="text-[10px] font-mono font-semibold text-cobalt flex items-center gap-1">
                        <Icon name="LockSimple" size={12} />
                        Locked to Session
                      </span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      readOnly
                      value={email}
                      className="w-full px-3.5 py-2.5 rounded-[14px] bg-paper-2 border border-ink/15 text-ink text-sm font-medium cursor-not-allowed select-none"
                    />
                    <p className="text-[11px] text-ink-soft">Pass will be cryptographically bound to this campus address.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field
                    id="phone"
                    name="phone"
                    label="Phone Number"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={formErrors.phone}
                  />

                  <Field
                    id="regNumber"
                    name="regNumber"
                    label="Student Reg. No."
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                  />

                  <Field
                    id="branch"
                    name="branch"
                    label="Academic Branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    size="default"
                    onClick={handleNextStep}
                  >
                    Continue to Details
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Team registration & questionnaire (F-02) */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {isTeamEvent && (
                  <div className="space-y-4 p-5 rounded-[16px] bg-paper border border-ink/10">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-ink">Team collective roster</h3>
                        <p className="text-xs text-ink-soft">
                          Requires {minTeamSize} to {maxTeamSize} members. One digital admission pass issued per confirmed member.
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-card border border-ink/20 text-ink">
                        {teamMembers.length} / {maxTeamSize} members
                      </span>
                    </div>

                    <Field
                      id="teamName"
                      name="teamName"
                      label="Collective / Team Name"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      error={formErrors.teamName}
                    />

                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-ink-soft block">
                        Team Member Invitations
                      </label>
                      <div className="space-y-2.5">
                        {teamMembers.map((m, idx) => (
                          <div
                            key={m.id}
                            className="p-3 rounded-[12px] bg-card border border-ink/15 flex flex-wrap items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-6 h-6 rounded-full bg-paper-2 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="font-semibold text-xs text-ink truncate">{m.name} ({m.role})</p>
                                <p className="text-xs text-ink-soft font-mono truncate">{m.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                m.status === 'Joined' ? 'bg-mint/30 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {m.status}
                              </span>
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTeammate(m.id)}
                                  className="text-xs text-red-600 hover:text-red-800 p-1"
                                  title="Remove member"
                                >
                                  <Icon name="Trash" size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {teamMembers.length < maxTeamSize && (
                        <button
                          type="button"
                          onClick={handleAddTeammate}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-cobalt hover:underline pt-1"
                        >
                          <Icon name="PlusCircle" size={16} />
                          <span>+ Invite additional teammate</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Dynamic Questionnaire */}
                {event.formSchema && event.formSchema.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <h3 className="font-bold text-sm text-ink">Event questionnaire</h3>
                    <FormRenderer
                      fields={event.formSchema}
                      values={formAnswers}
                      onChange={handleDynamicChange}
                      errors={formErrors}
                    />
                  </div>
                )}

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-sm font-semibold text-ink-soft hover:text-ink"
                  >
                    ← Back to Particulars
                  </button>
                  <Button
                    type="button"
                    variant="primary"
                    size="default"
                    onClick={handleNextStep}
                  >
                    Continue to Review
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Review & Confirm */}
            {currentStep === 3 && (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="p-5 rounded-[16px] bg-paper border border-ink/10 space-y-4">
                  <h3 className="font-bold text-sm text-ink border-b border-ink/10 pb-2">
                    Registration Summary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-ink-soft block uppercase font-bold text-[10px]">Lead Attendee</span>
                      <p className="font-semibold text-ink mt-0.5">{name}</p>
                      <p className="text-ink-soft font-mono">{email}</p>
                    </div>
                    <div>
                      <span className="text-ink-soft block uppercase font-bold text-[10px]">Pass Allocation</span>
                      <p className="font-semibold text-ink mt-0.5">
                        {isTeamEvent ? `${teamName} (${teamMembers.length} passes)` : 'Individual Pass (1 pass)'}
                      </p>
                      <p className="text-ink-soft">{event.venue?.name || 'Main Campus'}</p>
                    </div>
                  </div>

                  {isTeamEvent && (
                    <div className="pt-2 border-t border-ink/10">
                      <span className="text-ink-soft block uppercase font-bold text-[10px] mb-1.5">Team Roster</span>
                      <div className="space-y-1">
                        {teamMembers.map((m, idx) => (
                          <div key={m.id} className="flex items-center justify-between text-xs">
                            <span className="text-ink font-medium">{idx + 1}. {m.name} ({m.role})</span>
                            <span className="text-ink-soft font-mono">{m.email}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms agreement checkbox */}
                <div className="flex items-start gap-3 p-3.5 rounded-[12px] bg-card border border-ink/15">
                  <input
                    type="checkbox"
                    id="conductAgreement"
                    checked={agreedToConduct}
                    onChange={(e) => setAgreedToConduct(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-ink/30 text-cobalt focus:ring-cobalt"
                  />
                  <label htmlFor="conductAgreement" className="text-xs text-ink leading-relaxed cursor-pointer">
                    I confirm that the details provided are accurate and agree to adhere to the Campus Code of Conduct and event guidelines during venue attendance.
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-sm font-semibold text-ink-soft hover:text-ink"
                  >
                    ← Back to Details
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="default"
                    loading={registerMutation.isPending}
                    disabled={!agreedToConduct}
                  >
                    Confirm & Issue Pass
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Sticky Order Summary (380px) (V-06) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-card border border-ink/15 rounded-[20px] p-6 space-y-5 shadow-sm">
              <h3 className="font-display text-lg font-bold text-ink border-b border-ink/10 pb-3">
                Order summary
              </h3>

              <div className="flex items-start gap-3.5">
                <div className="w-16 h-16 rounded-[12px] bg-paper-2 border border-ink/15 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <Icon name="Ticket" size={28} className="text-cobalt" />
                </div>
                <div className="min-w-0 flex-1">
                  <Sticker color={clubTheme.token as any} className="text-[10px] mb-1" tilt={0}>
                    {event.organizerName || 'Campus Club'}
                  </Sticker>
                  <h4 className="font-bold text-sm text-ink line-clamp-2 leading-tight">{event.title}</h4>
                </div>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-ink/10 text-xs text-ink-soft">
                <div className="flex items-center justify-between">
                  <span>Date</span>
                  <span className="font-semibold text-ink">{formatDate(event.startsAt, 'medium')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Time</span>
                  <span className="font-semibold text-ink">{formatTime(event.startsAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Venue</span>
                  <span className="font-semibold text-ink line-clamp-1 max-w-[180px]">{event.venue?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tier Selected</span>
                  <span className="font-semibold text-ink capitalize">
                    {selectedTier.replace('tier-', '')} Pass
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-ink/10 text-sm">
                  <span className="font-bold text-ink">Total fee</span>
                  <span className="font-bold text-emerald-800 font-mono">
                    {event.isFree ? 'Free' : formatCurrency(event.price || 0)}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-[12px] bg-paper border border-ink/10 space-y-1 text-[11px] text-ink-soft">
                <p className="font-semibold text-ink flex items-center gap-1">
                  <Icon name="ShieldCheck" size={13} className="text-cobalt" />
                  Campus Pass Protection
                </p>
                <p>Passes are cryptographically signed and stored in your profile badge.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}
