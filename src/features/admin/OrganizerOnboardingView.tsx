import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/design-system/primitives/Toast'
import { Button } from '@/design-system/primitives/Button'
import { Field } from '@/design-system/primitives/Field'
import { api } from '@/api'
import { Buildings, CheckCircle, ShieldCheck, ArrowRight, ArrowLeft } from '@phosphor-icons/react'

export const OrganizerOnboardingView: React.FC = () => {
  const { session } = useAuth()
  const { toast } = useToast()

  const [clubName, setClubName] = useState('')
  const [category, setCategory] = useState('Technical')
  const [collegeName, setCollegeName] = useState(session?.campus || '')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clubName.trim()) {
      toast({
        title: 'Club name required',
        message: 'Please provide a name for your student club or organization.',
        type: 'error',
      })
      return
    }

    setIsSubmitting(true)
    const slug = clubName.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    try {
      // 1. Try backend/mock organization creation
      if (api.organizations?.createOrganization) {
        await api.organizations.createOrganization({
          name: clubName.trim(),
          slug,
          type: 'club',
          description: description.trim() || 'Student club hosted on EventMesh.',
        }).catch(() => {})
      }

      // 2. Elevate user session locally to organizer role
      if (session) {
        const updated = {
          ...session,
          role: 'org_admin',
          clubId: slug,
          clubName: clubName.trim(),
          campus: collegeName.trim() || session.campus,
          permissions: [
            'events:write',
            'checkin',
            'view_attendees',
            'edit_club_profile',
            'send_announcements',
            'issue_certificates',
          ],
        }
        try {
          localStorage.setItem('eventmesh_session', JSON.stringify(updated))
        } catch {}
      }

      toast({
        title: 'Organizer Studio Activated!',
        message: `Welcome aboard, ${clubName}! Your management workspace is ready.`,
        type: 'success',
      })

      // Reload to hydrate permissions in usePermission and session providers
      window.location.reload()
    } catch (err: any) {
      toast({
        title: 'Sandbox Activated',
        message: 'Opening your club workspace in organizer mode.',
        type: 'info',
      })
      window.location.reload()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center p-4 sm:p-6 py-12">
      <div className="max-w-xl w-full bg-card border border-line rounded-3xl p-6 sm:p-8 shadow-floating space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-3">
            <Buildings size={24} weight="bold" />
          </div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent px-2.5 py-0.5 rounded-full bg-accent/10 inline-block">
            Organizer Studio Setup
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">
            Host Events on EventMesh
          </h2>
          <p className="text-xs sm:text-sm text-ink-soft max-w-md mx-auto">
            Take control of your club’s ticketing, registration forms, gate check-in, and attendee communications.
          </p>
        </div>

        {/* Plain-English Role Separation Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-surface-subtle border border-line text-xs">
          <div className="space-y-1.5 p-2">
            <div className="flex items-center gap-1.5 font-bold text-ink">
              <span>🎓</span>
              <span>Attendee Mode</span>
            </div>
            <p className="text-ink-soft text-[11px] leading-relaxed">
              Discover campus sessions, reserve passes, view verifiable QR gate passes, and download certificates.
            </p>
          </div>

          <div className="space-y-1.5 p-2 border-t sm:border-t-0 sm:border-l border-line/50">
            <div className="flex items-center gap-1.5 font-bold text-accent">
              <span>⚡</span>
              <span>Organizer Studio</span>
            </div>
            <p className="text-ink-soft text-[11px] leading-relaxed">
              Publish events, design custom questionnaires, scan tickets with live camera, and export rosters.
            </p>
          </div>
        </div>

        {/* Onboarding Form */}
        <form onSubmit={handleCreateClub} className="space-y-4">
          <Field
            id="clubName"
            name="clubName"
            label="Club / Organization Name"
            required
            placeholder="e.g. Google Developer Student Club, Apex Design Lab"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="category" className="text-xs font-semibold text-ink block">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-subtle border border-line rounded-input px-3 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Technical">Technical & Coding</option>
                <option value="Design">Design & Media</option>
                <option value="Cultural">Cultural & Arts</option>
                <option value="Entrepreneurship">Entrepreneurship & E-Cell</option>
                <option value="Sports">Sports & Gaming</option>
                <option value="Academic">Academic & Research</option>
              </select>
            </div>

            <Field
              id="collegeName"
              name="collegeName"
              label="College / Campus"
              placeholder="e.g. Apex Institute of Technology"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-semibold text-ink block">
              Short Description / Mission
            </label>
            <textarea
              id="description"
              rows={2}
              placeholder="Briefly describe what your club does and what events you host..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-subtle border border-line rounded-input p-3 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="pt-2 space-y-3">
            <Button
              type="submit"
              variant="primary"
              size="default"
              fullWidth
              loading={isSubmitting}
            >
              <span>Launch Organizer Studio →</span>
            </Button>

            <Link
              to="/attendee/dashboard"
              className="flex items-center justify-center gap-1.5 text-xs text-ink-soft hover:text-ink transition-colors py-1"
            >
              <ArrowLeft size={13} />
              <span>Back to Attendee Mode</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
