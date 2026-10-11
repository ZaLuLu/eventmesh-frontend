import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { Ticket, Award, Download, QrCode, ShieldCheck, Copy, Check, Sparkles, GraduationCap, Building2 } from 'lucide-react'
import { useMyRegistrations, useCancelRegistration, useUpdateRegistrationStatus } from '@/hooks/useRegistrations'
import { useMyCertificates } from '@/hooks/useCertificates'
import { useClubs } from '@/hooks/useClubs'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/design-system/primitives/Button'
import { QRCode } from '@/design-system/primitives/QRCode'
import { Modal } from '@/design-system/primitives/Modal'
import { Tabs } from '@/design-system/primitives/Tabs'
import { formatDate, formatTime } from '@/lib/dates'
import { Registration, Certificate } from '@/api'
import { useToast } from '@/design-system/primitives/Toast'
import { EmptyState } from '@/design-system/primitives/EmptyState'
import { fireCelebrationConfetti } from '@/lib/confetti'
import { TactileBoardingPass } from './components/TactileBoardingPass'
import { Lanyard, generateStudentIDTexture } from '@/design-system/3d'
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
  const [activeTab, setActiveTab] = useState('passes')
  const [copiedRegNo, setCopiedRegNo] = useState(false)

  // Generate high-resolution authentic Student ID Card texture for the 3D Lanyard
  const studentIdTexture = useMemo(() => {
    const s = session as any
    return generateStudentIDTexture({
      name: s?.name || 'Aditya Narayan',
      registrationNumber: s?.registrationNumber || '21BCE1042',
      degreeBranch: s?.degreeBranch || 'B.Tech Computer Science & Engineering',
      semester: s?.semester || 6,
      email: s?.email || 'aditya.narayan@vitstudent.ac.in',
      role: 'STUDENT PASSHOLDER',
      campus: 'CENTRAL UNIVERSITY CAMPUS',
    })
  }, [session])

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

      doc.setFillColor(251, 250, 248)
      doc.rect(0, 0, 297, 210, 'F')

      doc.setDrawColor(201, 62, 39)
      doc.setLineWidth(1.5)
      doc.rect(12, 12, 273, 186)

      doc.setDrawColor(231, 228, 222)
      doc.setLineWidth(0.5)
      doc.rect(15, 15, 267, 180)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(94, 90, 85)
      doc.text('EVENTMESH · VERIFIABLE DIGITAL CREDENTIAL', 148.5, 36, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(26)
      doc.setTextColor(27, 26, 25)
      doc.text('CERTIFICATE OF PARTICIPATION', 148.5, 52, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(13)
      doc.setTextColor(94, 90, 85)
      doc.text('This document certifies that', 148.5, 75, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.setTextColor(201, 62, 39)
      doc.text(cert.recipientName.toUpperCase(), 148.5, 92, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(13)
      doc.setTextColor(94, 90, 85)
      doc.text('has successfully completed', 148.5, 108, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(27, 26, 25)
      doc.text(cert.eventTitle.toUpperCase(), 148.5, 122, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text(`Organized by ${cert.organizerName}`, 148.5, 134, { align: 'center' })

      doc.save(`${cert.certificateId}.pdf`)
      fireCelebrationConfetti()

      toast({
        title: 'Certificate downloaded',
        message: `Saved ${cert.certificateId}.pdf`,
        type: 'success',
      })
    } catch (err) {
      toast({ title: 'Download failed', type: 'error' })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container py-16 flex items-center justify-center">
        <div className="max-w-md w-full bg-surface border border-line rounded-panel p-8 text-center space-y-4">
          <h2 className="text-xl font-semibold text-text">Sign in required</h2>
          <p className="text-small text-text-2">
            Sign in to access your digital entry passes, credentials, and followed clubs.
          </p>
          <Link to="/login">
            <Button variant="primary" size="default">Sign in</Button>
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'passes', label: 'My tickets', count: registrations.length },
    { id: 'certificates', label: 'Certificates', count: certificates.length },
    { id: 'clubs', label: 'Followed clubs', count: followedClubs.length },
  ]

  return (
    <div className="w-full bg-bg text-text pb-16">
      {/* Profile & Student ID Lanyard Credential Hero */}
      <div className="border-b border-line bg-surface">
        <div className="app-container py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left 7 cols: Academic Profile Card */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-wider bg-accent-soft text-accent uppercase border border-accent/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                    OFFICIAL STUDENT IDENTITY
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Verified Campus Passholder
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
                  {session?.name || 'Aditya Narayan'}
                </h1>
                <p className="text-small text-text-2">
                  {session?.email || 'aditya.narayan@vitstudent.ac.in'}
                </p>
              </div>

              {/* Student Metadata Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-small">
                <div className="p-3.5 rounded-xl bg-subtle border border-line flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-text-3">REGISTRATION NUMBER</p>
                    <p className="font-mono font-bold text-base text-text mt-0.5">
                      {(session as any)?.registrationNumber || '21BCE1042'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const regNum = (session as any)?.registrationNumber || '21BCE1042'
                      navigator.clipboard.writeText(regNum)
                      setCopiedRegNo(true)
                      setTimeout(() => setCopiedRegNo(false), 2000)
                      toast({ title: 'Copied ID', message: 'Registration number copied to clipboard', type: 'info' })
                    }}
                    className="p-1.5 rounded-lg border border-line hover:bg-surface text-text-2 transition-colors"
                    title="Copy registration number"
                  >
                    {copiedRegNo ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-subtle border border-line">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-text-3">DEGREE & BRANCH</p>
                  <p className="font-semibold text-text text-small truncate mt-0.5">
                    {(session as any)?.degreeBranch || 'B.Tech Computer Science'}
                  </p>
                  <p className="text-caption text-text-3">Semester {(session as any)?.semester || 6} · Active Student</p>
                </div>
              </div>

              {/* Summary Metric Counters */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="px-4 py-2.5 rounded-xl bg-subtle border border-line text-center min-w-[90px] flex-1 sm:flex-none">
                  <p className="font-bold text-xl text-text">{registrations.length}</p>
                  <p className="text-caption text-text-2">Active Passes</p>
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-subtle border border-line text-center min-w-[90px] flex-1 sm:flex-none">
                  <p className="font-bold text-xl text-emerald-600">
                    {registrations.filter((r) => r.status === 'checked_in').length}
                  </p>
                  <p className="text-caption text-text-2">Attended & Verified</p>
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-subtle border border-line text-center min-w-[90px] flex-1 sm:flex-none">
                  <p className="font-bold text-xl text-text">{certificates.length}</p>
                  <p className="text-caption text-text-2">Credentials Issued</p>
                </div>
              </div>
            </div>

            {/* Right 5 cols: 3D Hanging Student ID Lanyard Stage */}
            <div className="lg:col-span-5">
              <div className="relative w-full h-[360px] sm:h-[390px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#141126] via-[#0C0A1A] to-[#080612] border border-white/10 shadow-2xl flex items-center justify-center">
                <Lanyard
                  frontImage={studentIdTexture}
                  cardColor="#120F24"
                  finish="holographic"
                  orientation="portrait"
                  strapColor="#5E4AE3"
                  size={0.86}
                  intro={false}
                  breeze={0.06}
                />

                {/* Physics Prompt Pill */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-[#0C0A1A]/90 backdrop-blur-md border border-white/15 text-[11px] font-medium text-slate-300 shadow-xl pointer-events-none flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Interactive 3D Student ID Badge · Drag to swing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="app-container">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      <div className="app-container py-8">
        {/* TAB 1: PASSES */}
        {activeTab === 'passes' && (
          <div>
            {regsLoading ? (
              <p className="text-small text-text-2">Loading passes...</p>
            ) : registrations.length === 0 ? (
              <EmptyState
                title="No active passes"
                description="You have not registered for any upcoming events yet."
                actionLabel="Explore events"
                onAction={() => window.location.assign('/explore')}
              />
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
              <p className="text-small text-text-2">Loading certificates...</p>
            ) : certificates.length === 0 ? (
              <EmptyState
                title="No certificates issued"
                description="Certificates are granted upon verified completion of workshops and hackathons."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-surface border border-line rounded-panel p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-accent" />
                        <span className="font-semibold text-small text-text">Certificate</span>
                      </div>
                      <span className="font-mono text-caption text-text-3">
                        {cert.certificateId}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-small text-text">{cert.eventTitle}</h4>
                      <p className="text-caption text-text-2 mt-0.5">
                        Issued {formatDate(cert.issuedAt)} by {cert.organizerName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-line">
                      <Button
                        variant="secondary"
                        size="compact"
                        fullWidth
                        icon={<Download className="h-4 w-4" />}
                        onClick={() => downloadCertificatePDF(cert)}
                      >
                        Download PDF
                      </Button>
                      <Link to={`/verify/${cert.certificateId}`}>
                        <Button variant="tertiary" size="compact">
                          Verify
                        </Button>
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
              <EmptyState
                title="No followed clubs"
                description="Follow clubs to receive immediate updates about their new events."
                actionLabel="Explore clubs"
                onAction={() => window.location.assign('/clubs')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {followedClubs.map((club) => (
                  <Link
                    key={club.id}
                    to={`/clubs/${club.slug}`}
                    className="flex items-center gap-3 p-4 rounded-[10px] bg-surface border border-line hover:border-text-3 transition-colors"
                  >
                    <span
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: club.color || '#C93E27' }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-small text-text truncate">{club.name}</h4>
                      <p className="text-caption text-text-2 truncate">{club.joinMode ? club.joinMode.replace('_', ' ') : 'Collective'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Digital Entry Pass Inspection Modal */}
      {selectedTicket && (
        <Modal
          isOpen={Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
          title="Event Admission Pass"
          subtitle={`PASS-${selectedTicket.id.slice(0, 8).toUpperCase()}`}
          maxWidth="max-w-2xl"
          surface="dark"
        >
          <div className="space-y-4">
            <EventAdmissionTicket
              registration={selectedTicket}
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

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="default"
                fullWidth
                onClick={() => setSelectedTicket(null)}
                className="bg-white/10 border-white/15 text-white hover:bg-white/20"
              >
                Close Pass
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
