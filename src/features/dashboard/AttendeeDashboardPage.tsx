import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import {
  Ticket,
  Certificate as CertificateIcon,
  DownloadSimple,
  ShieldCheck,
  Copy,
  Check,
  GraduationCap,
  Sparkle,
  Cube,
  IdentificationCard,
  ArrowRight,
  CalendarBlank,
} from '@phosphor-icons/react'
import { useMyRegistrations, useCancelRegistration, useUpdateRegistrationStatus } from '@/hooks/useRegistrations'
import { useMyCertificates } from '@/hooks/useCertificates'
import { useClubs } from '@/hooks/useClubs'
import { useAuth } from '@/hooks/useAuth'
import { PageShell } from '@/design-system/layout/PageShell'
import { Badge } from '@/design-system/primitives/Badge'
import { Button } from '@/design-system/primitives/Button'
import { formatDate } from '@/lib/dates'
import { Registration, Certificate } from '@/api'
import { useToast } from '@/design-system/primitives/Toast'
import { EmptyState } from '@/design-system/primitives/EmptyState'
import { fireCelebrationConfetti } from '@/lib/confetti'
import { TactileBoardingPass } from './components/TactileBoardingPass'
import { Lanyard, generateStudentIDTexture, StudentIDCard2D } from '@/design-system/3d'
import { EventAdmissionTicket } from '@/design-system/micro/EventAdmissionTicket'

export const AttendeeDashboardPage: React.FC = () => {
  const { session, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { data: registrations = [], isLoading: regsLoading } = useMyRegistrations()
  const { data: certificates = [], isLoading: certsLoading } = useMyCertificates()
  const { data: clubs = [] } = useClubs()
  const cancelMutation = useCancelRegistration()
  const updateStatusMutation = useUpdateRegistrationStatus()

  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null)
  const [activeTab, setActiveTab] = useState<'passes' | 'certificates' | 'clubs'>('passes')
  const [copiedRegNo, setCopiedRegNo] = useState(false)
  const [badgeViewMode, setBadgeViewMode] = useState<'3d' | '2d'>('3d')

  // Auto-switch to 2D ID Badge for mobile viewports or prefers-reduced-motion (F-15)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (isMobile || prefersReduced) {
        setBadgeViewMode('2d')
      }
    }
  }, [])

  // Student Identity Data
  const studentData = useMemo(() => {
    const s = session as any
    const rawName = s?.name || 'Aditya Narayan'
    const cleanName = rawName
      .replace(/\s*\([^)]*\)/g, '')
      .trim() || 'Aditya Narayan'

    return {
      name: cleanName,
      registrationNumber: s?.registrationNumber || '21BCE1042',
      degreeBranch: s?.degreeBranch || 'B.Tech Computer Science & Engineering',
      semester: s?.semester || 6,
      email: s?.email || 'aditya.narayan@vitstudent.ac.in',
      role: 'STUDENT PASSHOLDER',
      campus: 'CENTRAL UNIVERSITY CAMPUS',
      bloodGroup: 'O+',
      emergencyPhone: '+91 98765 43210',
    }
  }, [session])

  // High-resolution authentic Student ID Card textures for 3D Lanyard
  const studentIdFrontTexture = useMemo(() => {
    return generateStudentIDTexture(studentData, 'front')
  }, [studentData])

  const studentIdBackTexture = useMemo(() => {
    return generateStudentIDTexture(studentData, 'back')
  }, [studentData])

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

  const followedClubs = clubs.filter((c) => c.isFollowed)

  const downloadCertificatePDF = (cert: Certificate) => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      // Warm paper background (#F6F1E7)
      doc.setFillColor(246, 241, 231)
      doc.rect(0, 0, 297, 210, 'F')

      // Double collegiate ink border
      doc.setDrawColor(21, 17, 48)
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
      doc.setTextColor(21, 17, 48)
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
      doc.setTextColor(21, 17, 48)
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

  if (!isAuthenticated) {
    return (
      <PageShell className="py-16">
        <div className="max-w-md mx-auto bg-surface-subtle/40 rounded-3xl p-8 text-center space-y-4">
          <h2 className="font-display font-semibold text-2xl text-ink tracking-tight">Sign in required</h2>
          <p className="text-sm text-ink-soft">
            Sign in to access your digital entry passes, official credentials, and followed clubs.
          </p>
          <Link to="/login" className="inline-block pt-2">
            <button type="button" className="btn-minimal-primary px-6 py-2.5">
              Sign in with Campus SSO
            </button>
          </Link>
        </div>
      </PageShell>
    )
  }

  const activePasses = registrations.filter((r) => r.status !== 'cancelled')
  const attendedPasses = registrations.filter((r) => r.status === 'checked_in')

  return (
    <PageShell className="py-6 sm:py-8 space-y-8">
      {/* ========================================================================= */}
      {/* PROFILE BENTO HEADER                                                      */}
      {/* ========================================================================= */}
      <section className="bg-surface-subtle/30 rounded-3xl p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column (7 cols): Academic Profile Bento */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutral" size="sm">
                Campus Identity
              </Badge>
              <Badge variant="iris" size="sm">
                Verified Passholder
              </Badge>
            </div>

            {/* Student Name & Email */}
            <div>
              <h1 className="font-display font-semibold text-3xl sm:text-4xl text-ink tracking-tight leading-tight">
                {studentData.name}
              </h1>
              <p className="font-mono text-xs text-ink-soft mt-1">
                {studentData.email}
              </p>
            </div>

            {/* Academic Info Bento Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {/* Registration Number Tile with Copy */}
              <div className="p-4 rounded-xl bg-surface/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-ink-soft/70">
                    Registration Number
                  </p>
                  <p className="font-mono font-medium text-base text-ink mt-0.5">
                    {studentData.registrationNumber}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyRegNo}
                  className="p-1.5 rounded-md hover:bg-surface-subtle text-ink-soft hover:text-ink transition-colors"
                  title="Copy registration number"
                  aria-label="Copy registration number"
                >
                  {copiedRegNo ? (
                    <Check className="w-4 h-4 text-emerald-600" weight="bold" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Program & Semester Tile */}
              <div className="p-4 rounded-xl bg-surface/80">
                <p className="text-[10px] font-mono uppercase tracking-wider text-ink-soft/70">
                  Degree & Branch
                </p>
                <p className="font-medium text-ink text-sm truncate mt-0.5">
                  {studentData.degreeBranch}
                </p>
                <p className="font-mono text-[11px] text-ink-soft mt-0.5">
                  Semester {studentData.semester} · Active Student
                </p>
              </div>
            </div>

            {/* Metric Summary Counters */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="px-4 py-2.5 rounded-xl bg-surface/80 text-center min-w-[100px] flex-1 sm:flex-none">
                <p className="font-display font-medium text-2xl text-ink font-mono">{activePasses.length}</p>
                <p className="text-[11px] text-ink-soft">Active Passes</p>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-surface/80 text-center min-w-[100px] flex-1 sm:flex-none">
                <p className="font-display font-medium text-2xl text-emerald-600 dark:text-emerald-400 font-mono">
                  {attendedPasses.length}
                </p>
                <p className="text-[11px] text-ink-soft">Admitted at Gate</p>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-surface/80 text-center min-w-[100px] flex-1 sm:flex-none">
                <p className="font-display font-medium text-2xl text-ink font-mono">{certificates.length}</p>
                <p className="text-[11px] text-ink-soft">Credentials</p>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): 3D Physics Lanyard ID Badge */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* 3D vs 2D View Switcher Controls */}
            <div className="w-full flex items-center justify-between pb-3 px-2">
              <span className="text-[11px] font-mono font-medium uppercase text-ink-soft/70 tracking-wider flex items-center gap-1.5">
                <IdentificationCard className="w-4 h-4 text-primary" weight="bold" />
                OFFICIAL ID BADGE
              </span>
              <div className="inline-flex rounded-full bg-surface p-1 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setBadgeViewMode('3d')}
                  className={`px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${
                    badgeViewMode === '3d'
                      ? 'bg-ink text-paper font-bold shadow-xs'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <Cube className="w-3.5 h-3.5" /> 3D
                </button>
                <button
                  type="button"
                  onClick={() => setBadgeViewMode('2d')}
                  className={`px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${
                    badgeViewMode === '2d'
                      ? 'bg-ink text-paper font-bold shadow-xs'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <IdentificationCard className="w-3.5 h-3.5" /> 2D
                </button>
              </div>
            </div>

            {/* Stage: Render 3D Physics Lanyard or 2D Static ID Badge */}
            {badgeViewMode === '3d' ? (
              <div className="w-full flex flex-col items-center">
                {/* Architectural Suspension Bracket */}
                <div className="z-10 flex flex-col items-center mb-[-12px]">
                  <div className="h-2 w-24 rounded-full bg-zinc-300 border border-ink shadow-[1px_1px_0_#151130]" />
                  <div className="h-3 w-8 bg-zinc-400 border-x border-b border-ink rounded-b-md flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-mint" />
                  </div>
                </div>

                {/* Open-Air 3D Canvas Stage */}
                <div className="relative w-full h-[420px] sm:h-[460px] flex items-center justify-center overflow-visible">
                  <Lanyard
                    frontImage={studentIdFrontTexture}
                    backImage={studentIdBackTexture}
                    cardColor="#151130"
                    finish="matte"
                    orientation="portrait"
                    strapColor="#0047FF"
                    size={0.88}
                    strapLength={0.34}
                    intro={false}
                    breeze={0.03}
                    className="w-full h-full"
                  />
                </div>

                {/* Status Prompt Pill */}
                <div className="z-10 mt-[-8px] px-3.5 py-1 rounded-full bg-paper border border-ink text-[11px] font-mono text-ink shadow-[2px_2px_0_#151130] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                  <span className="font-bold">PHYSICS LANYARD</span>
                  <span className="text-ink/40">·</span>
                  <span className="text-ink-soft">Drag to swing & spin</span>
                </div>
              </div>
            ) : (
              /* 2D Tactile ID Badge Fallback (F-15) */
              <div className="w-full flex flex-col items-center py-2">
                <StudentIDCard2D
                  name={studentData.name}
                  registrationNumber={studentData.registrationNumber}
                  degreeBranch={studentData.degreeBranch}
                  semester={studentData.semester}
                  email={studentData.email}
                  role={studentData.role}
                  campus={studentData.campus}
                  bloodGroup={studentData.bloodGroup}
                  emergencyPhone={studentData.emergencyPhone}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* TICKET & CREDENTIAL TABS                                                  */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        {/* Tab Header Controls */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line/30 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('passes')}
            className={`px-4 py-1.5 rounded-full font-medium text-xs transition-all flex items-center gap-2 ${
              activeTab === 'passes'
                ? 'bg-ink text-surface shadow-xs'
                : 'text-ink-soft hover:text-ink hover:bg-surface-subtle/60'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" weight="bold" />
            <span>My Tickets</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'passes' ? 'bg-surface/20 text-surface' : 'bg-surface-subtle text-ink-soft'
            }`}>
              {registrations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-1.5 rounded-full font-medium text-xs transition-all flex items-center gap-2 ${
              activeTab === 'certificates'
                ? 'bg-ink text-surface shadow-xs'
                : 'text-ink-soft hover:text-ink hover:bg-surface-subtle/60'
            }`}
          >
            <CertificateIcon className="w-3.5 h-3.5" weight="bold" />
            <span>Certificates</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'certificates' ? 'bg-surface/20 text-surface' : 'bg-surface-subtle text-ink-soft'
            }`}>
              {certificates.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clubs')}
            className={`px-4 py-1.5 rounded-full font-medium text-xs transition-all flex items-center gap-2 ${
              activeTab === 'clubs'
                ? 'bg-ink text-surface shadow-xs'
                : 'text-ink-soft hover:text-ink hover:bg-surface-subtle/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" weight="bold" />
            <span>Followed Clubs</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'clubs' ? 'bg-surface/20 text-surface' : 'bg-surface-subtle text-ink-soft'
            }`}>
              {followedClubs.length}
            </span>
          </button>
        </div>

        {/* TAB 1: PASSES & BOARDING PASSES */}
        {activeTab === 'passes' && (
          <div>
            {regsLoading ? (
              <p className="text-xs font-mono text-ink-soft">Loading tickets...</p>
            ) : registrations.length === 0 ? (
              <div className="bg-surface-subtle/30 rounded-3xl p-10 text-center space-y-3">
                <h3 className="font-display font-medium text-lg text-ink">No active passes yet</h3>
                <p className="text-sm text-ink-soft max-w-sm mx-auto">
                  You haven't reserved seats for upcoming events. Browse campus collectives to grab a pass.
                </p>
                <div className="pt-2">
                  <Link to="/explore">
                    <button type="button" className="btn-minimal-primary px-5 py-2 text-xs">
                      Explore events
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registrations.map((reg) => (
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

        {/* TAB 2: CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div>
            {certsLoading ? (
              <p className="text-xs font-mono text-ink-soft">Loading certificates...</p>
            ) : certificates.length === 0 ? (
              <div className="bg-surface-subtle/30 rounded-3xl p-10 text-center space-y-3">
                <h3 className="font-display font-medium text-lg text-ink">No credentials issued yet</h3>
                <p className="text-sm text-ink-soft max-w-sm mx-auto">
                  Certificates are automatically minted upon verified attendance at hackathons and workshops.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-surface-subtle/30 hover:bg-surface-subtle/60 rounded-2xl p-5 space-y-4 transition-colors"
                  >
                    <div className="flex items-center justify-between border-b border-line/20 pb-3">
                      <div className="flex items-center gap-2">
                        <CertificateIcon className="h-4 w-4 text-primary" weight="bold" />
                        <span className="font-medium text-xs text-ink uppercase tracking-wider">Credential</span>
                      </div>
                      <span className="font-mono text-xs text-ink-soft">
                        {cert.certificateId}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-medium text-base text-ink leading-snug">
                        {cert.eventTitle}
                      </h4>
                      <p className="text-xs text-ink-soft mt-1">
                        Issued {formatDate(cert.issuedAt)} · {cert.organizerName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-line/20">
                      <button
                        type="button"
                        className="btn-minimal-primary flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                        onClick={() => downloadCertificatePDF(cert)}
                      >
                        <DownloadSimple className="h-3.5 w-3.5" weight="bold" />
                        <span>Download PDF</span>
                      </button>
                      <Link to={`/verify/${cert.certificateId}`}>
                        <button type="button" className="btn-minimal-secondary text-xs px-3 py-1.5">
                          Verify
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FOLLOWED CLUBS */}
        {activeTab === 'clubs' && (
          <div>
            {followedClubs.length === 0 ? (
              <div className="bg-surface-subtle/30 rounded-3xl p-10 text-center space-y-3">
                <h3 className="font-display font-medium text-lg text-ink">No followed clubs</h3>
                <p className="text-sm text-ink-soft max-w-sm mx-auto">
                  Follow campus collectives to receive immediate updates about their new workshops and flagship gatherings.
                </p>
                <div className="pt-2">
                  <Link to="/clubs">
                    <button type="button" className="btn-minimal-primary px-5 py-2 text-xs">
                      Explore clubs
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {followedClubs.map((club) => (
                  <Link
                    key={club.id}
                    to={`/clubs/${club.slug}`}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-surface-subtle/30 hover:bg-surface-subtle/60 transition-colors"
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: club.color || '#6366F1' }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm text-ink truncate">{club.name}</h4>
                      <p className="text-xs text-ink-soft truncate">
                        {club.joinMode ? club.joinMode.replace('_', ' ') : 'Campus Collective'}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-ink-soft" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* FLOATING TICKET PASS INSPECTION (Mandate 1: Intact QR Face / Gate Tear)   */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <EventAdmissionTicket
          registration={selectedTicket}
          floatingCanvas={true}
          demoMode={false} // Normal student flow: pass is presented to volunteer
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
    </PageShell>
  )
}

export default AttendeeDashboardPage
