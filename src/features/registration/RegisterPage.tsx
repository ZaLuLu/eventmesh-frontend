import { eventPriceLabel } from '@/lib/eventPresentation'
import { ErrorState } from '@/design-system/primitives/ErrorState'
// Hallmark macrostructure: 3-Step Focused Stepper & Order Ledger
import React, { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useEvent } from '@/hooks/useEvents'
import { useAuth } from '@/hooks/useAuth'
import { useRegister, useMyRegistrations, useCancelMyRegistration, useJoinWaitlist } from '@/hooks/useRegistrations'
import { PageShell } from '@/design-system/layout/PageShell'
import { Button } from '@/design-system/primitives/Button'
import { Field } from '@/design-system/primitives/Field'
import { Badge } from '@/design-system/primitives/Badge'
import { QRCode } from '@/design-system/primitives/QRCode'
import { FormRenderer } from './FormRenderer'
import { formatDate, formatTime, formatCurrency } from '@/lib/format'
import { useQuery } from '@tanstack/react-query'
import { api, Registration, FeeQuote, RegisterPayload, normalizeBackendRegistration } from '@/api'
import { downloadICS } from '@/lib/ics'
import { useToast } from '@/design-system/primitives/Toast'
import { Icon } from '@/design-system/Icon'
import { appConfig } from '@/config/appConfig'
import { Stamp } from '@/components/stamp'
import { downloadStampedTicketAndInvoicePDF } from './downloadStampedInvoice'
import { DownloadSimple, X, Sparkle, EnvelopeSimple, Copy, Users, CheckCircle } from '@phosphor-icons/react'
import { loadCashfreeSDK } from '@/lib/cashfree'

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
  const { data: event, isLoading, error, refetch } = useEvent(slug || '')
  const { session } = useAuth()
  const registerMutation = useRegister()
  const cancelMutation = useCancelMyRegistration()
  const waitlistMutation = useJoinWaitlist()
  const { data: myRegistrations = [] } = useMyRegistrations()

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [createdRegistration, setCreatedRegistration] = useState<Registration | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [stampOverlayOpen, setStampOverlayOpen] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false)

  // Step 1: Attendee Profile (pre-filled from active session, email locked: F-01)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [regNumber, setRegNumber] = useState('')
  const [branch, setBranch] = useState('')

  useEffect(() => {
    if (session) {
      if (session.name) setName(session.name)
      if (session.email) setEmail(session.email)
      const s = session as any
      if (s.registrationNumber || s.studentId) {
        setRegNumber(s.registrationNumber || s.studentId)
      }
      if (s.degreeBranch || s.branch) {
        setBranch(s.degreeBranch || s.branch)
      }
      if (s.phone) setPhone(s.phone)

      // Query fresh profile data directly from database to ensure up-to-date fields
      api.auth.getProfile?.()
        .then((p) => {
          if (p) {
            if (p.phone) setPhone((prev) => prev || p.phone || '')
            if (p.student_id) setRegNumber((prev) => prev || p.student_id || '')
            if (p.location) setBranch((prev) => prev || p.location || '')
            if ((p as any).branch) setBranch((prev) => prev || (p as any).branch || '')
            if (p.display_name) setName((prev) => prev || p.display_name || '')

            try {
              localStorage.setItem(
                'eventmesh_student_profile',
                JSON.stringify({
                  phone: p.phone,
                  regNumber: p.student_id,
                  branch: p.location || (p as any).branch,
                  collegeName: p.institution_name,
                })
              )
            } catch {}
          }
        })
        .catch(() => {})
    } else {
      setName('')
      setEmail('')
    }

    try {
      const saved = localStorage.getItem('eventmesh_student_profile')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.regNumber) setRegNumber((prev) => prev || parsed.regNumber)
        if (parsed.branch) setBranch((prev) => prev || parsed.branch)
        if (parsed.phone) setPhone((prev) => prev || parsed.phone)
      }
    } catch {}
  }, [session])

  // Step 2: Team info (Hackathon Team Formation)
  const [teamName, setTeamName] = useState('')
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>([])
  const [teamMode, setTeamMode] = useState<'create' | 'join'>('create')
  const [joinTeamCode, setJoinTeamCode] = useState('')
  const [isVerifyingTeam, setIsVerifyingTeam] = useState(false)
  const [verifiedTeamData, setVerifiedTeamData] = useState<any>(null)
  const [generatedTeamCode] = useState(() => 'EM-TM-' + Math.random().toString(36).substring(2, 7).toUpperCase())

  // Check URL query parameters for team code
  useEffect(() => {
    const codeParam = searchParams.get('teamCode') || searchParams.get('code')
    if (codeParam) {
      setTeamMode('join')
      setJoinTeamCode(codeParam)
      if (slug) {
        setIsVerifyingTeam(true)
        api.registrations.lookupTeam?.(slug, codeParam)
          .then((res) => {
            if (res) {
              setVerifiedTeamData(res)
              setTeamName(res.team_name)
              toast({
                title: 'Team Found!',
                message: `Joined ${res.team_name} led by ${res.leader_name}.`,
                type: 'success',
              })
            }
          })
          .catch(() => {})
          .finally(() => setIsVerifyingTeam(false))
      }
    }
  }, [searchParams, slug])

  // Initialize team members if team event
  useEffect(() => {
    if (event?.features?.team && teamMembers.length === 0) {
      const leadMember: TeamMemberItem = {
        id: 'mem-lead',
        name: name || session?.name || '',
        email: email || session?.email || '',
        role: 'Team Lead',
        status: 'Joined',
      }
      setTeamMembers([leadMember])
    }
  }, [event, name, email, session, teamMembers.length])

  const handleVerifyTeam = async () => {
    if (!joinTeamCode.trim()) {
      setFormErrors((prev) => ({ ...prev, joinTeamCode: 'Enter a valid team join code' }))
      return
    }
    setIsVerifyingTeam(true)
    setFormErrors((prev) => {
      const copy = { ...prev }
      delete copy.joinTeamCode
      return copy
    })
    try {
      const res = await api.registrations.lookupTeam?.(slug || event?.slug || '', joinTeamCode.trim())
      if (res) {
        setVerifiedTeamData(res)
        setTeamName(res.team_name)
        toast({
          title: 'Team verified!',
          message: `Ready to join ${res.team_name} (Leader: ${res.leader_name}).`,
          type: 'success',
        })
      }
    } catch (err: any) {
      setVerifiedTeamData(null)
      setFormErrors((prev) => ({
        ...prev,
        joinTeamCode: err?.message || 'Team not found with this code. Check spelling.',
      }))
      toast({
        title: 'Team not found',
        message: 'Could not locate a team with that code for this event.',
        type: 'error',
      })
    } finally {
      setIsVerifyingTeam(false)
    }
  }

  // Dynamic Questionnaire answers
  const [formAnswers, setFormAnswers] = useState<Record<string, any>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [agreedToConduct, setAgreedToConduct] = useState(true)

  // Profile Onboarding Gate (FastAPI Backend requirement)
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [onboardingData, setOnboardingData] = useState({
    collegeName: '',
    branch: '',
    graduationYear: new Date().getFullYear(),
    phone: '',
  })
  const [isOnboardingSubmitting, setIsOnboardingSubmitting] = useState(false)

  const isPaidEvent = Boolean(event && !event.isFree && event.price && event.price > 0)
  const baseAmountCents = isPaidEvent && event?.price ? Math.round(event.price * 100) : 0

  const { data: feeQuote } = useQuery<FeeQuote | null>({
    queryKey: ['fee-quote', baseAmountCents],
    queryFn: () => (isPaidEvent && baseAmountCents > 0 ? api.payments.getFeeQuote(baseAmountCents) : null),
    enabled: isPaidEvent && baseAmountCents > 0,
  })

  // Listen for redirected return orders from bank 3D-Secure payment flow (?order_id=...)
  useEffect(() => {
    const orderIdParam = searchParams.get('order_id')
    if (!orderIdParam || createdRegistration || isVerifyingPayment) return

    let cancelled = false
    void (async () => {
      try {
        setIsVerifyingPayment(true)
        const statusRes = await api.payments.getOrderStatus(orderIdParam)
        if (!cancelled && statusRes.is_paid) {
          setCreatedRegistration(
            normalizeBackendRegistration({
              id: statusRes.order_id,
              eventId: event?.id || '',
              userId: session?.id || '',
              userEmail: email || session?.email || '',
              userName: name || session?.name || 'Attendee',
              status: 'registered',
              ticketCode: statusRes.ticket_code || `PASS-${statusRes.order_id.slice(-6)}`,
              createdAt: new Date().toISOString(),
              eventTitle: event?.title,
              eventSlug: event?.slug,
              organizerName: event?.organizerName,
              venueName: event?.venue?.name,
              orderId: statusRes.order_id,
              isPaid: true,
            })
          )
          setStampOverlayOpen(true)
          toast({
            title: 'Payment Verified & Ticket Emailed!',
            message: `Your registration pass and QR code have been mailed to ${email || session?.email || 'your registered email'}.`,
            type: 'success',
          })
        }
      } catch (err) {
        console.warn('Order verification failed:', err)
      } finally {
        if (!cancelled) setIsVerifyingPayment(false)
      }
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, event?.id, session?.id, createdRegistration, isVerifyingPayment])

  if (isLoading) {
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

  if (error || !event) return <PageShell className="py-12"><ErrorState title={error ? 'Event could not be loaded' : 'Event not found'} message={error ? 'Try again to load this event.' : 'This event is unavailable or could not be found.'} onRetry={error ? () => { void refetch() } : undefined} /></PageShell>

  const selectedTier = 'tier-standard'
  const isSoldOut = event.registrationState ? event.registrationState === 'full' : event.seatsLeft === 0
  const isTeamEvent = Boolean(event.features?.team)
  const isSimpleEvent = !isTeamEvent && (!event.formSchema || event.formSchema.length === 0)
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
      if (teamMode === 'join') {
        if (!joinTeamCode.trim()) {
          errs.joinTeamCode = 'Team code is required'
        } else if (!verifiedTeamData && !teamName) {
          errs.joinTeamCode = 'Please verify team code first'
        }
      } else {
        if (!teamName.trim()) errs.teamName = 'Team name is required'
        if (teamMembers.length < minTeamSize) {
          errs.teamMembers = `Team requires at least ${minTeamSize} members`
        }
        teamMembers.forEach((m, idx) => {
          if (!m.email.trim()) {
            errs[`member_${idx}_email`] = 'Campus email is required'
          }
        })
      }
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
    setTeamMembers([
      ...teamMembers,
      {
        id: `mem-${Date.now()}`,
        name: '',
        email: '',
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
    if (event.registrationState === 'closed' || event.registrationState === 'not_required') {
      toast({ title: 'Registration unavailable', message: event.registrationState === 'not_required' ? 'This event does not require registration.' : 'Registration is closed.', type: 'info' })
      return
    }

    if (!agreedToConduct) {
      toast({
        title: 'Agreement required',
        message: 'Please agree to the Campus Code of Conduct to proceed.',
        type: 'info',
      })
      return
    }

    try {
      try {
        localStorage.setItem(
          'eventmesh_student_profile',
          JSON.stringify({
            phone,
            regNumber,
            branch,
            collegeName: (event as any)?.organization?.name || (event as any)?.clubName || session?.campus || '',
          })
        )
        if (session) {
          api.auth.updateProfile?.({
            phone: phone || undefined,
            student_id: regNumber || undefined,
            location: branch || undefined,
          }).catch(() => {})
        }
      } catch {}

      const payload: RegisterPayload = {
        eventId: event.id,
        eventSlug: event.slug || slug,
        answers: {
          ...formAnswers,
          phone,
          regNumber,
          branch,
          ticketTier: selectedTier,
        },
        team: isTeamEvent
          ? {
              teamName: teamName || verifiedTeamData?.team_name || 'Hackathon Team',
              teamCode: teamMode === 'join' ? joinTeamCode.trim().toUpperCase() : generatedTeamCode,
              leaderName: teamMode === 'join' ? (verifiedTeamData?.leader_name || 'Team Lead') : name,
              leaderEmail: teamMode === 'join' ? (verifiedTeamData?.members?.[0]?.email || '') : email,
              role: teamMode === 'join' ? 'Member' : 'Team Lead',
              members:
                teamMode === 'join' && verifiedTeamData
                  ? verifiedTeamData.members.map((m: any) => ({
                      name: m.name,
                      email: m.email || '',
                      role: m.role || 'Member',
                    }))
                  : teamMembers.map((m) => ({
                      name: m.name,
                      email: m.email,
                      role: m.role,
                    })),
            }
          : undefined,
      }

      if (isPaidEvent) {
        setIsProcessingPayment(true)
        try {
          const returnUrl = `${window.location.origin}/events/${event.slug}/register`
          const orderRes = await api.payments.createOrder({
            type: 'EVENT_REGISTRATION',
            event_slug: event.slug,
            event_id: event.id,
            return_url: returnUrl,
          })

          if (!orderRes.payment_session_id) {
            throw new Error('Payment session was not returned by gateway.')
          }

          toast({
            title: 'Launching Secure Checkout',
            message: 'Opening Cashfree gateway for instant payment.',
            type: 'info',
          })

          const CashfreeFactory = await loadCashfreeSDK()
          if (!CashfreeFactory) {
            throw new Error('Cashfree Payment Gateway SDK failed to initialize.')
          }

          const cashfree = CashfreeFactory({
            mode: orderRes.environment === 'production' ? 'production' : 'sandbox',
          })

          // Open Cashfree Seamless Checkout Modal
          await cashfree.checkout({
            paymentSessionId: orderRes.payment_session_id,
            redirectTarget: '_modal',
          })

          // Modal closed or payment completed — verify status with backend
          setIsVerifyingPayment(true)
          let verified = false
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              const statusRes = await api.payments.getOrderStatus(orderRes.order_id)
              if (statusRes.is_paid) {
                verified = true
                setCreatedRegistration(
                  normalizeBackendRegistration({
                    id: statusRes.order_id,
                    eventId: event.id,
                    userId: session?.id || '',
                    userEmail: email || session?.email || '',
                    userName: name || session?.name || 'Attendee',
                    status: 'registered',
                    ticketCode: statusRes.ticket_code || `PASS-${statusRes.order_id.slice(-6)}`,
                    createdAt: new Date().toISOString(),
                    eventTitle: event.title,
                    eventSlug: event.slug,
                    organizerName: event.organizerName,
                    venueName: event.venue?.name,
                    orderId: statusRes.order_id,
                    isPaid: true,
                  })
                )
                setStampOverlayOpen(true)
                window.scrollTo({ top: 0, behavior: 'smooth' })
                toast({
                  title: 'Pass Issued & Ticket Emailed!',
                  message: `Your payment was verified and your admission pass with QR code has been emailed to ${email || session?.email || 'your registered email'}.`,
                  type: 'success',
                })
                break
              }
            } catch {}
            await new Promise((r) => setTimeout(r, 1200))
          }

          if (!verified) {
            toast({
              title: 'Checkout Window Closed',
              message: 'If you completed payment, your pass will sync shortly in My Passes.',
              type: 'info',
            })
          }
        } catch (orderErr: any) {
          console.error('Paid checkout failed:', orderErr)
          const detailMsg =
            typeof orderErr?.detail === 'string'
              ? orderErr.detail
              : Array.isArray(orderErr?.detail)
              ? orderErr.detail.map((d: any) => d?.msg || d?.message || JSON.stringify(d)).join(', ')
              : orderErr?.error?.message ||
                orderErr?.message ||
                (typeof orderErr === 'string' ? orderErr : '')

          const isAuthError =
            orderErr?.status === 401 ||
            orderErr?.code === 'unauthorized' ||
            detailMsg.toLowerCase().includes('bearer token') ||
            detailMsg.toLowerCase().includes('unauthorized') ||
            detailMsg.toLowerCase().includes('sign in')

          if (isAuthError) {
            toast({
              title: 'Sign In Required',
              message: 'Please sign in or create an account to proceed with ticket checkout.',
              type: 'info',
            })
          } else if (detailMsg.toLowerCase().includes('onboarding') || orderErr?.status === 403) {
            setShowOnboardingModal(true)
            toast({
              title: 'Campus Profile Required',
              message: 'Please complete your student college details before checking out.',
              type: 'info',
            })
          } else {
            toast({
              title: 'Payment Gateway Notice',
              message: detailMsg || 'Unable to open payment gateway. Please try again.',
              type: 'error',
            })
          }
        } finally {
          setIsProcessingPayment(false)
          setIsVerifyingPayment(false)
        }
        return
      }

      // Free / Unpaid Event flow:
      const res = await registerMutation.mutateAsync(payload)
      setCreatedRegistration(res)
      setStampOverlayOpen(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      toast({
        title: 'Ticket Issued & Emailed!',
        message: `Your admission pass with QR code has been emailed to ${email || session?.email || 'your registered email'}. Check your inbox or download below.`,
        type: 'success',
      })
    } catch (err: any) {
      console.error('Registration failed:', err)
      const detailMsg =
        typeof err.detail === 'string'
          ? err.detail
          : Array.isArray(err.detail)
          ? err.detail.map((d: any) => d?.msg || d?.message || JSON.stringify(d)).join(', ')
          : err.message || ''
      if (detailMsg.toLowerCase().includes('onboarding') || err.status === 403) {
        setShowOnboardingModal(true)
        toast({
          title: 'Campus Profile Required',
          message: 'Please complete your student college details before reserving a pass.',
          type: 'info',
        })
      } else {
        toast({
          title: 'Registration failed',
          message: detailMsg || 'Unable to reserve pass. Please try again.',
          type: 'error',
        })
      }
    }
  }

  const handleSaveOnboarding = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsOnboardingSubmitting(true)
    try {
      if (api.auth.updateProfile) {
        await api.auth.updateProfile({
          institution_name: onboardingData.collegeName,
          college_name: onboardingData.collegeName,
          branch: onboardingData.branch,
          graduation_year: Number(onboardingData.graduationYear),
          phone: onboardingData.phone,
        })
      }
      setShowOnboardingModal(false)
      toast({
        title: 'Profile Saved',
        message: 'Your campus details are verified. You can now reserve your pass.',
        type: 'success',
      })
    } catch (err: any) {
      const detailMsg =
        typeof err.detail === 'string'
          ? err.detail
          : Array.isArray(err.detail)
          ? err.detail.map((d: any) => d?.msg || d?.message || JSON.stringify(d)).join(', ')
          : err.message || ''
      toast({
        title: 'Update failed',
        message: detailMsg || 'Unable to save profile.',
        type: 'error',
      })
    } finally {
      setIsOnboardingSubmitting(false)
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

  const totalAmountText = isPaidEvent && feeQuote
    ? formatCurrency(feeQuote.total_payable_inr)
    : isPaidEvent && event?.price
      ? formatCurrency(event.price)
      : 'INR 0.00 (Campus Pass)'

  const handleDownloadPdfReceipt = () => {
    if (!createdRegistration || !event) return
    downloadStampedTicketAndInvoicePDF({
      event: {
        title: event.title,
        startsAt: event.startsAt,
        venue: event.venue,
        price: event.price,
        isFree: event.isFree,
      },
      registration: createdRegistration,
      attendeeName: name || session?.name || 'Student Attendee',
      attendeeEmail: email || session?.email || '',
      totalAmountText,
      paymentDate: new Date(),
    })
    toast({
      title: 'PDF Downloaded',
      message: 'Stamped ticket and payment clearance saved.',
      type: 'success',
    })
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
            <Badge variant="success" size="sm">
              {createdRegistration.status === 'waitlisted' ? 'Waitlist Confirmed' : 'Registration Confirmed'}
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink tracking-tight">
              {createdRegistration.status === 'waitlisted' ? 'Added to Waitlist' : "You're in! Pass is ready."}
            </h1>
            <p className="text-sm text-ink-soft max-w-lg mx-auto">
              {createdRegistration.status === 'waitlisted'
                ? "Your waitlist position is reserved. You'll receive a push notification if a seat is promoted."
                : 'Your entry ticket is issued. Present this QR code to the gate volunteer for check-in scan.'}
            </p>
          </div>

          {/* Ticket Emailed Notification Card */}
          {createdRegistration.status !== 'waitlisted' && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 text-left max-w-xl mx-auto shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <EnvelopeSimple size={24} weight="duotone" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-ink">Ticket has been mailed to you!</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    SENT
                  </span>
                </div>
                <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                  We've sent your entry pass with the scannable QR code and official printable PDF ticket to{' '}
                  <strong className="text-ink font-semibold">
                    {createdRegistration.userEmail || email || session?.email || 'your email'}
                  </strong>
                  . Please check your inbox (or spam folder).
                </p>
              </div>
            </div>
          )}

          {/* Minimal Digital Pass Ticket Object */}
          <div className="bg-surface-subtle rounded-3xl p-6 sm:p-8 text-left relative overflow-hidden">
            {/* Digital Pass Status Seal */}
            <div className="absolute top-4 right-4 sm:top-5 sm:right-6 z-20">
              <div className="px-3.5 py-1.5 rounded-xl border-2 border-dashed border-mint/40 bg-mint/5 flex flex-col items-center rotate-[-6deg]">
                <span className="text-[10px] font-mono font-bold text-mint tracking-wider">
                  {isPaidEvent ? 'PAYMENT VERIFIED' : 'CAMPUS PASS ISSUED'}
                </span>
                <span className="text-[9px] font-mono text-text-3">
                  {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/20 pb-4">
              <div className="flex items-center gap-2">
                <Badge variant="neutral" size="sm">
                  {event.organizerName || event.club?.name || 'Campus Club'}
                </Badge>
                <span className="text-xs font-medium text-ink-soft">
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
                  value={JSON.stringify({
                    ticket: createdRegistration.ticketCode,
                    ticketId: createdRegistration.ticketCode,
                    code: createdRegistration.ticketCode,
                    event: event.slug || event.id,
                    eventId: event.id,
                    reg: createdRegistration.id,
                  })}
                  size={150}
                  className="rounded"
                />
                <div className="mt-2 text-center">
                  <span className="font-mono text-xs font-bold text-ink block tracking-wider">
                    {createdRegistration.ticketCode}
                  </span>
                  <span className="font-mono text-[10px] text-ink-soft uppercase tracking-wider">
                    SCAN AT GATE
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-ink/20 pt-4 flex flex-wrap items-center justify-between text-xs text-ink-soft">
              <span>Serial: #{createdRegistration.id.slice(0, 8).toUpperCase()}</span>
              <span>EventMesh Campus Pass Protocol v2</span>
            </div>
          </div>

          {/* Hackathon Team Workspace & Roster Card */}
          {isTeamEvent && (
            <div className="bg-card border border-line rounded-2xl p-5 sm:p-6 text-left space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent block">
                    Hackathon Team Workspace
                  </span>
                  <h4 className="font-display font-bold text-lg text-ink">
                    {teamName || verifiedTeamData?.team_name || 'Hackathon Team'}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-surface-subtle border border-line font-bold text-ink">
                    Code: {teamMode === 'join' ? joinTeamCode.toUpperCase() : generatedTeamCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const code = teamMode === 'join' ? joinTeamCode.toUpperCase() : generatedTeamCode
                      navigator.clipboard.writeText(code)
                      toast({ title: 'Team code copied', message: code, type: 'success' })
                    }}
                    className="p-2 rounded-xl border border-line hover:bg-surface-subtle text-ink-soft hover:text-ink transition-colors"
                    title="Copy team join code"
                  >
                    <Copy size={15} />
                  </button>
                </div>
              </div>

              {/* Shareable Invite Link */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-ink-muted block">
                  Teammate Direct Invite Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={`${window.location.origin}/events/${event.slug}/register?teamCode=${
                      teamMode === 'join' ? joinTeamCode.toUpperCase() : generatedTeamCode
                    }`}
                    className="flex-1 bg-surface-subtle border border-line rounded-input px-3 py-2 text-xs font-mono text-ink-soft select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const code = teamMode === 'join' ? joinTeamCode.toUpperCase() : generatedTeamCode
                      const link = `${window.location.origin}/events/${event.slug}/register?teamCode=${code}`
                      navigator.clipboard.writeText(link)
                      toast({
                        title: 'Team invite link copied!',
                        message: 'Send to teammates to auto-join your squad.',
                        type: 'success',
                      })
                    }}
                    className="px-3.5 py-2 bg-ink text-paper rounded-input text-xs font-semibold hover:bg-ink-soft active:scale-95 transition-transform shrink-0 flex items-center gap-1.5"
                  >
                    <Copy size={14} />
                    <span>Copy Invite Link</span>
                  </button>
                </div>
              </div>

              {/* Team Roster List */}
              <div className="space-y-2 pt-2 border-t border-line">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink flex items-center gap-1.5">
                    <Users size={14} className="text-accent" />
                    <span>Confirmed Team Roster</span>
                  </span>
                  <span className="font-mono text-ink-muted text-[11px]">
                    {teamMode === 'join' && verifiedTeamData
                      ? `${verifiedTeamData.members.length + 1} / ${maxTeamSize} members`
                      : `${teamMembers.length} / ${maxTeamSize} members`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(teamMode === 'join' && verifiedTeamData
                    ? [
                        ...verifiedTeamData.members,
                        { name: name || 'You', email: email || '', role: 'Member', status: 'Joined' },
                      ]
                    : teamMembers
                  ).map((m: any, idx: number) => (
                    <div
                      key={m.id || idx}
                      className="p-3 rounded-xl border border-line bg-surface flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-ink truncate">{m.name || 'Teammate'}</p>
                        <p className="text-[11px] font-mono text-ink-soft truncate">{m.email}</p>
                      </div>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-surface-subtle text-ink-muted shrink-0">
                        {m.role || (idx === 0 ? 'Team Lead' : 'Member')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadPdfReceipt}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-accent text-white font-bold text-sm hover:bg-accent/90 transition-all shadow-md active:scale-95"
            >
              <DownloadSimple size={16} weight="bold" />
              <span>Save Stamped Ticket & Invoice (PDF)</span>
            </button>
            <Button
              variant="secondary"
              size="default"
              onClick={() => setStampOverlayOpen(true)}
              className="w-full sm:w-auto font-mono text-xs flex items-center gap-1.5"
            >
              <Sparkle size={15} weight="bold" className="text-accent" />
              <span>Inspect 3D Desk Stamp</span>
            </Button>
            <Link to="/attendee/dashboard" className="w-full sm:w-auto">
              <Button variant="secondary" size="default">
                View in My Tickets
              </Button>
            </Link>
            <button
              type="button"
              onClick={handleDownloadCalendar}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-card border border-ink/20 text-ink font-semibold text-xs hover:bg-paper-2 transition-colors"
            >
              <Icon name="CalendarPlus" size={15} />
              <span>Add to calendar (.ics)</span>
            </button>
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
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-soft block font-mono">
                    {isSimpleEvent ? (isPaidEvent ? 'Fast Checkout' : 'Fast Admission') : `Step ${currentStep} of 3`}
                  </span>
                  <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
                    {isSimpleEvent
                      ? (isPaidEvent ? 'Confirm details & proceed to payment' : 'Confirm details & claim pass')
                      : currentStep === 1
                      ? 'Your particulars'
                      : currentStep === 2
                      ? isTeamEvent
                        ? 'Team collective & questionnaire'
                        : 'Session questions'
                      : 'Review & confirm pass'}
                  </h1>
                </div>
                <Badge variant="neutral" size="sm">
                  {event.organizerName || 'Campus'}
                </Badge>
              </div>

              {/* Step indicator progress bar (only when multi-step) */}
              {!isSimpleEvent && (
                <div className="grid grid-cols-3 gap-2">
                  <div className={`h-1.5 rounded-full transition-colors ${currentStep >= 1 ? 'bg-cobalt' : 'bg-paper-2'}`} />
                  <div className={`h-1.5 rounded-full transition-colors ${currentStep >= 2 ? 'bg-cobalt' : 'bg-paper-2'}`} />
                  <div className={`h-1.5 rounded-full transition-colors ${currentStep === 3 ? 'bg-cobalt' : 'bg-paper-2'}`} />
                </div>
              )}
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
                    <span>Logged in as <strong>{session?.name || 'your account'}</strong></span>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-card border border-ink/15 font-semibold text-ink">
                    Signed in
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
                    <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-ink-soft flex items-center justify-between">
                      <span>Email address</span>
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
                    <p className="text-[11px] text-ink-soft">Your ticket will use the email address on your account.</p>
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

                <div className="pt-4 flex items-center justify-between gap-3 flex-wrap">
                  {isSimpleEvent ? (
                    <>
                      {isPaidEvent ? (
                        <div className="flex items-center gap-2 text-xs text-accent font-mono">
                          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                          <span>
                            {feeQuote ? formatCurrency(feeQuote.total_payable_inr) : formatCurrency(event.price || 0)} Total · Cashfree Secured
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Free student admission · Instant QR pass</span>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="primary"
                        size="default"
                        loading={isProcessingPayment || isVerifyingPayment || registerMutation.isPending}
                        onClick={(e) => {
                          if (validateStep1()) {
                            handleFormSubmit(e as any)
                          }
                        }}
                        className="bg-ink hover:bg-accent text-paper font-semibold shadow-sm"
                      >
                        {isPaidEvent
                          ? `Proceed to Payment (${feeQuote ? formatCurrency(feeQuote.total_payable_inr) : formatCurrency(event.price || 0)}) →`
                          : 'Claim Free Campus Pass →'}
                      </Button>
                    </>
                  ) : (
                    <div className="ml-auto">
                      <Button
                        type="button"
                        variant="primary"
                        size="default"
                        onClick={handleNextStep}
                      >
                        Continue to Details
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: Team registration & questionnaire (F-02) */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {isTeamEvent && (
                  <div className="space-y-5 p-5 rounded-[16px] bg-paper border border-ink/10">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-3">
                      <div>
                        <h3 className="font-bold text-sm text-ink">Hackathon Team Formation</h3>
                        <p className="text-xs text-ink-soft">
                          Requires {minTeamSize} to {maxTeamSize} members. Join an existing squad or register a new team.
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-card border border-ink/20 text-ink">
                        {teamMode === 'join' && verifiedTeamData
                          ? `${verifiedTeamData.members.length + 1} / ${maxTeamSize} members`
                          : `${teamMembers.length} / ${maxTeamSize} members`}
                      </span>
                    </div>

                    {/* Mode Selector Tabs */}
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-subtle border border-line">
                      <button
                        type="button"
                        onClick={() => {
                          setTeamMode('create')
                          setFormErrors((prev) => {
                            const copy = { ...prev }
                            delete copy.joinTeamCode
                            return copy
                          })
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          teamMode === 'create'
                            ? 'bg-card text-ink shadow-xs border border-line'
                            : 'text-ink-soft hover:text-ink'
                        }`}
                      >
                        <span>👑 Create New Team</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTeamMode('join')}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          teamMode === 'join'
                            ? 'bg-card text-ink shadow-xs border border-line'
                            : 'text-ink-soft hover:text-ink'
                        }`}
                      >
                        <span>🔗 Join Existing Team</span>
                      </button>
                    </div>

                    {teamMode === 'join' ? (
                      /* JOIN TEAM SUB-FLOW */
                      <div className="space-y-4 pt-1">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-ink-soft block">
                            Team Join Code
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={joinTeamCode}
                              onChange={(e) => {
                                setJoinTeamCode(e.target.value.toUpperCase())
                                setVerifiedTeamData(null)
                              }}
                              placeholder="e.g. EM-TM-7K9P2"
                              className="flex-1 bg-card border border-ink/20 rounded-input px-3.5 py-2 text-sm font-mono text-ink uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="compact"
                              loading={isVerifyingTeam}
                              onClick={handleVerifyTeam}
                            >
                              Verify Code
                            </Button>
                          </div>
                          {formErrors.joinTeamCode && (
                            <p className="text-xs text-red-500 font-medium">{formErrors.joinTeamCode}</p>
                          )}
                        </div>

                        {/* Verified Team Info Box */}
                        {verifiedTeamData && (
                          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                <CheckCircle size={15} weight="fill" />
                                <span>Verified Team Found</span>
                              </span>
                              <span className="text-[11px] font-mono text-ink-muted">
                                {verifiedTeamData.members.length} / {verifiedTeamData.max_size} members
                              </span>
                            </div>

                            <div>
                              <p className="font-display font-bold text-base text-ink">{verifiedTeamData.team_name}</p>
                              <p className="text-xs text-ink-soft">
                                Team Captain: <strong className="text-ink">{verifiedTeamData.leader_name}</strong>
                              </p>
                            </div>

                            <div className="space-y-1 pt-1 border-t border-line/40">
                              <p className="text-[11px] font-mono uppercase text-ink-muted">Current Teammates:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {verifiedTeamData.members.map((m: any, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded bg-surface border border-line text-xs font-medium text-ink"
                                  >
                                    {m.name} ({m.role || 'Member'})
                                  </span>
                                ))}
                                <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                                  + You (Joining)
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* CREATE NEW TEAM SUB-FLOW */
                      <div className="space-y-4 pt-1">
                        <div className="p-3 rounded-xl bg-surface-subtle/80 border border-line text-xs space-y-1">
                          <p className="font-semibold text-ink flex items-center gap-1.5">
                            <span>🔑 Auto-Generated Team Code:</span>
                            <span className="font-mono text-primary font-bold">{generatedTeamCode}</span>
                          </p>
                          <p className="text-ink-soft">
                            Share this code or your invite link after registration so your teammates can join your roster.
                          </p>
                        </div>

                        <Field
                          id="teamName"
                          name="teamName"
                          label="Collective / Team Name"
                          required
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          error={formErrors.teamName}
                          placeholder="e.g. Neural Ninjas"
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
                                    <p className="font-semibold text-xs text-ink truncate">
                                      {m.name} ({m.role})
                                    </p>
                                    <p className="text-xs text-ink-soft font-mono truncate">{m.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      m.status === 'Joined'
                                        ? 'bg-mint/30 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
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
                    loading={isProcessingPayment || isVerifyingPayment || registerMutation.isPending}
                    disabled={!agreedToConduct || event.registrationState === 'closed' || event.registrationState === 'not_required'}
                  >
                    {isPaidEvent
                      ? `Proceed to Payment (${feeQuote ? formatCurrency(feeQuote.total_payable_inr) : formatCurrency(event.price || 0)}) →`
                      : 'Confirm & Issue Pass'}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Sticky Order Summary (380px) (V-06) */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-surface-subtle rounded-3xl p-6 space-y-5">
              <h3 className="font-display text-base font-medium text-ink border-b border-line/20 pb-3">
                Order summary
              </h3>

              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-surface overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <Icon name="Ticket" size={24} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <Badge variant="neutral" size="sm" className="text-[10px] mb-1">
                    {event.organizerName || 'Campus Club'}
                  </Badge>
                  <h4 className="font-medium text-sm text-ink line-clamp-2 leading-tight">{event.title}</h4>
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
                    Event pass
                  </span>
                </div>
                {isPaidEvent && feeQuote ? (
                  <div className="pt-3 border-t border-ink/10 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-ink-soft">
                      <span>Base ticket price</span>
                      <span className="font-semibold text-ink font-mono">{formatCurrency(feeQuote.base_amount_inr)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-ink-soft">
                      <span>Platform & convenience fee ({feeQuote.attendee_fee_rate}%)</span>
                      <span className="font-medium text-ink font-mono">+{formatCurrency(feeQuote.platform_fee_inr)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-ink/10 text-sm">
                      <span className="font-bold text-ink">Total payable</span>
                      <span className="font-bold text-accent font-mono text-base">
                        {formatCurrency(feeQuote.total_payable_inr)}
                      </span>
                    </div>
                    <p className="text-[10px] text-ink-soft font-mono flex items-center gap-1.5 pt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      <span>Cashfree Split Marketplace PG Secured</span>
                    </p>
                    <div className="pt-2 flex items-center gap-1.5 text-[10px] font-mono text-ink-soft flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-paper border border-ink/10 font-medium">UPI</span>
                      <span className="px-1.5 py-0.5 rounded bg-paper border border-ink/10 font-medium">PhonePe</span>
                      <span className="px-1.5 py-0.5 rounded bg-paper border border-ink/10 font-medium">GPay</span>
                      <span className="px-1.5 py-0.5 rounded bg-paper border border-ink/10 font-medium">Cards</span>
                      <span className="px-1.5 py-0.5 rounded bg-paper border border-ink/10 font-medium">NetBanking</span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-ink/10 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-ink">Listed event price</span>
                      <span className="font-bold text-emerald-800 font-mono">
                        {eventPriceLabel(event)}
                      </span>
                    </div>
                    <p className="text-xs text-ink-soft">Additional fees are not specified in this event record.</p>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-[12px] bg-paper border border-ink/10 space-y-1 text-[11px] text-ink-soft">
                <p className="font-semibold text-ink flex items-center gap-1">
                  <Icon name="ShieldCheck" size={13} className="text-cobalt" />
                  Digital pass
                </p>
                <p>Confirmed passes appear in My Passes.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Modal Gate (Required for FastAPI Backend Registration) */}
      {showOnboardingModal && (
        <div className="fixed inset-0 bg-ink/75 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-line rounded-panel p-6 sm:p-8 max-w-md w-full shadow-sm space-y-5 select-none relative animate-in fade-in zoom-in-95 duration-150">
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                Collegiate Requirement
              </span>
              <h2 className="font-display text-2xl font-bold text-ink">
                Complete campus onboarding
              </h2>
              <p className="text-xs text-ink-soft">
                To reserve verified seats, the campus registry requires your academic institution and branch details.
              </p>
            </div>

            <form onSubmit={handleSaveOnboarding} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  College / Institute Name
                </label>
                <input
                  type="text"
                  required
                  value={onboardingData.collegeName}
                  onChange={(e) => setOnboardingData({ ...onboardingData, collegeName: e.target.value })}
                  className="w-full bg-paper border border-line rounded-lg px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
                  placeholder="Apex Institute of Technology"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Branch / Major
                  </label>
                  <input
                    type="text"
                    required
                    value={onboardingData.branch}
                    onChange={(e) => setOnboardingData({ ...onboardingData, branch: e.target.value })}
                    className="w-full bg-paper border border-line rounded-lg px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
                    placeholder="Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    required
                    value={onboardingData.graduationYear}
                    onChange={(e) => setOnboardingData({ ...onboardingData, graduationYear: Number(e.target.value) })}
                    className="w-full bg-paper border border-line rounded-lg px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
                    placeholder="2027"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={onboardingData.phone}
                  onChange={(e) => setOnboardingData({ ...onboardingData, phone: e.target.value })}
                  className="w-full bg-paper border border-line rounded-lg px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowOnboardingModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-ink-soft hover:text-ink hover:bg-surface-subtle transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOnboardingSubmitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-ink text-paper hover:bg-accent hover:text-white transition-colors active:scale-[0.98] disabled:opacity-50"
                >
                  {isOnboardingSubmitting ? 'Verifying...' : 'Save & Reserve Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3D DESK STAMP PAYMENT CLEARANCE MODAL */}
      {stampOverlayOpen && createdRegistration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto select-none animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="3D Payment Clearance Stamp"
        >
          <div className="relative w-full max-w-[1020px] bg-card border border-line rounded-3xl p-4 sm:p-6 shadow-2xl my-auto flex flex-col gap-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-accent/10 text-accent font-bold font-mono text-xs flex items-center justify-center border border-accent/20">
                  <Sparkle weight="bold" size={16} />
                </span>
                <div>
                  <h3 className="font-display font-bold text-base text-ink flex items-center gap-2">
                    <span>EventMesh 3D Desk Stamp</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-mint/20 text-emerald-600 dark:text-emerald-400 font-semibold border border-mint/40">
                      Payment Clearance
                    </span>
                  </h3>
                  <p className="text-xs text-ink-soft">
                    Auto-synchronized date wheels. Mechanical imprint of EventMesh payment clearance.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdfReceipt}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-line bg-surface hover:bg-surface-subtle text-xs font-mono font-medium text-ink transition-colors shadow-xs hover:border-accent/40"
                >
                  <DownloadSimple size={14} weight="bold" className="text-accent" />
                  <span>Download Stamped PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStampOverlayOpen(false)}
                  className="p-1.5 rounded-full text-ink-soft hover:text-ink hover:bg-surface-subtle transition-colors"
                  aria-label="Close desk stamp"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
            </div>

            {/* Stamp Stage with real dimensions and auto-stamp trigger */}
            <div className="w-full flex justify-center py-2 overflow-hidden">
              <Stamp
                autoStamp={true}
                defaultDate={new Date()}
                defaultStatus="paid"
                defaultInk="red"
                motion="cinematic"
                sound={true}
                invoices={[
                  {
                    id: `INV-${createdRegistration.id.slice(0, 8).toUpperCase()}`,
                    client: name || session?.name || 'Student Passholder',
                    total: isPaidEvent && feeQuote
                      ? formatCurrency(feeQuote.total_payable_inr)
                      : isPaidEvent && event.price
                        ? formatCurrency(event.price)
                        : 'INR 0.00 (Campus Pass)',
                    issued: new Date().toLocaleDateString('en-GB'),
                    due: new Date().toLocaleDateString('en-GB'),
                    lines: [
                      {
                        description: `${event.title} - Admission Pass`,
                        quantity: '1',
                        unitPrice: isPaidEvent && event.price ? formatCurrency(event.price) : 'INR 0',
                        total: isPaidEvent && event.price ? formatCurrency(event.price) : 'INR 0',
                      },
                      ...(isPaidEvent && feeQuote
                        ? [
                            {
                              description: `Platform & Convenience Fee (${feeQuote.attendee_fee_rate}%)`,
                              quantity: '1',
                              unitPrice: formatCurrency(feeQuote.platform_fee_inr),
                              total: formatCurrency(feeQuote.platform_fee_inr),
                            },
                          ]
                        : []),
                    ],
                  },
                ]}
                onStamp={(result) => {
                  toast({
                    title: 'Clearance Stamped!',
                    message: `Official EventMesh mark printed for ${event.title}.`,
                    type: 'success',
                  })
                }}
              />
            </div>
          </div>
        </div>
      )}

    </PageShell>
  )
}
