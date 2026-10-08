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

        {/* STEP 2: CONFIRMATION WITH QR TICKET */}
        {step === 2 && createdRegistration && (
          <div className="bg-paper border-2 border-ink p-6 sm:p-10 space-y-8 text-center">
            <div className="inline-flex p-3 bg-emerald-600 text-paper mb-2">
              <Check className="h-6 w-6" />
            </div>

            <div>
              <span className="font-mono text-xs uppercase tracking-wide text-emerald-800 font-bold block mb-1">
                Registration Confirmed
              </span>
              <h2 className="font-display text-3xl sm:text-4xl uppercase text-ink">
                Access Pass Issued
              </h2>
              <p className="font-body text-sm text-ink-60 max-w-md mx-auto mt-2">
                A confirmation dispatch has been logged for {createdRegistration.userEmail}. Present this QR pass at the check-in desk on arrival.
              </p>
            </div>

            {/* Crisp Square QR Pass Card */}
            <div className="max-w-xs mx-auto border-2 border-ink p-6 bg-paper-deep/20 space-y-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-60 block">
                TICKET IDENTIFIER
              </span>
              <p className="font-mono text-2xl font-bold tracking-wider text-ink">
                {createdRegistration.ticketCode}
              </p>

              <div className="flex justify-center py-2">
                <QRCode value={createdRegistration.ticketCode} size={180} />
              </div>

              <div className="border-t border-ink-15 pt-3 font-mono text-[11px] uppercase text-ink">
                <p className="font-bold">{createdRegistration.userName}</p>
                <p className="text-ink-60">{event.venue.name}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-ink-15">
              <Link to="/me">
                <Button size="md" arrow>
                  View in My Passes
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="secondary" size="md">
                  Continue Browsing
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
