import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Buildings,
  ShieldCheck,
  CheckCircle,
  GraduationCap,
  Users,
  CalendarBlank,
  ArrowRight,
  MapPin,
  Sparkle,
  IdentificationBadge,
} from '@phosphor-icons/react'
import { PageShell } from '@/design-system/layout/PageShell'
import { SectionHeader } from '@/design-system/SectionHeader'
import { Badge } from '@/design-system/primitives/Badge'
import { Button } from '@/design-system/primitives/Button'
import { BellToggle } from '@/design-system/micro/BellToggle'
import { useToast } from '@/design-system/primitives/Toast'
import { useOrg } from '@/hooks/useOrg'
import { useClubs, useToggleFollowClub } from '@/hooks/useClubs'
import { useEvents } from '@/hooks/useEvents'
import { useAuth } from '@/hooks/useAuth'
import { FALLBACK_CLUBS } from '@/data/heroFallbacks'
import { formatDate, formatTime } from '@/lib/format'

export const MyCollegePage: React.FC = () => {
  const { organization, isLoading: orgLoading } = useOrg()
  const { data: clubs = [], isLoading: clubsLoading } = useClubs()
  const { data: eventsData } = useEvents()
  const { session } = useAuth()
  const toggleFollowMutation = useToggleFollowClub()
  const { toast } = useToast()

  const [rollNumber, setRollNumber] = useState(
    session?.registrationNumber || 'CTU-2026-0814'
  )
  const [degreeBranch, setDegreeBranch] = useState(
    session?.degreeBranch || 'B.Tech Computer Science & Engineering'
  )
  const [semester, setSemester] = useState('6th Semester')
  const [isVerified, setIsVerified] = useState(true)

  const displayClubs = clubs.length > 0 ? clubs : FALLBACK_CLUBS

  // Campus-specific events
  const campusEvents = (eventsData?.items || []).slice(0, 3)

  const handleVerifyStudent = (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerified(true)
    toast({
      title: 'Campus Credential Verified',
      message: `${rollNumber} authenticated with CTU Academic Registrar.`,
      type: 'success',
    })
  }

  const handleToggleFollow = async (clubId: string, clubName: string) => {
    try {
      const isNowFollowed = await toggleFollowMutation.mutateAsync(clubId)
      toast({
        title: isNowFollowed ? `Subscribed to ${clubName}` : `Unfollowed ${clubName}`,
        message: isNowFollowed
          ? 'You will receive priority updates for campus workshops & hackathons.'
          : 'You will no longer receive notification alerts from this society.',
        type: 'info',
      })
    } catch {
      toast({ title: 'Action failed', type: 'error' })
    }
  }

  return (
    <PageShell className="py-8 sm:py-12 space-y-12">
      {/* 1. Institutional Hero & University Identity */}
      <section className="relative overflow-hidden rounded-[16px] border border-line bg-card p-6 sm:p-10 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            {/* Minimal Accreditation Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-mono font-bold uppercase tracking-wider bg-accent text-white">
                <ShieldCheck size={14} weight="bold" />
                NAAC A++ Accredited
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-mono font-semibold uppercase tracking-wider bg-surface-subtle border border-line text-ink">
                Autonomous Technical Campus
              </span>
            </div>

            {/* University Name & Dean Note */}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-ink">
                {organization?.name || 'Central Technological University'}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-ink-soft leading-relaxed">
                {organization?.tagline ||
                  'Autonomous Premier Engineering & Research Institution. Bangalore, Karnataka.'}
              </p>
            </div>

            {/* Location & Academic Leadership */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-ink-muted pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-accent" weight="bold" />
                <span>Turing Boulevard, Cyber City Sector 4, Bangalore</span>
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap size={14} className="text-accent" weight="bold" />
                <span>Dr. Vikramaditya Sen, Ph.D. (Director & Academic Chair)</span>
              </span>
            </div>
          </div>

          {/* Quick Institutional Stats Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-[14px] bg-surface-subtle/80 border border-line/80 shrink-0">
            <div className="p-3 rounded-[10px] bg-card border border-line/60 text-center">
              <p className="text-xl font-mono font-bold text-ink">4,500+</p>
              <p className="text-[11px] font-mono text-ink-muted uppercase tracking-wider mt-0.5">Scholars</p>
            </div>
            <div className="p-3 rounded-[10px] bg-card border border-line/60 text-center">
              <p className="text-xl font-mono font-bold text-accent">3</p>
              <p className="text-[11px] font-mono text-ink-muted uppercase tracking-wider mt-0.5">Societies</p>
            </div>
            <div className="p-3 rounded-[10px] bg-card border border-line/60 text-center col-span-2 sm:col-span-1">
              <p className="text-xl font-mono font-bold text-ink">14</p>
              <p className="text-[11px] font-mono text-ink-muted uppercase tracking-wider mt-0.5">Research Labs</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. College Student Registration & Verification Station */}
      <section className="rounded-[16px] border border-line bg-card p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2">
              <IdentificationBadge size={18} className="text-accent" weight="bold" />
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-ink">
                Campus Student Verification & Registry
              </h2>
            </div>
            <p className="text-xs text-ink-soft mt-1">
              Authenticate your student credentials to unlock autonomous pass tiers, campus access, and guild voting rights.
            </p>
          </div>

          {isVerified && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-success/10 text-success border border-success/30 shrink-0">
              <CheckCircle size={15} weight="fill" />
              Verified Campus Passholder
            </span>
          )}
        </div>

        <form onSubmit={handleVerifyStudent} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-ink-muted">
              CTU University Roll Number
            </label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-[10px] border border-line bg-surface-subtle font-mono text-xs font-medium text-ink focus:outline-none focus:border-accent"
              placeholder="e.g. CTU-2026-0814"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-ink-muted">
              Academic Department & Branch
            </label>
            <input
              type="text"
              value={degreeBranch}
              onChange={(e) => setDegreeBranch(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-[10px] border border-line bg-surface-subtle font-sans text-xs font-medium text-ink focus:outline-none focus:border-accent"
              placeholder="e.g. B.Tech Computer Science"
            />
          </div>

          <div className="space-y-1.5 flex flex-col justify-end">
            <button
              type="submit"
              className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-[10px] bg-ink hover:bg-ink-soft text-paper text-xs font-bold font-mono tracking-wider uppercase active:scale-[0.98] transition-all shadow-xs"
            >
              <CheckCircle size={14} weight="bold" />
              <span>Update Registration</span>
            </button>
          </div>
        </form>
      </section>

      {/* 3. The Strictly 3 Campus Student Societies */}
      <section className="space-y-6">
        <SectionHeader
          badge="CAMPUS GUILDS"
          title="Student Societies & Specialized Labs"
          subtitle="Autonomous engineering and creative bodies operating within CTU. Follow societies for priority invitations and workshop seats."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayClubs.map((club) => {
            const isFollowed = Boolean(club.isFollowed)
            const initials = club.name
              .split(' ')
              .map((w: string) => w[0])
              .join('')
              .slice(0, 3)
              .toUpperCase()

            return (
              <div
                key={club.id}
                className="flex flex-col justify-between rounded-[16px] border border-line bg-card p-6 hover:border-accent/50 transition-all shadow-xs hover:shadow-md select-none group"
              >
                <div className="space-y-4">
                  {/* Top Bar: Monogram & Follow Toggle */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-[10px] text-white font-bold font-mono text-xs flex items-center justify-center shadow-xs"
                        style={{ backgroundColor: club.color || '#7C3AED' }}
                      >
                        {initials}
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                        {club.followersCount || 200} Members
                      </span>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <BellToggle
                        pressed={isFollowed}
                        onChange={() => handleToggleFollow(club.id, club.name)}
                        size="sm"
                        onLabel="Subscribed"
                        offLabel="Follow"
                        badge={false}
                      />
                    </div>
                  </div>

                  {/* Club Title & Overview */}
                  <div>
                    <Link
                      to={`/clubs/${club.slug}`}
                      className="font-display font-bold text-lg text-ink hover:text-accent transition-colors line-clamp-1"
                    >
                      {club.name}
                    </Link>
                    <p className="mt-1.5 text-xs text-ink-soft leading-relaxed line-clamp-3">
                      {club.about}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Detail Link */}
                <div className="pt-4 mt-4 border-t border-line/60 flex items-center justify-between">
                  <Link
                    to={`/clubs/${club.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                  >
                    <span>View Guild Profile</span>
                    <ArrowRight size={13} weight="bold" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. On-Campus Activities & Inter-Club Calendar Feed */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-ink">
              Upcoming Campus Activities
            </h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Workshops, review panels, and hackathons hosted on university premises.
            </p>
          </div>
          <Link
            to="/calendar"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline self-start sm:self-auto"
          >
            <span>Open Complete University Calendar →</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {campusEvents.map((evt) => (
            <div
              key={evt.id}
              className="rounded-[14px] border border-line bg-card p-5 space-y-3 hover:border-accent/40 transition-colors shadow-xs"
            >
              <div className="flex items-center justify-between text-xs font-mono text-ink-muted">
                <span className="text-accent font-semibold">{evt.category?.toUpperCase() || 'WORKSHOP'}</span>
                <span>{formatDate(evt.startsAt)}</span>
              </div>
              <h3 className="font-display font-bold text-base text-ink line-clamp-1">
                {evt.title}
              </h3>
              <p className="text-xs text-ink-soft flex items-center gap-1.5 truncate">
                <MapPin size={13} className="text-accent shrink-0" weight="bold" />
                <span>{evt.venue?.name || 'CTU Main Auditorium'}</span>
              </p>
              <div className="pt-2">
                <Link
                  to={`/events/${evt.slug || evt.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-ink hover:text-accent"
                >
                  <span>Event Details</span>
                  <ArrowRight size={12} weight="bold" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
