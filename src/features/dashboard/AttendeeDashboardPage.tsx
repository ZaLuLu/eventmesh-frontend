import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { Ticket, Award, Download, QrCode } from 'lucide-react'
import { useMyRegistrations, useCancelRegistration } from '@/hooks/useRegistrations'
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
import { Lanyard } from '@/design-system/3d/Lanyard'
import { TearTicket } from '@/design-system/micro/TearTicket'
import { CodeSlots } from '@/design-system/micro/CodeSlots'

export const AttendeeDashboardPage: React.FC = () => {
  const { session, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { data: registrations = [], isLoading: regsLoading } = useMyRegistrations()
  const { data: certificates = [], isLoading: certsLoading } = useMyCertificates()
  const { data: clubs = [] } = useClubs()
  const cancelMutation = useCancelRegistration()

  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null)
  const [activeTab, setActiveTab] = useState('passes')
  const [passView, setPassView] = useState<'lanyard' | 'tear' | 'barcode'>('lanyard')
  const [isTorn, setIsTorn] = useState(false)

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
      {/* Header Strip */}
      <div className="border-b border-line bg-surface">
        <div className="app-container py-6 sm:py-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text tracking-tight">
              My tickets & account
            </h1>
            <p className="text-small text-text-2 mt-1">
              {session?.name} · {session?.email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-[10px] bg-subtle border border-line text-center min-w-[90px]">
              <p className="font-semibold text-lg text-text">{registrations.length}</p>
              <p className="text-caption text-text-2">Passes</p>
            </div>
            <div className="px-4 py-2.5 rounded-[10px] bg-subtle border border-line text-center min-w-[90px]">
              <p className="font-semibold text-lg text-text">
                {registrations.filter((r) => r.status === 'checked_in').length}
              </p>
              <p className="text-caption text-text-2">Attended</p>
            </div>
            <div className="px-4 py-2.5 rounded-[10px] bg-subtle border border-line text-center min-w-[90px]">
              <p className="font-semibold text-lg text-text">{certificates.length}</p>
              <p className="text-caption text-text-2">Credentials</p>
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
          onClose={() => {
            setSelectedTicket(null)
            setIsTorn(false)
          }}
          title="Digital Admission Credentials"
          subtitle={`PASS-${selectedTicket.id.slice(0, 8).toUpperCase()}`}
          maxWidth="max-w-2xl"
          surface="dark"
        >
          <div className="space-y-5">
            {/* Pass Mode Switcher */}
            <div className="flex items-center justify-center p-1 bg-white/5 border border-white/10 rounded-xl">
              <button
                type="button"
                onClick={() => setPassView('lanyard')}
                className={`flex-1 py-1.5 px-3 text-caption font-semibold rounded-lg transition-all ${
                  passView === 'lanyard'
                    ? 'bg-white/15 text-white shadow-sm border border-white/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📇 3D Lanyard Pass
              </button>
              <button
                type="button"
                onClick={() => setPassView('tear')}
                className={`flex-1 py-1.5 px-3 text-caption font-semibold rounded-lg transition-all ${
                  passView === 'tear'
                    ? 'bg-white/15 text-white shadow-sm border border-white/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎫 Perforated Stub
              </button>
              <button
                type="button"
                onClick={() => setPassView('barcode')}
                className={`flex-1 py-1.5 px-3 text-caption font-semibold rounded-lg transition-all ${
                  passView === 'barcode'
                    ? 'bg-white/15 text-white shadow-sm border border-white/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📱 QR & Gate OTP
              </button>
            </div>

            {/* Mode 1: 3D Physics Lanyard Pass */}
            {passView === 'lanyard' && (
              <div className="space-y-4">
                <div className="relative w-full h-[400px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#141126] via-[#0C0A1A] to-[#080612] border border-white/10 flex items-center justify-center shadow-inner">
                  <Lanyard
                    cardColor="#141026"
                    finish="holographic"
                    orientation="portrait"
                    strapColor="#6366f1"
                    size={0.9}
                  />

                  {/* Physics Drag Indicator Pill */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-[#0C0A1A]/85 backdrop-blur-md border border-white/15 text-[11px] font-medium text-slate-300 shadow-xl pointer-events-none flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Drag lanyard to swing with Three.js physics</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-small text-white">{selectedTicket.eventTitle}</h4>
                    <p className="text-caption text-slate-400">
                      {formatDate(selectedTicket.eventStartsAt || selectedTicket.createdAt, 'EEE, MMM d, yyyy')} · {selectedTicket.venueName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider bg-accent/20 text-indigo-300 border border-accent/30 uppercase">
                      VIP PASS
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: Perforated Tear Ticket Stub */}
            {passView === 'tear' && (
              <div className="space-y-4 flex flex-col items-center">
                <div className="py-2 w-full flex justify-center overflow-hidden">
                  <TearTicket
                    width={480}
                    height={200}
                    stubSize={130}
                    radius={16}
                    holes={9}
                    notch={10}
                    torn={isTorn}
                    onTear={() => {
                      setIsTorn(true)
                      fireCelebrationConfetti()
                      toast({
                        title: 'Stub Detached & Validated!',
                        message: 'Gate stub torn successfully. Admission confirmed.',
                        type: 'success',
                      })
                    }}
                    background="#141126"
                    color="#F8FAFC"
                    borderColor="rgba(255,255,255,0.15)"
                    stub={
                      <div className="h-full flex flex-col justify-between items-center text-center p-3 font-mono bg-[#0C0A1A]/90">
                        <div className="text-[10px] tracking-widest text-indigo-400 font-bold uppercase">
                          GATE STUB
                        </div>
                        <div className="my-auto space-y-1">
                          <p className="text-[11px] font-bold text-white">
                            PASS-{selectedTicket.id.slice(0, 6).toUpperCase()}
                          </p>
                          <p className="text-[9px] text-slate-400 uppercase tracking-wider">
                            {isTorn ? 'VALIDATED ✓' : 'DRAG TO TEAR ✂️'}
                          </p>
                        </div>
                        <div className="text-[9px] text-slate-400 border-t border-dashed border-white/10 pt-1 w-full">
                          CAMPUS ACCESS
                        </div>
                      </div>
                    }
                  >
                    <div className="h-full p-4 flex flex-col justify-between bg-[#141126] text-white">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-accent/25 text-indigo-300 font-bold border border-accent/30">
                            EVENTMESH OFFICIAL PASS
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            SEAT GENERAL
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-white mt-2 line-clamp-1">
                          {selectedTicket.eventTitle}
                        </h4>
                        <p className="text-caption text-slate-400 mt-0.5">
                          {formatDate(selectedTicket.eventStartsAt || selectedTicket.createdAt, 'EEE, MMM d, yyyy')} · {selectedTicket.venueName}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-slate-400">ATTENDEE</p>
                          <p className="text-caption font-semibold text-white">{session?.name || 'Registered Guest'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] uppercase tracking-wider text-slate-400">OTP CHECK-IN</p>
                          <p className="text-caption font-mono font-bold text-indigo-300">074218</p>
                        </div>
                      </div>
                    </div>
                  </TearTicket>
                </div>

                <p className="text-caption text-slate-400 text-center">
                  Drag or pull the right stub downwards to tear your admission pass and simulate gate check-in.
                </p>
              </div>
            )}

            {/* Mode 3: QR Code & Live Rotating CodeSlots */}
            {passView === 'barcode' && (
              <div className="text-center space-y-4">
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="p-3 bg-white rounded-xl shadow-2xl mb-4">
                    <QRCode value={`PASS-${selectedTicket.id}`} size={180} />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      Dynamic 6-Digit Gate OTP
                    </p>
                    <div className="flex items-center justify-center pt-1">
                      <CodeSlots
                        value="074218"
                        length={6}
                        status="success"
                        slotSize={40}
                        radius={8}
                        gap={8}
                        className="bg-[#0C0A1A] border border-white/15 px-3 py-1 rounded-xl text-white"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-caption text-slate-400">
                  Present this QR code or 6-digit rolling OTP at the registration kiosk terminal.
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="default"
                fullWidth
                onClick={() => {
                  setSelectedTicket(null)
                  setIsTorn(false)
                }}
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
