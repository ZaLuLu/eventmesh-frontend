import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { Ticket, Award, Calendar, CheckCircle2, Download, ExternalLink, QrCode } from 'lucide-react'
import { useMyRegistrations, useCancelRegistration } from '@/hooks/useRegistrations'
import { useMyCertificates } from '@/hooks/useCertificates'
import { useClubs } from '@/hooks/useClubs'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/design-system/primitives/Button'
import { QRCode } from '@/design-system/primitives/QRCode'
import { Modal } from '@/design-system/primitives/Modal'
import { formatDate, formatTime } from '@/lib/dates'
import { Registration, Certificate } from '@/api'
import { useToast } from '@/design-system/primitives/Toast'

export const AttendeeDashboardPage: React.FC = () => {
  const { session, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { data: registrations = [], isLoading: regsLoading } = useMyRegistrations()
  const { data: certificates = [], isLoading: certsLoading } = useMyCertificates()
  const { data: clubs = [] } = useClubs()
  const cancelMutation = useCancelRegistration()

  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null)
  const [activeTab, setActiveTab] = useState<'passes' | 'certificates' | 'clubs'>('passes')

  const handleCancelPass = async (reg: Registration) => {
    if (window.confirm('Are you sure you want to cancel this entry pass reservation?')) {
      try {
        await cancelMutation.mutateAsync(reg.eventSlug || reg.eventId)
        setSelectedTicket(null)
        toast({
          title: 'Pass Cancelled',
          message: 'Your registration was cancelled and the spot has been returned to the pool.',
          type: 'info',
        })
      } catch (err: any) {
        toast({
          title: 'Cancellation Failed',
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

      // Paper background
      doc.setFillColor(248, 249, 250) // #F8F9FA
      doc.rect(0, 0, 297, 210, 'F')

      // Google Blue border
      doc.setDrawColor(26, 115, 232) // #1A73E8
      doc.setLineWidth(1.5)
      doc.rect(12, 12, 273, 186)

      // Inner thin rule
      doc.setDrawColor(218, 220, 224) // #DADCE0
      doc.setLineWidth(0.5)
      doc.rect(15, 15, 267, 180)

      // Header
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(95, 99, 104)
      doc.text('EVENTMESH · VERIFIABLE DIGITAL CREDENTIAL', 148.5, 36, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(26)
      doc.setTextColor(31, 31, 31)
      doc.text('CERTIFICATE OF PARTICIPATION', 148.5, 52, { align: 'center' })

      // Body text
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(13)
      doc.setTextColor(95, 99, 104)
      doc.text('This document certifies that', 148.5, 75, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.setTextColor(26, 115, 232)
      doc.text(cert.recipientName.toUpperCase(), 148.5, 92, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(13)
      doc.setTextColor(95, 99, 104)
      doc.text(
        `has successfully participated and completed`,
        148.5,
        108,
        { align: 'center' }
      )

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(31, 31, 31)
      doc.text(cert.eventTitle.toUpperCase(), 148.5, 122, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text(
        `Organized by ${cert.organizerName}`,
        148.5,
        134,
        { align: 'center' }
      )

      // Metadata footer
      doc.setDrawColor(218, 220, 224)
      doc.setLineWidth(0.5)
      doc.line(30, 155, 267, 155)

      doc.setFontSize(9)
      doc.text(`CERTIFICATE ID: ${cert.certificateId}`, 30, 166)
      doc.text(`ISSUED AT: ${formatDate(cert.issuedAt)}`, 30, 174)
      doc.text(`VERIFY URL: ${cert.verifyUrl}`, 30, 182)

      doc.save(`${cert.certificateId}.pdf`)

      toast({
        title: 'PDF Certificate Downloaded',
        message: `Saved ${cert.certificateId} to local drive.`,
        type: 'success',
      })
    } catch (err) {
      console.error('PDF generation error:', err)
      toast({ title: 'Download failed', type: 'error' })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-4 rounded-3xl bg-white border border-[#DADCE0] p-8 shadow-card-hover">
          <h2 className="font-display text-2xl font-bold text-slate-900">Sign In Required</h2>
          <p className="font-body text-xs text-slate-500">
            Please sign in to view your verified entry passes, digital credentials, and followed clubs.
          </p>
          <Link to="/login">
            <Button size="md" variant="primary" arrow>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-canvas text-md-on-surface min-h-screen pb-16">
      {/* Header */}
      <div className="bg-white border-b border-[#DADCE0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-semibold text-md-primary block mb-1">
              Attendee Account
            </span>
            <h1 className="font-display font-bold text-2xl sm:text-4xl text-slate-900 tracking-tight">
              {session?.name || 'My Profile'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {session?.email} · {session?.role.replace('_', ' ').toUpperCase()}
            </p>
          </div>

          {/* Quick summary stats */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-md-primary-container border border-[#D3E3FD] text-center min-w-[90px]">
              <p className="font-bold text-xl text-md-primary">{registrations.length}</p>
              <p className="text-[10px] font-semibold text-md-on-primary-container">Passes</p>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-[#E6F4EA] border border-[#CEEAD6] text-center min-w-[90px]">
              <p className="font-bold text-xl text-[#137333]">
                {registrations.filter((r) => r.status === 'checked_in').length}
              </p>
              <p className="text-[10px] font-semibold text-[#137333]">Attended</p>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-[#FEF7E0] border border-[#FEEFC3] text-center min-w-[90px]">
              <p className="font-bold text-xl text-[#B06000]">{certificates.length}</p>
              <p className="text-[10px] font-semibold text-[#B06000]">Credentials</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('passes')}
            className={`py-3.5 px-4 text-xs font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'passes'
                ? 'border-md-primary text-md-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Ticket className="h-4 w-4" />
            <span>Entry Passes ({registrations.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('certificates')}
            className={`py-3.5 px-4 text-xs font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'certificates'
                ? 'border-md-primary text-md-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Certificates ({certificates.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('clubs')}
            className={`py-3.5 px-4 text-xs font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'clubs'
                ? 'border-md-primary text-md-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Followed Clubs ({followedClubs.length})</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT: PASSES */}
      {activeTab === 'passes' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {regsLoading ? (
            <p className="text-xs text-slate-500">Loading entry passes...</p>
          ) : registrations.length === 0 ? (
            <div className="rounded-2xl border border-[#DADCE0] bg-white p-12 text-center max-w-md mx-auto space-y-4">
              <Ticket className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No active passes found</p>
              <p className="text-xs text-slate-500">
                Explore our upcoming events to reserve your free pass.
              </p>
              <Link to="/explore">
                <Button size="sm" variant="primary">Explore Events</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="rounded-2xl border border-[#DADCE0] bg-white p-6 shadow-subtle hover:shadow-card-hover transition-all flex flex-col justify-between space-y-5"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-bold text-slate-800">{reg.ticketCode}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          reg.status === 'checked_in'
                            ? 'bg-[#E6F4EA] text-[#137333]'
                            : 'bg-md-primary-container text-md-primary'
                        }`}
                      >
                        {reg.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-slate-900 line-clamp-2">
                      {reg.eventTitle}
                    </h3>

                    {reg.eventStartsAt && (
                      <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-md-primary" />
                        <span>{formatDate(reg.eventStartsAt)}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#DADCE0] flex items-center justify-between">
                    <Button
                      size="sm"
                      variant="primary"
                      icon={<QrCode className="h-3.5 w-3.5" />}
                      onClick={() => setSelectedTicket(reg)}
                    >
                      Show QR Pass
                    </Button>
                    <Link
                      to={`/events/${reg.eventSlug}`}
                      className="text-xs font-semibold text-md-primary hover:underline"
                    >
                      Event Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {certsLoading ? (
            <p className="text-xs text-slate-500">Loading certificates...</p>
          ) : certificates.length === 0 ? (
            <div className="rounded-2xl border border-[#DADCE0] bg-white p-12 text-center max-w-md mx-auto space-y-4">
              <Award className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No certificates issued yet</p>
              <p className="text-xs text-slate-500">
                Certificates are issued following verified event check-in and completion.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="rounded-2xl border border-[#DADCE0] bg-white p-6 shadow-subtle hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-md-primary">{cert.certificateId}</span>
                      <span className="text-slate-400">{formatDate(cert.issuedAt)}</span>
                    </div>

                    <h3 className="font-display font-bold text-base text-slate-900 line-clamp-2">
                      {cert.eventTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Issued to {cert.recipientName}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#DADCE0] flex items-center justify-between">
                    <Button
                      size="sm"
                      variant="primary"
                      icon={<Download className="h-3.5 w-3.5" />}
                      onClick={() => downloadCertificatePDF(cert)}
                    >
                      Download PDF
                    </Button>
                    <Link
                      to={`/verify/${cert.certificateId}`}
                      className="text-xs font-semibold text-md-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>Verify</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CLUBS */}
      {activeTab === 'clubs' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {followedClubs.length === 0 ? (
            <div className="rounded-2xl border border-[#DADCE0] bg-white p-12 text-center max-w-md mx-auto space-y-4">
              <p className="text-sm font-semibold text-slate-700">Not following any clubs yet</p>
              <p className="text-xs text-slate-500">
                Follow clubs to receive notifications whenever they host workshops or hackathons.
              </p>
              <Link to="/clubs">
                <Button size="sm" variant="primary">Browse Clubs</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followedClubs.map((club) => (
                <Link
                  key={club.id}
                  to={`/clubs/${club.slug}`}
                  className="rounded-2xl border border-[#DADCE0] bg-white p-6 shadow-subtle hover:shadow-card-hover transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: club.color || '#1A73E8' }}
                    >
                      {club.name.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{club.name}</h4>
                      <p className="text-xs text-slate-500">{club.followersCount} members</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-md-primary">View →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QR Ticket Pass Modal */}
      {selectedTicket && (
        <Modal
          isOpen={Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
          title="Digital Entry Pass"
        >
          <div className="space-y-6 text-center">
            <div className="p-4 rounded-2xl bg-white border border-[#DADCE0] inline-block shadow-subtle">
              <QRCode value={selectedTicket.ticketCode} size={180} />
            </div>

            <div>
              <p className="font-mono text-base font-bold text-slate-900 tracking-wider">
                {selectedTicket.ticketCode}
              </p>
              <h3 className="font-display font-bold text-lg text-slate-900 mt-2">
                {selectedTicket.eventTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Passholder: {selectedTicket.userName} ({selectedTicket.userEmail})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setSelectedTicket(null)}
              >
                Close Pass
              </Button>
              {selectedTicket.status !== 'cancelled' && (
                <Button
                  variant="danger"
                  size="md"
                  loading={cancelMutation.isPending}
                  onClick={() => handleCancelPass(selectedTicket)}
                >
                  Cancel Pass
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
