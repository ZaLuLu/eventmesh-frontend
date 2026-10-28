import React, { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  Ticket,
  Certificate as CertificateIcon,
  DownloadSimple,
  ShieldCheck,
  Copy,
  Check,
  GraduationCap,
  Sparkle,
  IdentificationCard,
  ArrowRight,
  CalendarBlank,
  PencilSimple,
  ArrowsClockwise,
  ClockCounterClockwise,
  User,
  ShareNetwork,
} from '@phosphor-icons/react'
import { useMyRegistrations, useCancelRegistration, useUpdateRegistrationStatus } from '@/hooks/useRegistrations'
import { useMyCertificates } from '@/hooks/useCertificates'
import { useClubs } from '@/hooks/useClubs'
import { useEvents } from '@/hooks/useEvents'
import { useAuth } from '@/hooks/useAuth'
import { PageShell } from '@/design-system/layout/PageShell'
import { Button } from '@/design-system/primitives/Button'
import { formatDate } from '@/lib/dates'
import { api, Registration, Certificate } from '@/api'
import { useToast } from '@/design-system/primitives/Toast'
import { fireCelebrationConfetti } from '@/lib/confetti'
import { TactileBoardingPass } from './components/TactileBoardingPass'
import { EventAdmissionTicket } from '@/design-system/micro/EventAdmissionTicket'
import { StudentIDCard2D } from '@/design-system/3d/StudentIDCard2D'
import { AvatarSelectorModal } from './components/AvatarSelectorModal'
import { ProfileDetailsModal } from './components/ProfileDetailsModal'
import { resolveUserAvatar } from '@/lib/avatars'
import { Modal } from '@/design-system/primitives/Modal'
import { getUserScheduleWebCalUrl, getUserScheduleIcsUrl } from '@/lib/ics'

type TabKey = 'passes' | 'history' | 'certificates' | 'student-id'

export const AttendeeDashboardPage: React.FC = () => {
  const { session, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { data: rawRegistrations = [], isLoading: regsLoading } = useMyRegistrations()
  const { data: certificates = [], isLoading: certsLoading } = useMyCertificates()
  const { data: clubs = [] } = useClubs()
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

  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('passes')
  const [copiedRegNo, setCopiedRegNo] = useState(false)
  const [calendarSyncOpen, setCalendarSyncOpen] = useState(false)
  const [copiedFeed, setCopiedFeed] = useState(false)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>(() => resolveUserAvatar(session))

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'certificates' || tab === 'history' || tab === 'student-id' || tab === 'passes') {
      setActiveTab(tab)
    } else if (tab === 'tickets') {
      setActiveTab('passes')
    } else if (tab === 'profile' || tab === 'id') {
      setActiveTab('student-id')
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
    const rawName = s?.name || 'EventMesh Member'
    const cleanName = rawName
      .replace(/\s*\([^)]*\)/g, '')
      .trim() || 'EventMesh Member'

    return {
      name: cleanName,
      registrationNumber: s?.registrationNumber || s?.studentId || 'EM-2026-0814',
      degreeBranch: s?.degreeBranch || s?.branch || 'Campus Student',
      semester: s?.semester,
      email: s?.email || '',
      role: 'EVENTMESH MEMBER',
      campus: s?.campus || s?.institutionName || 'Apex Institute',
      bloodGroup: s?.bloodGroup,
      emergencyPhone: s?.emergencyPhone || s?.phone,
      phone: s?.phone || '',
    }
  }, [session])

  const handleCopyRegNo = () => {
    navigator.clipboard.writeText(studentData.registrationNumber)
    setCopiedRegNo(true)
    setTimeout(() => setCopiedRegNo(false), 2000)
    toast({
      title: 'Copied ID',
      message: `${studentData.registrationNumber} copied to clipboard`,
      type: 'info',
    })
  }

  const handleCancelPass = async (reg: Registration) => {
    if (window.confirm('Are you sure you want to cancel this ticket pass?')) {
      try {
        await cancelMutation.mutateAsync(reg.eventSlug || reg.eventId)
        setSelectedTicket(null)
        toast({
          title: 'Pass cancelled',
          message: 'Your registration was cancelled and the seat returned to the pool.',
          type: 'info',
        })
      } catch (err: any) {
        toast({
          title: 'Cancellation failed',
          message: err?.message || 'Could not cancel pass.',
          type: 'error',
        })
      }
    }
  }

  const queryClient = useQueryClient()
  const [isPromoting, setIsPromoting] = useState(false)
  const isOrganizer = Boolean(
    session?.clubId ||
    ['org_admin', 'platform_admin', 'club_admin', 'organizer', 'volunteer'].includes(session?.role || '')
  )

  const handleBecomeOrganizer = async () => {
    setIsPromoting(true)
    try {
      if (api.auth.becomeOrganizer) {
        await api.auth.becomeOrganizer()
      }
      localStorage.setItem('eventmesh_user_role', 'org_admin')
      localStorage.setItem('eventmesh_user_club_id', 'club-devcraft')

      queryClient.setQueryData(['auth', 'session'], (old: any) => ({
        ...(old || {}),
        role: 'org_admin',
        clubId: 'club-devcraft',
      }))
      queryClient.invalidateQueries({ queryKey: ['auth'] }).catch(() => {})

      toast({
        title: 'Role Promoted 🎉',
        message: 'You have been granted Club Organizer privileges. You can now host events and lead clubs!',
        type: 'success',
      })
      fireCelebrationConfetti()
    } catch (err: any) {
      toast({
        title: 'Upgrade failed',
        message: err?.detail || err?.message || 'Unable to promote role at this time.',
        type: 'error',
      })
    } finally {
      setIsPromoting(false)
    }
  }

  const downloadCertificatePDF = async (cert: Certificate) => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      // Warm paper background (#F8FAFC)
      doc.setFillColor(248, 250, 252)
      doc.rect(0, 0, 297, 210, 'F')

      // Double collegiate ink border
      doc.setDrawColor(13, 14, 18)
      doc.setLineWidth(1.5)
      doc.rect(12, 12, 273, 186)

      doc.setDrawColor(0, 71, 255)
      doc.setLineWidth(0.6)
      doc.rect(15, 15, 267, 180)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(74, 70, 104)
      doc.text('EVENTMESH · VERIFIABLE CAMPUS CREDENTIAL', 148.5, 36, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(28)
      doc.setTextColor(13, 14, 18)
      doc.text('CERTIFICATE OF PARTICIPATION', 148.5, 52, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(13)
      doc.setTextColor(74, 70, 104)
      doc.text('This document certifies that', 148.5, 75, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.setTextColor(0, 71, 255)
      doc.text(cert.recipientName.toUpperCase(), 148.5, 92, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(13)
      doc.setTextColor(74, 70, 104)
      doc.text('has successfully completed & attended', 148.5, 108, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(13, 14, 18)
      doc.text(cert.eventTitle.toUpperCase(), 148.5, 122, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(74, 70, 104)
      doc.text(`Organized by ${cert.organizerName}`, 148.5, 134, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(74, 70, 104)
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

  // Active / Imminent vs History
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

  // Next up imminent event
  const nextEvent = (upcomingData?.items || [])
    .filter((event) => activePasses.some((pass) => pass.eventId === event.id) && new Date(event.startsAt).getTime() >= Date.now())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0]
  const nextPass = nextEvent && activePasses.find((pass) => pass.eventId === nextEvent.id)

  const handleTabSwitch = (key: TabKey) => {
    setActiveTab(key)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('tab', key)
      return next
    })
  }

  return (
    <PageShell className="py-6 sm:py-8 space-y-6">
      {/* ========================================================================= */}
      {/* 1. WALLET HEADER & QUICK ACTIONS                                          */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-text-3">
              CAMPUS WALLET &amp; IDENTITY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-text mt-1">
            Attendee Passes
          </h1>
          <p className="text-xs sm:text-sm text-text-2 mt-0.5">
            Offline-cached digital boarding passes, gate admission stubs, and credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Live Calendar Subscription Action */}
          <button
            type="button"
            onClick={() => setCalendarSyncOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-line bg-surface hover:bg-subtle text-text text-xs font-semibold shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <CalendarBlank size={15} className="text-accent" weight="bold" />
            <span>Sync Calendar</span>
          </button>

          {/* Quick ID Tab Trigger */}
          <button
            type="button"
            onClick={() => handleTabSwitch('student-id')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-line bg-surface hover:bg-subtle text-text text-xs font-semibold shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <IdentificationCard size={15} className="text-accent" weight="bold" />
            <span>Student ID</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. NEXT UP IMMINENT PASS (FAST GATE ACCESSIBILITY)                        */}
      {/* ========================================================================= */}
      {nextEvent && nextPass && (
        <section
          className="rounded-2xl border-2 border-accent/30 bg-surface p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
          aria-label="Next event quick gate access"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 border border-accent/20">
              <Ticket size={24} weight="bold" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  GATE READY · NEXT UP
                </span>
                <span className="text-xs text-text-3 font-mono">
                  {formatDate(nextEvent.startsAt)}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-text truncate mt-1">
                {nextEvent.title}
              </h2>
              <p className="text-xs text-text-2 truncate font-mono mt-0.5">
                {nextEvent.venue?.name || 'Main Campus Venue'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedTicket(nextPass)
                fireCelebrationConfetti()
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-on-accent hover:opacity-90 font-bold text-xs tracking-wider uppercase transition-all shadow-xs active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Ticket size={16} weight="bold" />
              <span>Present at Gate</span>
              <ArrowRight size={14} weight="bold" />
            </button>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. APPLE WALLET SEGMENTED DECK TABS                                       */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <div
          role="tablist"
          aria-label="Wallet sections"
          className="flex items-center gap-1.5 p-1 rounded-xl bg-subtle border border-line overflow-x-auto scrollbar-none"
        >
          {/* Tab 1: Active Passes */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'passes'}
            onClick={() => handleTabSwitch('passes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              activeTab === 'passes'
                ? 'bg-surface text-text shadow-xs border border-line'
                : 'text-text-2 hover:text-text hover:bg-surface/50'
            }`}
          >
            <Ticket size={16} weight={activeTab === 'passes' ? 'fill' : 'regular'} className="text-accent" />
            <span>Active Passes</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold tabular-nums ${
                activeTab === 'passes' ? 'bg-accent text-white' : 'bg-surface border border-line text-text-3'
              }`}
            >
              {activePasses.length}
            </span>
          </button>

          {/* Tab 2: Past History */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'history'}
            onClick={() => handleTabSwitch('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              activeTab === 'history'
                ? 'bg-surface text-text shadow-xs border border-line'
                : 'text-text-2 hover:text-text hover:bg-surface/50'
            }`}
          >
            <ClockCounterClockwise size={16} weight={activeTab === 'history' ? 'bold' : 'regular'} className="text-accent" />
            <span>Past History</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold tabular-nums ${
                activeTab === 'history' ? 'bg-accent text-white' : 'bg-surface border border-line text-text-3'
              }`}
            >
              {historyPasses.length}
            </span>
          </button>

          {/* Tab 3: Certificates Ledger */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'certificates'}
            onClick={() => handleTabSwitch('certificates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              activeTab === 'certificates'
                ? 'bg-surface text-text shadow-xs border border-line'
                : 'text-text-2 hover:text-text hover:bg-surface/50'
            }`}
          >
            <CertificateIcon size={16} weight={activeTab === 'certificates' ? 'fill' : 'regular'} className="text-accent" />
            <span>Certificates</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold tabular-nums ${
                activeTab === 'certificates' ? 'bg-accent text-white' : 'bg-surface border border-line text-text-3'
              }`}
            >
              {certificates.length}
            </span>
          </button>

          {/* Tab 4: Student ID */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'student-id'}
            onClick={() => handleTabSwitch('student-id')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              activeTab === 'student-id'
                ? 'bg-surface text-text shadow-xs border border-line'
                : 'text-text-2 hover:text-text hover:bg-surface/50'
            }`}
          >
            <IdentificationCard size={16} weight={activeTab === 'student-id' ? 'fill' : 'regular'} className="text-accent" />
            <span>Student ID</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </button>
        </div>

        {/* ======================================================================= */}
        {/* TAB CONTENT 1: ACTIVE PASSES                                            */}
        {/* ======================================================================= */}
        {activeTab === 'passes' && (
          <div className="space-y-4">
            {regsLoading ? (
              <div className="py-12 text-center">
                <p className="text-xs font-mono text-text-3">Loading active passes from secure storage...</p>
              </div>
            ) : activePasses.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-subtle border border-line mx-auto flex items-center justify-center text-accent">
                  <Ticket size={24} />
                </div>
                <h3 className="font-display font-bold text-lg text-text">No active passes in your wallet</h3>
                <p className="text-xs sm:text-sm text-text-2 max-w-sm mx-auto">
                  You don't have any confirmed registrations for upcoming events. Browse campus premieres to grab admission passes.
                </p>
                <div className="pt-2">
                  <Link to="/explore">
                    <Button variant="primary" size="sm">
                      Explore Campus Events
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activePasses.map((reg) => (
                  <TactileBoardingPass
                    key={reg.id}
                    registration={reg}
                    onPresent={() => {
                      setSelectedTicket(reg)
                      fireCelebrationConfetti()
                    }}
                    onCancel={() => handleCancelPass(reg)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB CONTENT 2: PAST HISTORY                                             */}
        {/* ======================================================================= */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {regsLoading ? (
              <div className="py-12 text-center">
                <p className="text-xs font-mono text-text-3">Loading past attendance history...</p>
              </div>
            ) : historyPasses.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-subtle border border-line mx-auto flex items-center justify-center text-text-3">
                  <ClockCounterClockwise size={24} />
                </div>
                <h3 className="font-display font-bold text-lg text-text">No past event history</h3>
                <p className="text-xs sm:text-sm text-text-2 max-w-sm mx-auto">
                  Once you attend events and scan your ticket at campus gates, your keepsake passes will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historyPasses.map((reg) => (
                  <div key={reg.id} className="relative group">
                    <TactileBoardingPass
                      registration={reg}
                      onPresent={() => {
                        setSelectedTicket(reg)
                        fireCelebrationConfetti()
                      }}
                      onCancel={() => handleCancelPass(reg)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB CONTENT 3: CERTIFICATES LEDGER                                      */}
        {/* ======================================================================= */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            {certsLoading ? (
              <div className="py-12 text-center">
                <p className="text-xs font-mono text-text-3">Verifying credential ledger...</p>
              </div>
            ) : certificates.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-subtle border border-line mx-auto flex items-center justify-center text-accent">
                  <CertificateIcon size={24} />
                </div>
                <h3 className="font-display font-bold text-lg text-text">No certificates issued yet</h3>
                <p className="text-xs sm:text-sm text-text-2 max-w-sm mx-auto">
                  Complete workshops, hackathons, and certified campus sessions to earn verifiable PDF credentials.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((cert) => (
                  <div
                    key={cert.id || cert.certificateId}
                    className="rounded-2xl border border-line bg-surface p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-xs hover:border-accent/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 border-b border-line pb-3 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck size={14} weight="fill" />
                          <span>Verified Credential</span>
                        </span>
                        <span className="text-xs font-mono text-text-3 tabular-nums">
                          {formatDate(cert.issuedAt)}
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-base sm:text-lg text-text">
                        {cert.eventTitle}
                      </h3>
                      <p className="text-xs text-text-2 mt-1">
                        Awarded to <span className="font-semibold text-text">{cert.recipientName}</span> by{' '}
                        <span className="font-semibold text-text">{cert.organizerName}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-line flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-text-3">Credential ID</p>
                        <p className="text-xs font-mono font-bold text-text truncate">{cert.certificateId}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => downloadCertificatePDF(cert)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-subtle border border-line text-xs font-bold text-text transition-colors shadow-xs active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0"
                      >
                        <DownloadSimple size={14} weight="bold" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB CONTENT 4: STUDENT IDENTITY CARD                                    */}
        {/* ======================================================================= */}
        {activeTab === 'student-id' && (
          <div className="rounded-2xl bg-surface border border-line p-6 sm:p-8 flex flex-col items-center">
            {/* Identity Bar Controls */}
            <div className="w-full max-w-[460px] flex items-center justify-between mb-5 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck size={14} weight="fill" className="text-emerald-500" />
                  <span>Campus Verified: {studentData.email.split('@')[1] || 'apex.edu.in'}</span>
                </span>
                <span className="text-xs font-mono text-text-3 hidden sm:inline">
                  {studentData.degreeBranch || 'Verified Passholder'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono text-text-2 hover:text-text bg-subtle border border-line transition-colors shadow-xs"
                  title="Edit attendee profile details"
                >
                  <PencilSimple size={12} />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono text-text-2 hover:text-text bg-subtle border border-line transition-colors shadow-xs"
                  title="Edit student avatar photo"
                >
                  <User size={12} />
                  <span>Change Photo</span>
                </button>
              </div>
            </div>

            {/* Central Identity Card Artifact */}
            <div className="w-full flex flex-col items-center">
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
              <p className="mt-3.5 text-xs font-mono text-text-3 text-center flex items-center justify-center gap-1.5">
                <ArrowsClockwise size={12} className="text-accent" />
                <span>Click or tap card to flip 3D (Front / Back)</span>
              </p>
            </div>
          </div>
        )}
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

      {/* ========================================================================= */}
      {/* 5. ORGANIZER CTA STRIP (TASTEFUL BOTTOM PLACEMENT)                       */}
      {/* ========================================================================= */}
      {!isOrganizer ? (
        <section className="rounded-2xl border border-line bg-surface p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent/15 text-accent">
                LEADERSHIP UPGRADE
              </span>
              <span className="text-xs text-text-3 font-mono">Start a Club</span>
            </div>
            <h4 className="font-display font-bold text-base text-text">
              Want to host events for your student club?
            </h4>
            <p className="text-xs text-text-2 max-w-xl">
              Promote your account to Club Organizer. Get access to QR gate scanning, attendee rosters, and verifiable certificates.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              icon={<Sparkle size={14} weight="fill" />}
              onClick={handleBecomeOrganizer}
              loading={isPromoting}
            >
              Become an Organizer
            </Button>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-line bg-subtle p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface border border-line flex items-center justify-center text-accent shrink-0">
              <GraduationCap size={22} weight="bold" />
            </div>
            <div>
              <span className="font-bold text-sm text-text">Organizer Studio Active</span>
              <p className="text-xs text-text-3">You manage events, registrations, and ticket queues for your club.</p>
            </div>
          </div>
          <Link to="/admin" className="shrink-0">
            <Button surface="admin" size="sm" arrow>
              Open Admin Console
            </Button>
          </Link>
        </section>
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
              <ArrowRight size={15} className="text-text-3 group-hover:text-text transition-colors" />
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
    </PageShell>
  )
}

export default AttendeeDashboardPage
