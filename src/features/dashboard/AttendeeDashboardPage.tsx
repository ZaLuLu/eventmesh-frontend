import React, { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Ticket,
  Certificate as CertificateIcon,
  DownloadSimple,
  Copy,
  IdentificationCard,
  CalendarBlank,
  PencilSimple,
  ClockCounterClockwise,
  User,
  QrCode,
  MapPin,
  Chair,
  FolderSimple,
  Sparkle,
  Check,
} from '@phosphor-icons/react'
import { useMyRegistrations, useCancelRegistration, useUpdateRegistrationStatus } from '@/hooks/useRegistrations'
import { useMyCertificates } from '@/hooks/useCertificates'
import { useEvents } from '@/hooks/useEvents'
import { useAuth } from '@/hooks/useAuth'
import { PageShell } from '@/design-system/layout/PageShell'
import { Button } from '@/design-system/primitives/Button'
import { formatDate } from '@/lib/dates'
import { Registration, Certificate } from '@/api'
import { useToast } from '@/design-system/primitives/Toast'
import { fireCelebrationConfetti } from '@/lib/confetti'
import { EventAdmissionTicket } from '@/design-system/micro/EventAdmissionTicket'
import { StudentIDCard2D } from '@/design-system/3d/StudentIDCard2D'
import { OnboardingModal, OnboardingData } from '@/features/onboarding/OnboardingModal'
import { PlanSelectorSection } from '@/features/pricing/PlanSelectorSection'
import { AvatarSelectorModal } from './components/AvatarSelectorModal'
import { ProfileDetailsModal } from './components/ProfileDetailsModal'
import { resolveUserAvatar } from '@/lib/avatars'
import { Modal } from '@/design-system/primitives/Modal'
import { getUserScheduleWebCalUrl, getUserScheduleIcsUrl, downloadICS } from '@/lib/ics'
import { SteppedTicketPocket, SteppedTicketItem } from './components/SteppedTicketPocket'

export const AttendeeDashboardPage: React.FC = () => {
  const { session } = useAuth()
  const { toast } = useToast()
  const { data: rawRegistrations = [], isLoading: regsLoading } = useMyRegistrations()
  const { data: certificates = [], isLoading: certsLoading } = useMyCertificates()
  const { data: upcomingData } = useEvents()
  const cancelMutation = useCancelRegistration()
  const updateStatusMutation = useUpdateRegistrationStatus()

  // Cache passes to localStorage so students can display tickets offline at venue gates
  useEffect(() => {
    if (rawRegistrations && rawRegistrations.length > 0) {
      try {
        localStorage.setItem('eventmesh_cached_passes', JSON.stringify(rawRegistrations))
      } catch {}
    }
  }, [rawRegistrations])

  const registrations = useMemo<Registration[]>(() => {
    if (rawRegistrations && rawRegistrations.length > 0) return rawRegistrations
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const cached = localStorage.getItem('eventmesh_cached_passes')
        if (cached) return JSON.parse(cached)
      } catch {}
    }
    return []
  }, [rawRegistrations])

  const [searchParams] = useSearchParams()
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null)
  const [mountedTicketId, setMountedTicketId] = useState<string | null>(null)
  const [viewHistoryArchive, setViewHistoryArchive] = useState(false)
  const [calendarSyncOpen, setCalendarSyncOpen] = useState(false)
  const [copiedFeed, setCopiedFeed] = useState(false)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>(() => resolveUserAvatar(session))
  const [docketCategory, setDocketCategory] = useState<'passes' | 'honors' | 'keepsakes'>('passes')
  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null)
  const [isBrightnessModalOpen, setIsBrightnessModalOpen] = useState(false)
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [isPlanSelectorOpen, setIsPlanSelectorOpen] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'industry'>('pro')
  const [customStudentData, setCustomStudentData] = useState<Partial<OnboardingData> | null>(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('eventmesh_onboarding_profile')
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return null
  })
  const [gateCountdown, setGateCountdown] = useState<string>('')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'history') {
      setViewHistoryArchive(true)
    } else if (tab === 'profile') {
      setIsProfileModalOpen(true)
    } else if (tab === 'plans' || tab === 'pricing') {
      setIsPlanSelectorOpen(true)
    }
    if (searchParams.get('onboarding') === 'true') {
      setIsOnboardingOpen(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (session) {
      setAvatarUrl(resolveUserAvatar(session))
    }
  }, [session])

  // Student Identity Data
  const studentData = useMemo(() => {
    const s = session as any
    const rawName = customStudentData?.name || s?.name || 'Suraj Naik'
    const cleanName = rawName
      .replace(/\s*\([^)]*\)/g, '')
      .trim() || 'Suraj Naik'

    return {
      name: cleanName,
      registrationNumber: customStudentData?.registrationNumber || s?.registrationNumber || s?.studentId || 'CTU-2026-0814',
      degreeBranch: customStudentData?.degreeBranch || s?.degreeBranch || s?.branch || 'Computer Science & Engineering',
      semester: customStudentData?.semester || s?.semester || 6,
      email: s?.email || 'ceosuraj@email.com',
      role: currentPlan === 'pro' ? 'PRO BUILDER' : currentPlan === 'industry' ? 'INDUSTRY PARTNER' : 'STUDENT PASSHOLDER',
      campus: customStudentData?.campus || s?.campus || s?.institutionName || 'Central Technological University (CTU)',
      bloodGroup: s?.bloodGroup || 'O+',
      emergencyPhone: s?.emergencyPhone || s?.phone,
      phone: s?.phone || '',
    }
  }, [session, customStudentData, currentPlan])

  const handleCopyRegNo = () => {
    navigator.clipboard.writeText(studentData.registrationNumber)
    toast({
      title: 'Copied ID',
      message: `${studentData.registrationNumber} copied to clipboard`,
      type: 'info',
    })
  }

  const downloadCertificatePDF = async (cert: Certificate) => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      // Warm paper background (#FAF8FF)
      doc.setFillColor(250, 248, 255)
      doc.rect(0, 0, 297, 210, 'F')

      // Double ink border
      doc.setDrawColor(18, 13, 36)
      doc.setLineWidth(1.5)
      doc.rect(12, 12, 273, 186)

      doc.setDrawColor(124, 58, 237)
      doc.setLineWidth(0.6)
      doc.rect(15, 15, 267, 180)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(78, 70, 107)
      doc.text('EVENTMESH · VERIFIABLE CAMPUS CREDENTIAL', 148.5, 36, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(28)
      doc.setTextColor(18, 13, 36)
      doc.text('CERTIFICATE OF PARTICIPATION', 148.5, 52, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(13)
      doc.setTextColor(78, 70, 107)
      doc.text('This document certifies that', 148.5, 75, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.setTextColor(124, 58, 237)
      doc.text(cert.recipientName.toUpperCase(), 148.5, 92, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(13)
      doc.setTextColor(78, 70, 107)
      doc.text('has successfully completed & attended', 148.5, 108, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(18, 13, 36)
      doc.text(cert.eventTitle.toUpperCase(), 148.5, 122, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(78, 70, 107)
      doc.text(`Organized by ${cert.organizerName}`, 148.5, 134, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(78, 70, 107)
      doc.text(
        `Certificate ID: ${cert.certificateId} · Issued ${formatDate(cert.issuedAt)} · Verified by EventMesh`,
        148.5,
        178,
        { align: 'center' }
      )

      doc.save(`${cert.certificateId}.pdf`)
      fireCelebrationConfetti()

      toast({
        title: 'Certificate downloaded',
        message: `Saved ${cert.certificateId}.pdf`,
        type: 'success',
      })
    } catch {
      toast({ title: 'Download failed', type: 'error' })
    }
  }

  // Enriched registrations hydrated with event and attendee details
  const enrichedRegistrations = useMemo(() => {
    const events = upcomingData?.items || []
    const eventsMap = new Map<string, any>()
    for (const e of events) {
      if (e.id) eventsMap.set(String(e.id), e)
      if (e.slug) eventsMap.set(String(e.slug), e)
    }

    return registrations.map((reg) => {
      const match = eventsMap.get(String(reg.eventId)) || eventsMap.get(String(reg.eventSlug))
      const resolvedUserName =
        reg.userName && reg.userName !== 'Passholder' && reg.userName !== 'Student Passholder'
          ? reg.userName
          : studentData.name || session?.name || 'Verified Attendee'

      if (!match) {
        return {
          ...reg,
          userName: resolvedUserName,
        }
      }

      return {
        ...reg,
        eventTitle:
          reg.eventTitle && reg.eventTitle !== 'Event Pass'
            ? reg.eventTitle
            : match.title || 'Event Pass',
        eventSlug: reg.eventSlug || match.slug,
        eventStartsAt: reg.eventStartsAt || match.startsAt,
        venueName:
          reg.venueName && reg.venueName !== 'Main Campus Venue'
            ? reg.venueName
            : match.venue?.name || match.location || 'Main Campus Venue',
        organizerName:
          reg.organizerName && reg.organizerName !== 'Event Host' && reg.organizerName !== 'Campus Host'
            ? reg.organizerName
            : match.clubName || match.organization?.name || 'Campus Organization',
        tierName: reg.tierName || (match.type ? match.type.toUpperCase() : 'GENERAL ADMISSION'),
        userName: resolvedUserName,
      }
    })
  }, [registrations, upcomingData, session, studentData])

  // Active Passes vs Past History
  const activePasses = useMemo(() => {
    return enrichedRegistrations.filter((r) => {
      if (r.status === 'cancelled') return false
      if (r.status === 'checked_in') return false
      if (r.eventStartsAt && new Date(r.eventStartsAt).getTime() < Date.now() - 24 * 3600 * 1000) {
        return false
      }
      return true
    })
  }, [enrichedRegistrations])

  const historyPasses = useMemo(() => {
    return enrichedRegistrations.filter((r) => {
      if (r.status === 'cancelled') return true
      if (r.status === 'checked_in') return true
      if (r.eventStartsAt && new Date(r.eventStartsAt).getTime() < Date.now() - 24 * 3600 * 1000) {
        return true
      }
      return false
    })
  }, [enrichedRegistrations])

  // Select the currently mounted ticket for the right side of the folder docket
  const mountedTicket = useMemo<Registration | null>(() => {
    if (docketCategory === 'passes') {
      if (mountedTicketId) {
        const match = activePasses.find((r) => r.id === mountedTicketId)
        if (match) return match
      }
      return activePasses[0] || null
    } else if (docketCategory === 'keepsakes') {
      if (mountedTicketId) {
        const match = historyPasses.find((r) => r.id === mountedTicketId)
        if (match) return match
      }
      return historyPasses[0] || null
    }
    return null
  }, [docketCategory, mountedTicketId, activePasses, historyPasses])

  // Select the currently mounted certificate for the honors stage
  const mountedCertificate = useMemo<Certificate | null>(() => {
    if (selectedCertificateId) {
      const match = certificates.find((c) => String(c.id || c.certificateId) === selectedCertificateId)
      if (match) return match
    }
    return certificates[0] || null
  }, [selectedCertificateId, certificates])

  // Live countdown timer for the mounted ticket (pure tabular-nums, steady update every second)
  useEffect(() => {
    if (!mountedTicket?.eventStartsAt) {
      setGateCountdown('')
      return
    }
    const updateCountdown = () => {
      const starts = new Date(mountedTicket.eventStartsAt!).getTime()
      const now = Date.now()
      const diff = starts - now
      if (diff <= 0 && diff >= -4 * 3600 * 1000) {
        setGateCountdown('GATE OPEN · IN PROGRESS')
      } else if (diff < -4 * 3600 * 1000) {
        setGateCountdown('EVENT CONCLUDED')
      } else if (diff <= 24 * 3600 * 1000) {
        const h = Math.floor(diff / (3600 * 1000))
        const m = Math.floor((diff % (3600 * 1000)) / (60 * 1000))
        const s = Math.floor((diff % (60 * 1000)) / 1000)
        setGateCountdown(`STARTS IN ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
      } else {
        const days = Math.ceil(diff / (24 * 3600 * 1000))
        setGateCountdown(`STARTS IN ${days} DAYS`)
      }
    }
    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [mountedTicket?.eventStartsAt])

  // Generate high-resolution QR data URL for the laser scanner modal
  useEffect(() => {
    if (mountedTicket) {
      const code =
        (mountedTicket as any).code ||
        (mountedTicket as any).ticketCode ||
        `EM-${String(mountedTicket.id).slice(-4).toUpperCase()}`
      import('qrcode')
        .then((QRCodeModule) => {
          const qrcode = QRCodeModule.default || QRCodeModule
          qrcode
            .toDataURL(code, { width: 320, margin: 1, color: { dark: '#000000', light: '#FFFFFF' } })
            .then(setQrDataUrl)
            .catch(() => {})
        })
        .catch(() => {})
    }
  }, [mountedTicket])

  // Stepped ticket items for the executive travel jacket sleeve
  const steppedItems = useMemo<SteppedTicketItem[]>(() => {
    if (docketCategory === 'passes') {
      return activePasses.map((p) => ({
        id: String(p.id),
        title: p.eventTitle || 'Event Pass',
        subtitle: p.venueName || 'Main Campus Venue',
        date: p.eventStartsAt ? formatDate(p.eventStartsAt).split(',')[0] : 'Upcoming',
        category: 'passes',
        status: p.tierName || 'CONFIRMED',
        code: (p as any).code || `EM-${String(p.id).slice(-4).toUpperCase()}`,
        isImminent: isImminent(p.eventStartsAt),
      }))
    } else if (docketCategory === 'keepsakes') {
      return historyPasses.map((p) => ({
        id: String(p.id),
        title: p.eventTitle || 'Past Event',
        subtitle: p.venueName || 'Main Campus Venue',
        date: p.eventStartsAt ? formatDate(p.eventStartsAt).split(',')[0] : 'Past Event',
        category: 'keepsakes',
        status: 'ADMITTED',
        code: (p as any).code || `EM-${String(p.id).slice(-4).toUpperCase()}`,
      }))
    } else {
      return certificates.map((c) => ({
        id: `cert-${c.id || c.certificateId}`,
        title: c.eventTitle || 'Verified Honor',
        subtitle: `Issued by ${c.organizerName}`,
        date: formatDate(c.issuedAt).split(',')[0],
        category: 'honors',
        status: 'VERIFIED',
        code: c.certificateId,
      }))
    }
  }, [docketCategory, activePasses, historyPasses, certificates])

  const selectedPocketId = useMemo(() => {
    if (docketCategory === 'passes') return mountedTicket?.id ? String(mountedTicket.id) : null
    if (docketCategory === 'keepsakes') return mountedTicket?.id ? String(mountedTicket.id) : null
    if (docketCategory === 'honors')
      return mountedCertificate ? `cert-${mountedCertificate.id || mountedCertificate.certificateId}` : null
    return null
  }, [docketCategory, mountedTicket, mountedCertificate])

  const handlePocketSelect = (id: string) => {
    if (id.startsWith('cert-')) {
      const certId = id.replace('cert-', '')
      setSelectedCertificateId(certId)
      toast({
        title: 'Credential Selected',
        message: 'Loaded verified certificate into the showcase stage.',
      })
    } else {
      setMountedTicketId(id)
      toast({
        title: 'Pass Selected',
        message: 'Mounted ticket onto the reading stage.',
      })
    }
  }

  // Check if an event starts within 24 hours
  const isImminent = (startsAt?: string) => {
    if (!startsAt) return false
    const time = new Date(startsAt).getTime()
    const now = Date.now()
    return time >= now && time <= now + 24 * 3600 * 1000
  }

  return (
    <PageShell className="py-6 sm:py-8 space-y-6 max-w-5xl mx-auto">
      {/* ========================================================================= */}
      {/* THE MASTER EXECUTIVE CAMPUS TRAVEL FOLIO                                  */}
      {/* ========================================================================= */}
      <div className="bg-surface border border-line rounded-3xl shadow-sm overflow-hidden flex flex-col">
        {/* Folio Top Header Bar */}
        <div className="bg-subtle/50 border-b border-line px-5 sm:px-7 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-text">
              EXECUTIVE CAMPUS TRAVEL FOLIO · {studentData.campus.toUpperCase()}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent/40 bg-accent/10 hover:bg-accent/20 text-xs font-semibold text-accent shadow-2xs transition-colors"
              title="Launch Onboarding Stepper"
            >
              <Sparkle size={14} className="text-accent" />
              <span>Setup Wizard</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPlanSelectorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-400 shadow-2xs transition-colors"
              title="Inspect PixelCard Membership Plans"
            >
              <Ticket size={14} className="text-amber-500" />
              <span>Membership Plans</span>
            </button>
            <button
              type="button"
              onClick={() => setCalendarSyncOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-surface hover:bg-subtle text-xs font-semibold text-text shadow-2xs transition-colors"
            >
              <CalendarBlank size={14} className="text-accent" />
              <span>Sync Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-surface hover:bg-subtle text-xs font-semibold text-text shadow-2xs transition-colors"
            >
              <PencilSimple size={14} className="text-text-2" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Folio Upper Compartment: The Student Identification Pass & Telemetry Ledger */}
        <div className="p-6 sm:p-7 border-b border-line bg-canvas/30 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Physical 3D Landscape Smartcard */}
          <div className="md:col-span-6 flex justify-center md:justify-start">
            <StudentIDCard2D
              name={studentData.name}
              registrationNumber={studentData.registrationNumber}
              degreeBranch={studentData.degreeBranch}
              semester={studentData.semester}
              email={studentData.email}
              role={studentData.role}
              campus={studentData.campus}
              avatarUrl={avatarUrl}
              onAvatarClick={() => setIsAvatarModalOpen(true)}
              interactive={true}
            />
          </div>

          {/* Student Status & Ledger Strip */}
          <div className="md:col-span-6 bg-surface border border-line rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-2xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Check size={13} weight="bold" />
                  <span>AUTHENTICATED PASSHOLDER</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyRegNo}
                  className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
                  title="Copy registration number"
                >
                  <Copy size={13} />
                  <span>{studentData.registrationNumber}</span>
                </button>
              </div>

              <div>
                <h2 className="text-lg font-bold text-text">{studentData.name}</h2>
                <p className="text-xs text-text-2 mt-0.5">{studentData.degreeBranch} · Sem {studentData.semester}</p>
              </div>
            </div>

            {/* Tabular Ledger Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-line text-center">
              <div className="p-2.5 rounded-xl bg-subtle/80">
                <span className="text-[10px] text-text-3 font-mono uppercase tracking-wider block">Active</span>
                <span className="text-base font-bold font-mono tabular-nums text-accent">{activePasses.length}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-subtle/80">
                <span className="text-[10px] text-text-3 font-mono uppercase tracking-wider block">Attended</span>
                <span className="text-base font-bold font-mono tabular-nums text-text">{historyPasses.length}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-subtle/80">
                <span className="text-[10px] text-text-3 font-mono uppercase tracking-wider block">Honors</span>
                <span className="text-base font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">{certificates.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Folio Main Compartment: Left Stepped Ticket Sleeve / Right Unfolded Boarding Pass Stage */}
        <div className="flex flex-col lg:flex-row items-stretch min-h-[500px]">
          {/* Left: Stepped Ticket Pocket Sleeve (First-Class Travel Jacket) */}
          <div className="w-full lg:w-[350px] bg-subtle/40 p-5 lg:border-r border-b lg:border-b-0 border-line shrink-0 flex flex-col justify-between">
            <SteppedTicketPocket
              items={steppedItems}
              selectedId={selectedPocketId}
              onSelect={handlePocketSelect}
              activeCategory={docketCategory}
              onCategoryChange={setDocketCategory}
              counts={{
                passes: activePasses.length,
                keepsakes: historyPasses.length,
                honors: certificates.length,
              }}
              onExploreClick={() => window.location.assign('/explore')}
            />
          </div>

          {/* Right: Unfolded Ticket Stage */}
          <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-line">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-2">
                  {docketCategory === 'passes'
                    ? 'Active Boarding Pass in Hand'
                    : docketCategory === 'honors'
                    ? 'Official Verified Credential'
                    : 'Commemorative Attendance Record'}
                </span>
                <span className="text-xs font-mono font-medium text-text-3">
                  {docketCategory === 'passes' && mountedTicket && (
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Gate Ready</span>
                    </span>
                  )}
                  {docketCategory === 'keepsakes' && mountedTicket && (
                    <span className="text-text-3">Archived Record</span>
                  )}
                  {docketCategory === 'honors' && mountedCertificate && (
                    <span className="text-amber-600 dark:text-amber-400 font-bold">Verifiable PDF</span>
                  )}
                </span>
              </div>

              {/* A. PASSES CATEGORY */}
              {docketCategory === 'passes' && (
                mountedTicket ? (
                  (() => {
                    const eventImminent = isImminent(mountedTicket.eventStartsAt)
                    const ticketCode =
                      (mountedTicket as any).code ||
                      (mountedTicket as any).ticketCode ||
                      `EM-${String(mountedTicket.id).slice(-4).toUpperCase()}`

                    return (
                      <div className="space-y-4">
                        <div
                          onClick={() => {
                            setSelectedTicket(mountedTicket)
                            fireCelebrationConfetti()
                          }}
                          className="relative bg-surface border border-line hover:border-line-strong rounded-2xl shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer overflow-hidden group"
                        >
                          {/* Perforation Notches */}
                          <div className="absolute -top-[11px] right-[164px] w-[22px] h-[22px] rounded-full border-b border-line bg-surface z-10" />
                          <div className="absolute -bottom-[11px] right-[164px] w-[22px] h-[22px] rounded-full border-t border-line bg-surface z-10" />

                          {/* Top Header Strip */}
                          <div
                            className={`px-6 py-2.5 flex items-center justify-between text-white text-xs font-semibold ${
                              eventImminent ? 'bg-emerald-600' : 'bg-ink'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {eventImminent && <span className="w-2 h-2 rounded-full bg-white shrink-0" />}
                              <span>
                                {eventImminent
                                  ? (gateCountdown || 'GATE READY · TODAY')
                                  : mountedTicket.eventStartsAt
                                  ? `CONFIRMED · ${formatDate(mountedTicket.eventStartsAt).split(',')[0].toUpperCase()}`
                                  : 'CONFIRMED PASS'}
                              </span>
                            </span>
                            <span className="font-mono text-[11px] uppercase opacity-90">{mountedTicket.tierName || 'GENERAL ADMISSION'}</span>
                          </div>

                          {/* Interior */}
                          <div className="p-6 flex items-stretch justify-between gap-5">
                            <div className="flex-1 space-y-3 min-w-0">
                              <div>
                                <span className="text-[11px] font-medium text-text-3 uppercase tracking-wider block truncate">
                                  {mountedTicket.organizerName || 'Campus Event'}
                                </span>
                                <h3 className="text-xl font-bold text-text leading-snug group-hover:text-accent transition-colors mt-0.5 line-clamp-2">
                                  {mountedTicket.eventTitle}
                                </h3>
                              </div>

                              <div className="space-y-1 text-xs">
                                <p className="text-text-2 flex items-center gap-2 truncate">
                                  <MapPin size={15} className="shrink-0 text-text-3" />
                                  <span className="truncate">{mountedTicket.venueName || 'Main Campus Venue'}</span>
                                </p>
                                <p className="text-text-2 flex items-center gap-2">
                                  <Chair size={15} className="shrink-0 text-text-3" />
                                  <span>Official Gate Admission</span>
                                </p>
                              </div>

                              <div className="pt-2 border-t border-line/60 flex items-center gap-2 text-xs">
                                <span className="text-text-3">Passholder:</span>
                                <span className="font-semibold text-text">{mountedTicket.userName || studentData.name}</span>
                                <span className="text-text-3">({studentData.registrationNumber})</span>
                              </div>
                            </div>

                            {/* Dashed line */}
                            <div className="w-px border-r-2 border-dashed border-line my-1 shrink-0" />

                            {/* Stub */}
                            <div className="w-[140px] bg-subtle/50 rounded-xl p-3 flex flex-col items-center justify-between text-center shrink-0 border border-line">
                              <div>
                                <p className="text-[10px] text-text-3 uppercase">Pass Code</p>
                                <p className="text-xs font-mono font-bold text-text mt-0.5 truncate">{ticketCode}</p>
                              </div>

                              <div className="my-1 bg-surface p-1.5 rounded-lg border border-line shadow-2xs">
                                <div className="w-14 h-14 bg-ink rounded flex items-center justify-center text-white">
                                  <QrCode size={34} weight="bold" />
                                </div>
                              </div>

                              <span className="text-xs font-semibold text-accent group-hover:underline">
                                Tap to Tear ➔
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Unified Action Row */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => {
                              setSelectedTicket(mountedTicket)
                              fireCelebrationConfetti()
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                          >
                            <Check size={16} weight="bold" className="mr-1.5" />
                            <span>Present at Gate</span>
                          </Button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsBrightnessModalOpen(true)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line bg-surface hover:bg-subtle text-xs font-medium text-text transition-colors shadow-2xs"
                              title="Open large high-contrast QR for turnstiles"
                            >
                              <QrCode size={15} className="text-accent" />
                              <span>Scan QR</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                downloadICS({
                                  title: mountedTicket.eventTitle || 'Campus Event',
                                  startsAt: mountedTicket.eventStartsAt || new Date().toISOString(),
                                  endsAt: mountedTicket.eventStartsAt
                                    ? new Date(new Date(mountedTicket.eventStartsAt).getTime() + 3 * 3600 * 1000).toISOString()
                                    : new Date().toISOString(),
                                  venueName: mountedTicket.venueName || 'Main Campus Venue',
                                  description: `Admission Pass for ${mountedTicket.userName || studentData.name}. Code: ${(mountedTicket as any).code || 'CONFIRMED'}`,
                                })
                                toast({
                                  title: 'Calendar Exported',
                                  message: 'Saved .ics event file.',
                                })
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line bg-surface hover:bg-subtle text-xs font-medium text-text transition-colors shadow-2xs"
                              title="Add event to calendar"
                            >
                              <CalendarBlank size={15} className="text-accent" />
                              <span>Calendar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setIsVenueModalOpen(true)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line bg-surface hover:bg-subtle text-xs font-medium text-text transition-colors shadow-2xs"
                              title="View venue directions and gate hall"
                            >
                              <MapPin size={15} className="text-accent" />
                              <span>Directions</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const ticketCode =
                                  (mountedTicket as any).code ||
                                  (mountedTicket as any).ticketCode ||
                                  `EM-${String(mountedTicket.id).slice(-4).toUpperCase()}`
                                const shareText = `🎟️ ${mountedTicket.eventTitle}\nPassholder: ${studentData.name} (${studentData.registrationNumber})\nPass Code: ${ticketCode}\nVenue: ${mountedTicket.venueName || 'Main Campus Venue'}`
                                navigator.clipboard.writeText(shareText)
                                toast({
                                  title: 'Copied Pass Details',
                                  message: 'Pass details copied to clipboard.',
                                })
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line bg-surface hover:bg-subtle text-xs font-medium text-text transition-colors shadow-2xs"
                              title="Copy pass details"
                            >
                              <Copy size={15} className="text-text-2" />
                              <span>Share</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })()
                ) : (
                  /* Serene Empty State for 0 Active Passes */
                  <div className="py-16 px-6 flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
                    <div className="w-12 h-12 rounded-full bg-subtle border border-line flex items-center justify-center text-text-3">
                      <Ticket size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-text">Pass Sleeve Clear</h3>
                      <p className="text-xs text-text-2 leading-relaxed">
                        No upcoming admissions in your travel jacket right now. You have {historyPasses.length} attended event keepsakes in your archive.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Link to="/explore">
                        <Button variant="primary" size="sm">
                          Explore Events
                        </Button>
                      </Link>
                      {historyPasses.length > 0 && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setDocketCategory('keepsakes')}
                        >
                          View Archive ({historyPasses.length})
                        </Button>
                      )}
                    </div>
                  </div>
                )
              )}

              {/* B. HONORS CATEGORY */}
              {docketCategory === 'honors' && (
                mountedCertificate ? (
                  <div className="relative bg-gradient-to-br from-amber-500/5 via-surface to-amber-500/10 border border-amber-500/30 rounded-2xl p-6 sm:p-7 space-y-5 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                      <div className="flex items-center gap-2">
                        <CertificateIcon size={18} className="text-amber-600 dark:text-amber-400" weight="fill" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                          Verified Campus Credential
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                        ✓ Authenticated
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[11px] text-text-3 uppercase tracking-wider block">
                          Conferred Upon
                        </span>
                        <h3 className="text-xl font-display font-bold text-text mt-0.5">
                          {mountedCertificate.recipientName || studentData.name}
                        </h3>
                        <p className="text-xs font-mono text-text-2 mt-0.5">
                          {studentData.registrationNumber} · {studentData.campus}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-surface/80 border border-amber-500/20 space-y-1.5">
                        <h4 className="text-base font-bold text-text">
                          {mountedCertificate.eventTitle}
                        </h4>
                        <p className="text-xs text-text-2">
                          Issued {formatDate(mountedCertificate.issuedAt)} · ID: {mountedCertificate.certificateId}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-500/20">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => downloadCertificatePDF(mountedCertificate)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium"
                      >
                        <DownloadSimple size={14} className="mr-1.5" />
                        <span>Download PDF</span>
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/verify/${mountedCertificate.certificateId}`
                          )
                          toast({
                            title: 'Verification Link Copied',
                            message: 'Public verification URL copied to clipboard.',
                          })
                        }}
                        className="px-3 py-1.5 rounded-lg border border-line bg-surface hover:bg-subtle text-xs font-medium text-text transition-colors shadow-2xs"
                      >
                        <Copy size={13} className="inline mr-1 text-accent" />
                        <span>Copy Verification Link</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 px-6 flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
                    <div className="w-12 h-12 rounded-full bg-subtle border border-line flex items-center justify-center text-text-3">
                      <CertificateIcon size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-text">No Honors Issued Yet</h3>
                      <p className="text-xs text-text-2 leading-relaxed">
                        Complete campus workshops, hackathons, and certified events to earn verified credentials.
                      </p>
                    </div>
                    <Link to="/explore" className="pt-1">
                      <Button variant="secondary" size="sm">
                        Explore Certified Events
                      </Button>
                    </Link>
                  </div>
                )
              )}

              {/* C. KEEPSAKES CATEGORY (ARCHIVE) */}
              {docketCategory === 'keepsakes' && (
                mountedTicket ? (
                  <div className="relative bg-surface border border-line rounded-2xl p-6 sm:p-7 space-y-5 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-line pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-zinc-500" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-text-3">
                          Attended Event Record
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        ✓ Admitted &amp; Attended
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-text leading-snug">
                        {mountedTicket.eventTitle}
                      </h3>
                      <p className="text-xs text-text-2">
                        {mountedTicket.eventStartsAt ? formatDate(mountedTicket.eventStartsAt) : 'Past Event'} · {mountedTicket.venueName || 'Main Campus Venue'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-subtle border border-line text-xs space-y-1">
                      <p className="text-text-2">
                        <span className="font-semibold text-text">Organizer:</span> {mountedTicket.organizerName || 'Campus Host'}
                      </p>
                      <p className="text-text-2">
                        <span className="font-semibold text-text">Attendee:</span> {mountedTicket.userName || studentData.name} ({studentData.registrationNumber})
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-line text-xs">
                      <span className="text-text-3">Permanent attendance record</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTicket(mountedTicket)
                          fireCelebrationConfetti()
                        }}
                        className="text-accent hover:underline font-semibold"
                      >
                        View Ticket Stub ➔
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 px-6 flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
                    <div className="w-12 h-12 rounded-full bg-subtle border border-line flex items-center justify-center text-text-3">
                      <ClockCounterClockwise size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-text">Archive Is Empty</h3>
                      <p className="text-xs text-text-2 leading-relaxed">
                        Events you attend will automatically be archived here as keepsake admissions.
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TACTILE GATE TEAR-OFF MODAL INSPECTION                                 */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <EventAdmissionTicket
          registration={selectedTicket}
          floatingCanvas={true}
          demoMode={false}
          onClose={() => setSelectedTicket(null)}
          onAdmit={() => {
            updateStatusMutation.mutate({
              id: selectedTicket.id,
              status: 'checked_in',
            })
            setSelectedTicket({
              ...selectedTicket,
              status: 'checked_in',
            })
            toast({
              title: 'Admission Verified!',
              message: `Gate stub validated for ${selectedTicket.eventTitle}.`,
              type: 'success',
            })
          }}
        />
      )}

      {/* Profile Details Modal */}
      <ProfileDetailsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Avatar Customizer Modal */}
      <AvatarSelectorModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onAvatarSelected={(url) => setAvatarUrl(url)}
      />

      {/* Live Calendar Subscription Modal */}
      <Modal
        isOpen={calendarSyncOpen}
        onClose={() => setCalendarSyncOpen(false)}
        title="Sync Passes to Your Calendar"
        subtitle="Subscribe with Apple Calendar, Google Calendar, or Outlook to keep your confirmed events automatically updated."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-1">
          <div className="p-3.5 rounded-xl bg-subtle border border-line text-xs space-y-1.5">
            <p className="font-semibold text-text flex items-center gap-1.5">
              <span>⚡ Live WebCal Feed</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                Auto-Refreshing
              </span>
            </p>
            <p className="text-text-2">
              Anytime you RSVP to an event or session timings update, your calendar syncs automatically without downloading a new file.
            </p>
          </div>

          <div className="space-y-2">
            {/* 1-Tap Apple Calendar / Outlook */}
            <a
              href={getUserScheduleWebCalUrl(session?.id || 'me')}
              className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-surface hover:bg-subtle text-text transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🍏</span>
                <div>
                  <p className="text-sm font-semibold">Apple Calendar / Outlook</p>
                  <p className="text-xs text-text-2">1-tap subscribe via native WebCal</p>
                </div>
              </div>
              <span className="text-xs font-mono text-text-3 group-hover:text-text transition-colors">Subscribe ➔</span>
            </a>

            {/* Direct .ics Download */}
            <a
              href={getUserScheduleIcsUrl(session?.id || 'me')}
              download="eventmesh-my-schedule.ics"
              className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-surface hover:bg-subtle text-text transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📥</span>
                <div>
                  <p className="text-sm font-semibold">Download .ICS Snapshot</p>
                  <p className="text-xs text-text-2">Save current passes as a static calendar file</p>
                </div>
              </div>
              <span className="text-xs font-mono text-text-3 group-hover:text-text">.ics</span>
            </a>
          </div>

          {/* Copy WebCal Feed URL */}
          <div className="pt-2 border-t border-line">
            <label className="text-xs font-mono uppercase tracking-wider text-text-3 block mb-1.5">
              Personal WebCal URL
            </label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={getUserScheduleWebCalUrl(session?.id || 'me')}
                className="flex-1 bg-subtle border border-line rounded-lg px-3 py-1.5 text-xs font-mono text-text select-all"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(getUserScheduleWebCalUrl(session?.id || 'me'))
                  setCopiedFeed(true)
                  setTimeout(() => setCopiedFeed(false), 2000)
                  toast({
                    title: 'Feed URL copied',
                    message: 'Add as a subscribed calendar in Google Calendar or Outlook settings.',
                    type: 'success',
                  })
                }}
                className="px-3 py-1.5 bg-accent text-on-accent rounded-lg text-xs font-semibold hover:opacity-90 active:scale-95 transition-transform shrink-0 flex items-center gap-1 shadow-xs"
              >
                {copiedFeed ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedFeed ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-text-3 mt-1.5">
              In Google Calendar, go to <i>Other calendars + &gt; From URL</i> and paste this link.
            </p>
          </div>
        </div>
      </Modal>

      {/* Laser Scanner High-Brightness QR Modal */}
      {mountedTicket && (
        <Modal
          isOpen={isBrightnessModalOpen}
          onClose={() => setIsBrightnessModalOpen(false)}
          title="Gate Laser Scanner Mode"
          subtitle="Max contrast barcode display for physical optical scanners and handheld gate guns."
          maxWidth="max-w-sm"
        >
          <div className="flex flex-col items-center justify-center p-6 bg-white text-zinc-950 rounded-2xl border border-zinc-200 shadow-md text-center space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-zinc-500">
                OFFICIAL ADMISSION BARCODE
              </span>
              <h4 className="text-base font-bold text-zinc-900 leading-tight">
                {mountedTicket.eventTitle}
              </h4>
            </div>

            {/* High Resolution Scannable Target */}
            <div className="p-3 bg-white rounded-xl border-2 border-zinc-900 shadow-sm">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Turnstile QR"
                  className="w-56 h-56 object-contain image-rendering-pixelated"
                />
              ) : (
                <div className="w-56 h-56 bg-zinc-100 flex items-center justify-center">
                  <QrCode size={48} className="text-zinc-400" />
                </div>
              )}
            </div>

            <div className="space-y-1 w-full">
              <p className="text-xl font-mono font-bold tracking-wider text-zinc-950">
                {(mountedTicket as any).code || (mountedTicket as any).ticketCode || `EM-${String(mountedTicket.id).slice(-4).toUpperCase()}`}
              </p>
              <p className="text-xs font-mono text-zinc-600">
                {mountedTicket.userName || studentData.name} · {studentData.registrationNumber}
              </p>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-zinc-100 border border-zinc-300 text-zinc-800">
                  Hold 6 inches in front of turnstile scanner
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Venue Entry Doors & Directions Modal */}
      {mountedTicket && (
        <Modal
          isOpen={isVenueModalOpen}
          onClose={() => setIsVenueModalOpen(false)}
          title="Venue Directions & Entry Doors"
          subtitle="Gate access rules, room entry guidelines, and hall location."
          maxWidth="max-w-md"
        >
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-xl bg-subtle border border-line space-y-2">
              <div className="flex items-center gap-2 text-text font-bold text-sm">
                <MapPin size={18} className="text-accent" />
                <span>{mountedTicket.venueName || 'Main Campus Venue'}</span>
              </div>
              <p className="text-xs text-text-2 font-mono">
                Campus Location: Main Academic Quad · Hall B
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-text-2">
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-line bg-surface">
                <span className="w-5 h-5 rounded-full bg-accent/15 text-accent font-bold flex items-center justify-center text-[10px] shrink-0">
                  1
                </span>
                <div>
                  <p className="font-semibold text-text">Turnstiles &amp; Security</p>
                  <p className="text-text-3 text-[11px] mt-0.5">
                    Enter through North Security Gates. Have your Student ID and Pass Code ready.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-line bg-surface">
                <span className="w-5 h-5 rounded-full bg-accent/15 text-accent font-bold flex items-center justify-center text-[10px] shrink-0">
                  2
                </span>
                <div>
                  <p className="font-semibold text-text">Fast-Track Kiosk Check-In</p>
                  <p className="text-text-3 text-[11px] mt-0.5">
                    Self-service kiosks scan in &lt;200ms. Tap &quot;Laser Scanner QR&quot; for instant read.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-line bg-surface">
                <span className="w-5 h-5 rounded-full bg-accent/15 text-accent font-bold flex items-center justify-center text-[10px] shrink-0">
                  3
                </span>
                <div>
                  <p className="font-semibold text-text">Badge &amp; Lanyard Pickup</p>
                  <p className="text-text-3 text-[11px] mt-0.5">
                    Proceed to Registration Desk 3 to collect your physical hackathon badge.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Onboarding Modal Powered by Stepper */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialData={customStudentData || undefined}
        onComplete={(data) => {
          setCustomStudentData(data)
          if (data.avatarUrl) setAvatarUrl(data.avatarUrl)
          try {
            localStorage.setItem('eventmesh_onboarding_profile', JSON.stringify(data))
          } catch {}
          fireCelebrationConfetti()
          toast({
            title: 'Profile & Pass Updated!',
            message: 'Your official collegiate credentials have been saved.',
            type: 'success',
          })
        }}
      />

      {/* Plan Selector Modal Powered by PixelCard */}
      {isPlanSelectorOpen && (
        <Modal
          isOpen={isPlanSelectorOpen}
          onClose={() => setIsPlanSelectorOpen(false)}
          title="Campus Membership Plans"
          subtitle="Explore Free, Pro Builder, and Industry Partner tiers with interactive pixel cards."
          maxWidth="max-w-6xl"
        >
          <div className="pt-2 pb-4">
            <PlanSelectorSection
              currentPlan={currentPlan}
              onSelectPlan={(plan) => {
                setCurrentPlan(plan)
                fireCelebrationConfetti()
                toast({
                  title: `Switched to ${plan.toUpperCase()} Plan!`,
                  message: `Your account benefits and collegiate pass have been updated.`,
                  type: 'success',
                })
                setIsPlanSelectorOpen(false)
              }}
            />
          </div>
        </Modal>
      )}
    </PageShell>
  )
}

export default AttendeeDashboardPage
