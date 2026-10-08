import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { Check, ArrowRight, ArrowLeft, Ticket, Calendar, ShieldCheck, ChevronRight } from 'lucide-react'
import { useEvent } from '@/hooks/useEvents'
import { useAuth } from '@/hooks/useAuth'
import { useRegister, useMyRegistrations } from '@/hooks/useRegistrations'
import { Button } from '@/design-system/primitives/Button'
import { Field } from '@/design-system/primitives/Field'
import { Stepper } from '@/design-system/primitives/Stepper'
import { QRCode } from '@/design-system/primitives/QRCode'
import { FormRenderer } from './FormRenderer'
import { formatDate, formatTime } from '@/lib/dates'
import { Registration } from '@/api'

export const RegisterPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const { data: event, isLoading } = useEvent(slug || '')
  const { session } = useAuth()
  const registerMutation = useRegister()
  const { data: myRegistrations = [] } = useMyRegistrations()

  const [step, setStep] = useState(0) // 0: Details, 1: Review, 2: Confirmation
  const [createdRegistration, setCreatedRegistration] = useState<Registration | null>(null)

  // Basic attendee details
  const [name, setName] = useState(session?.name || 'Aditya Narayan')
  const [email, setEmail] = useState(session?.email || 'attendee@example.com')
  const [phone, setPhone] = useState('+91 98450 11223')

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
      <div className="min-h-screen bg-canvas flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-md-primary border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-500">
            Loading Registration...
          </span>
        </div>
      </div>
    )
  }

  // Duplicate registration check
  const alreadyRegistered = myRegistrations.some((r) => r.eventId === event.id)

  const steps = [
    { id: 'details', label: 'Attendee Details' },
    { id: 'review', label: 'Review & Verify' },
    { id: 'confirmation', label: 'Digital Pass' },
  ]

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

  const handleNextToReview = (e: React.FormEvent) => {
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

    if (event.features.team && !teamName.trim()) {
      errors.teamName = 'Team name is required'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmitRegistration = async () => {
    try {
      const payload = {
        eventId: event.id,
        answers: formAnswers,
        team: event.features.team
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
      setStep(2)
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Registration failed:', err)
    }
  }

  return (
    <div className="w-full bg-[#EEF2F6] text-slate-800 min-h-screen py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/events/${event.slug}`} className="hover:text-indigo-600 transition-colors">
            {event.title}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-800 font-bold">Registration</span>
        </div>

        {/* Event Header Banner Card */}
        <div className="rounded-3xl border border-white/80 bg-[#EEF2F6] p-6 sm:p-8 mb-8 shadow-neo-card">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="h-2.5 w-2.5 rounded-full shadow-xs"
              style={{ backgroundColor: event.organizerColor || '#6366F1' }}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              {event.organizerName}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {event.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
            {formatDate(event.startsAt)} · {formatTime(event.startsAt)} · {event.venue.name}
          </p>
        </div>

        {/* Multi-step progress indicator */}
        <div className="mb-8">
          <Stepper steps={steps} currentStep={step} />
        </div>

        {/* Warning if already registered */}
        {alreadyRegistered && step === 0 && (
          <div className="p-4 rounded-2xl border border-amber-200 bg-[#EEF2F6] shadow-neo-sm mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-amber-700">
                Notice: Existing Pass Detected
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                You already hold a registration pass for this event.
              </p>
            </div>
            <Link to="/attendee/dashboard">
              <Button size="sm" variant="secondary">
                View My Pass
              </Button>
            </Link>
          </div>
        )}

        {/* STEP 0: ATTENDEE DETAILS & DYNAMIC FORM */}
        {step === 0 && (
          <form onSubmit={handleNextToReview} className="space-y-6 rounded-3xl bg-[#EEF2F6] border border-white/80 p-6 sm:p-8 shadow-neo-card">
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-1">
                Attendee Details
              </h3>
              <p className="text-xs text-slate-500">
                Contact information for your verified digital ticket pass and completion certificate.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Full Legal Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={formErrors.name}
              />
              <Field
                type="email"
                label="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={formErrors.email}
              />
            </div>

            <Field
              type="tel"
              label="Contact Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            {/* Team Registration block if enabled */}
            {event.features.team && (
              <div className="border-t border-slate-200/60 pt-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Team Collective Details
                </h4>
                <Field
                  label="Team Name"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  error={formErrors.teamName}
                  placeholder="e.g. Distributed Core Team"
                />

                <div className="space-y-3">
                  <span className="text-xs text-slate-500 font-medium block">
                    Additional Teammates (Optional)
                  </span>
                  {teamMembers.map((m, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field
                        placeholder={`Member ${idx + 2} Name`}
                        value={m.name}
                        onChange={(e) => {
                          const copy = [...teamMembers]
                          copy[idx].name = e.target.value
                          setTeamMembers(copy)
                        }}
                      />
                      <Field
                        type="email"
                        placeholder={`Member ${idx + 2} Email`}
                        value={m.email}
                        onChange={(e) => {
                          const copy = [...teamMembers]
                          copy[idx].email = e.target.value
                          setTeamMembers(copy)
                        }}
                      />
                    </div>
                  ))}
                  {teamMembers.length < (event.teamConfig?.maxSize || 4) - 1 && (
                    <button
                      type="button"
                      onClick={() => setTeamMembers([...teamMembers, { name: '', email: '' }])}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      + Add another team member
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Event Specific Dynamic Form Questions */}
            {event.formSchema && event.formSchema.length > 0 && (
              <div className="border-t border-slate-200/60 pt-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Event Specific Questionnaire
                </h4>
                <FormRenderer
                  fields={event.formSchema}
                  values={formAnswers}
                  onChange={handleDynamicChange}
                  errors={formErrors}
                />
              </div>
            )}

            <div className="pt-6 border-t border-slate-200/60 flex justify-end">
              <Button type="submit" size="lg" variant="primary" arrow>
                Proceed to Review
              </Button>
            </div>
          </form>
        )}

        {/* STEP 1: REVIEW & CONFIRM */}
        {step === 1 && (
          <div className="rounded-3xl bg-[#EEF2F6] border border-white/80 p-6 sm:p-8 shadow-neo-card space-y-6">
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-1">
                Review Registration Details
              </h3>
              <p className="text-xs text-slate-500">
                Please verify all entered particulars before generating your pass.
              </p>
            </div>

            <div className="border border-white/60 bg-[#EEF2F6] shadow-neo-inset rounded-2xl overflow-hidden divide-y divide-slate-200/50">
              <div className="p-4 flex justify-between text-xs sm:text-sm">
                <span className="text-slate-500">Attendee</span>
                <span className="font-bold text-slate-900">{name}</span>
              </div>
              <div className="p-4 flex justify-between text-xs sm:text-sm">
                <span className="text-slate-500">Email Address</span>
                <span className="font-bold text-slate-900">{email}</span>
              </div>
              {event.features.team && (
                <div className="p-4 flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-500">Team Name</span>
                  <span className="font-bold text-slate-900">{teamName}</span>
                </div>
              )}
              {Object.entries(formAnswers).map(([k, v]) => (
                <div key={k} className="p-4 flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-500">
                    {event.formSchema?.find((f) => f.id === k)?.label || k}
                  </span>
                  <span className="font-bold text-slate-900">{String(v)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-200/60">
              <Button variant="secondary" size="md" onClick={() => setStep(0)}>
                ← Back to Edit
              </Button>

              <Button
                variant="primary"
                size="lg"
                loading={registerMutation.isPending}
                onClick={handleSubmitRegistration}
              >
                Confirm & Issue Pass
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: CONFIRMATION WITH DIGITAL TICKET PASS */}
        {step === 2 && createdRegistration && (
          <div className="bg-[#EEF2F6] rounded-3xl border border-white/80 shadow-neo-card p-6 sm:p-10 space-y-8 text-center max-w-lg mx-auto">
            <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600 mb-1 shadow-neo-sm border border-emerald-200/60">
              <Check className="h-7 w-7" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                Registration Confirmed
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                Digital Pass Issued
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-2 font-medium">
                Pass dispatched to {createdRegistration.userEmail}. Present this digital QR pass at the entrance terminal.
              </p>
            </div>

            {/* Tactile Wallet Pass Container */}
            <div className="relative rounded-3xl border border-white/80 bg-[#EEF2F6] p-6 shadow-neo-card text-left overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: event.organizerColor || '#6366F1' }}
                  />
                  <span className="font-bold text-xs text-slate-900">
                    {event.organizerName}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-[#EEF2F6] shadow-neo-inset border border-emerald-200/60 px-2.5 py-0.5 rounded-full uppercase">
                  Verified Pass
                </span>
              </div>

              {/* Event Title & Passholder */}
              <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 leading-tight mb-2">
                {event.title}
              </h3>

              <div className="flex items-center justify-between text-xs text-slate-600 mb-4">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-bold">Attendee</span>
                  <span className="font-bold text-slate-800">{createdRegistration.userName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-slate-400 block font-bold">Venue</span>
                  <span className="font-bold text-slate-800 truncate max-w-[140px] block">{event.venue.name}</span>
                </div>
              </div>

              {/* Tear-line Notches */}
              <div className="relative border-t border-dashed border-slate-300 my-4 -mx-6 py-1">
                <div className="absolute -top-3 -left-3 h-5 w-5 rounded-full bg-[#EEF2F6] shadow-neo-inset" />
                <div className="absolute -top-3 -right-3 h-5 w-5 rounded-full bg-[#EEF2F6] shadow-neo-inset" />
              </div>

              {/* QR Code Section */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="p-4 bg-[#EEF2F6] rounded-2xl shadow-neo-inset border border-white/60">
                  <QRCode value={createdRegistration.ticketCode} size={170} />
                </div>
                <p className="font-mono text-sm font-bold tracking-widest text-slate-900 mt-3">
                  {createdRegistration.ticketCode}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5 font-bold">
                  Scan at terminal gate
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-200/60">
              <Link to="/attendee/dashboard">
                <Button variant="primary" size="md" arrow>
                  View My Wallet
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="secondary" size="md">
                  Explore More Events
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
