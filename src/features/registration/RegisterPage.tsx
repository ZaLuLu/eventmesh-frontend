import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { Check, ArrowRight, ArrowLeft, Ticket, Calendar, ShieldCheck } from 'lucide-react'
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
      <div className="min-h-screen bg-paper flex items-center justify-center p-8">
        <span className="font-mono text-xs uppercase tracking-widecaps text-ink-60">
          Preparing Registration Dossier...
        </span>
      </div>
    )
  }

  // Duplicate registration check
  const alreadyRegistered = myRegistrations.some((r) => r.eventId === event.id)

  const steps = [
    { id: 'details', label: 'Particulars' },
    { id: 'review', label: 'Review & Verify' },
    { id: 'confirmation', label: 'Access Pass' },
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

    // Validate required fields in dynamic form
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
    <div className="w-full bg-paper text-ink min-h-screen py-10 sm:py-16">
      <div className="px-[4vw] max-w-3xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 font-mono text-xs uppercase text-ink-60">
          <Link to={`/events/${event.slug}`} className="hover:text-ink">
            ← Back to Event Dossier
          </Link>
          <span>/</span>
          <span>Registration</span>
        </div>

        {/* Event Header Banner */}
        <div className="border-2 border-ink p-6 mb-8 bg-paper">
          <span className="font-mono text-[10px] uppercase tracking-widecaps text-ink-60 block mb-1">
            Official Registration Portal · {event.organizerName}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink">
            {event.title}
          </h1>
          <p className="font-mono text-xs text-ink-60 uppercase mt-2">
            {formatDate(event.startsAt)} · {formatTime(event.startsAt)} · {event.venue.name}
          </p>
        </div>

        {/* Multi-step progress indicator */}
        <div className="mb-10">
          <Stepper steps={steps} currentStep={step} />
        </div>

        {/* Warning if already registered */}
        {alreadyRegistered && step === 0 && (
          <div className="p-4 border-2 border-ink bg-paper-deep/60 mb-6 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase text-ink">
                Notice: Existing Pass Detected
              </p>
              <p className="font-body text-xs text-ink-60 mt-0.5">
                You already possess a verified registration pass for this exhibition.
              </p>
            </div>
            <Link to="/me">
              <Button size="sm" variant="secondary">
                View My Pass
              </Button>
            </Link>
          </div>
        )}

        {/* STEP 0: PARTICULARS & DYNAMIC FORM */}
        {step === 0 && (
          <form onSubmit={handleNextToReview} className="space-y-8 bg-paper border border-ink-15 p-6 sm:p-8">
            <div>
              <h3 className="font-display text-2xl uppercase text-ink mb-1">
                1. Attendee Particulars
              </h3>
              <p className="font-body text-xs text-ink-60">
                Primary contact details for digital pass dispatch and cryptographic certificate issuance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              <div className="border-t border-ink-15 pt-6 space-y-4">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wide text-ink">
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
                  <span className="font-mono text-[11px] uppercase tracking-wide text-ink-60 block">
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
                      className="font-mono text-[11px] uppercase text-ink underline"
                    >
                      + Add another team member
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Event Specific Dynamic Form Questions */}
            {event.formSchema && event.formSchema.length > 0 && (
              <div className="border-t border-ink-15 pt-6 space-y-4">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wide text-ink">
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

            <div className="pt-6 border-t border-ink-15 flex justify-end">
              <Button type="submit" size="lg" arrow>
                Proceed to Review
              </Button>
            </div>
          </form>
        )}

        {/* STEP 1: REVIEW & CONFIRM */}
        {step === 1 && (
          <div className="bg-paper border border-ink-15 p-6 sm:p-8 space-y-8">
            <div>
              <h3 className="font-display text-2xl uppercase text-ink mb-1">
                2. Review Registration Particulars
              </h3>
              <p className="font-body text-xs text-ink-60">
                Please verify all entered details before generating your access pass.
              </p>
            </div>

            <div className="border border-ink-15 divide-y divide-ink-15">
              <div className="p-4 flex justify-between">
                <span className="font-mono text-xs uppercase text-ink-60">Attendee</span>
                <span className="font-body text-sm font-semibold text-ink">{name}</span>
              </div>
              <div className="p-4 flex justify-between">
                <span className="font-mono text-xs uppercase text-ink-60">Dispatched To</span>
                <span className="font-body text-sm font-semibold text-ink">{email}</span>
              </div>
              {event.features.team && (
                <div className="p-4 flex justify-between">
                  <span className="font-mono text-xs uppercase text-ink-60">Team</span>
                  <span className="font-body text-sm font-semibold text-ink">{teamName}</span>
                </div>
              )}
              {Object.entries(formAnswers).map(([k, v]) => (
                <div key={k} className="p-4 flex justify-between">
                  <span className="font-mono text-xs uppercase text-ink-60">
                    {event.formSchema?.find((f) => f.id === k)?.label || k}
                  </span>
                  <span className="font-body text-sm font-semibold text-ink">{String(v)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-ink-15">
              <Button variant="secondary" size="md" onClick={() => setStep(0)}>
                ← Back to Edit
              </Button>

              <Button
                size="lg"
                loading={registerMutation.isPending}
                onClick={handleSubmitRegistration}
              >
                Confirm & Issue Pass
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: CONFIRMATION WITH DIGITAL TICKET PASS (District / Apple Wallet) */}
        {step === 2 && createdRegistration && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-10 space-y-8 text-center max-w-lg mx-auto">
            <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600 mb-1 shadow-sm">
              <Check className="h-7 w-7" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                Registration Confirmed
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                Digital Pass Issued
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-2 font-medium">
                Pass dispatched for {createdRegistration.userEmail}. Present this digital QR code at the gate terminal.
              </p>
            </div>

            {/* Apple Wallet / District Boarding Pass Container */}
            <div className="relative rounded-2xl border-2 border-slate-900 bg-gradient-to-b from-white to-slate-50 p-6 shadow-xl text-left overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: event.organizerColor || '#2563EB' }}
                  />
                  <span className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                    {event.organizerName}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                  Verified Pass
                </span>
              </div>

              {/* Event Title & Passholder */}
              <h3 className="font-display font-extrabold text-lg text-slate-900 leading-tight mb-2">
                {event.title}
              </h3>

              <div className="flex items-center justify-between text-xs text-slate-600 mb-4">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-bold">Attendee</span>
                  <span className="font-bold text-slate-800">{createdRegistration.userName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-slate-400 block font-bold">Venue</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[140px] block">{event.venue.name}</span>
                </div>
              </div>

              {/* Tear-line Notches */}
              <div className="relative border-t-2 border-dashed border-slate-300 my-4 -mx-6 py-1">
                <div className="absolute -top-3.5 -left-3.5 h-6 w-6 rounded-full bg-white border border-slate-300" />
                <div className="absolute -top-3.5 -right-3.5 h-6 w-6 rounded-full bg-white border border-slate-300" />
              </div>

              {/* QR Code Section */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <QRCode value={createdRegistration.ticketCode} size={170} />
                </div>
                <p className="font-mono text-sm font-bold tracking-widest text-slate-900 mt-3">
                  {createdRegistration.ticketCode}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                  Scan at terminal gate
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
              <Link to="/attendee/dashboard">
                <Button variant="gradient" size="md" arrow>
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
