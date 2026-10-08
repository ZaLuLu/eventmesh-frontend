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
    <div className="w-full bg-canvas text-slate-900 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-[#EEF2F6] border-b border-white/70 shadow-neo-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-indigo-600 block mb-1">
              Attendee Account
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-900 tracking-tight">
              {session?.name || 'My Profile'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {session?.email} · {session?.role.replace('_', ' ').toUpperCase()}
            </p>
          </div>

          {/* Quick summary stats */}
          <div className="flex items-center gap-3">
            <div className="px-5 py-3 rounded-2xl neo-card border border-white/80 text-center min-w-[100px]">
              <p className="font-extrabold text-xl text-indigo-600">{registrations.length}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Passes</p>
            </div>
            <div className="px-5 py-3 rounded-2xl neo-card border border-white/80 text-center min-w-[100px]">
              <p className="font-extrabold text-xl text-emerald-600">
                {registrations.filter((r) => r.status === 'checked_in').length}
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Attended</p>
            </div>
            <div className="px-5 py-3 rounded-2xl neo-card border border-white/80 text-center min-w-[100px]">
              <p className="font-extrabold text-xl text-amber-600">{certificates.length}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Credentials</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2.5 pb-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('passes')}
            className={`py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'passes'
                ? 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white shadow-neo-sm'
                : 'neo-pill text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ticket className="h-4 w-4" />
            <span>Entry Passes ({registrations.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('certificates')}
            className={`py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'certificates'
                ? 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white shadow-neo-sm'
                : 'neo-pill text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Certificates ({certificates.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('clubs')}
            className={`py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'clubs'
                ? 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white shadow-neo-sm'
                : 'neo-pill text-slate-600 hover:text-slate-900'
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
            <div className="rounded-3xl neo-card p-12 text-center max-w-md mx-auto space-y-4 border border-white/80">
              <Ticket className="h-10 w-10 text-indigo-500 mx-auto" />
              <p className="text-base font-bold text-slate-800">No active passes found</p>
              <p className="text-xs text-slate-500 font-medium">
                Explore our upcoming events to reserve your free pass.
              </p>
              <Link to="/explore">
                <Button size="sm" variant="gradient">Explore Events</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="rounded-3xl neo-card p-6 shadow-neo-card hover:shadow-neo-card-hover transition-all flex flex-col justify-between space-y-5 border border-white/80"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-mono font-bold text-slate-800">{reg.ticketCode}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-2xs ${
                          reg.status === 'checked_in'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
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
                        <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                        <span>{formatDate(reg.eventStartsAt)}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
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
                      className="text-xs font-bold text-indigo-600 hover:underline"
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
            <div className="rounded-3xl neo-card p-12 text-center max-w-md mx-auto space-y-4 border border-white/80">
              <Award className="h-10 w-10 text-emerald-500 mx-auto" />
              <p className="text-base font-bold text-slate-800">No certificates issued yet</p>
              <p className="text-xs text-slate-500 font-medium">
                Certificates are issued following verified event check-in and completion.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="rounded-3xl neo-card p-6 shadow-neo-card hover:shadow-neo-card-hover transition-all flex flex-col justify-between space-y-4 border border-white/80"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-indigo-600">{cert.certificateId}</span>
                      <span className="text-slate-400 font-medium">{formatDate(cert.issuedAt)}</span>
                    </div>

                    <h3 className="font-display font-bold text-base text-slate-900 line-clamp-2">
                      {cert.eventTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Issued to {cert.recipientName}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
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
                      className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
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
            <div className="rounded-3xl neo-card p-12 text-center max-w-md mx-auto space-y-4 border border-white/80">
              <p className="text-base font-bold text-slate-800">Not following any clubs yet</p>
              <p className="text-xs text-slate-500 font-medium">
                Follow clubs to receive notifications whenever they host workshops or hackathons.
              </p>
              <Link to="/clubs">
                <Button size="sm" variant="gradient">Browse Clubs</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followedClubs.map((club) => (
                <Link
                  key={club.id}
                  to={`/clubs/${club.slug}`}
                  className="rounded-3xl neo-card p-6 shadow-neo-card hover:shadow-neo-card-hover transition-all flex items-center justify-between border border-white/80"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-neo-sm"
                      style={{ backgroundColor: club.color || '#6366F1' }}
                    >
                      {club.name.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{club.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{club.followersCount} members</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600">View →</span>
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
            <div className="p-4 rounded-3xl neo-inset inline-block">
              <div className="p-3 bg-white rounded-2xl border border-slate-200/60 shadow-neo-sm">
                <QRCode value={selectedTicket.ticketCode} size={180} />
              </div>
            </div>

            <div>
              <p className="font-mono text-base font-bold text-slate-900 tracking-wider">
                {selectedTicket.ticketCode}
              </p>
              <h3 className="font-display font-bold text-lg text-slate-900 mt-2">
                {selectedTicket.eventTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
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
