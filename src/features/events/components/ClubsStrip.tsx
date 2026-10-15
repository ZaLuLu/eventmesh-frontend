import React from 'react'
import { Link } from 'react-router-dom'
import { Check, Bell } from '@/design-system/Icon'
import { useClubs, useToggleFollowClub } from '@/hooks/useClubs'

export const ClubsStrip: React.FC = () => {
  const { data: clubs = [], isLoading, isError, refetch } = useClubs()
  const follow = useToggleFollowClub()
  if (isLoading) return <p role="status" className="text-sm text-ink-soft">Loading organizers…</p>
  if (isError) return <p role="alert" className="text-sm text-ink-soft">Organizers could not be loaded. <button type="button" onClick={() => { void refetch() }} className="text-accent underline">Try again</button></p>
  if (!clubs.length) return <p className="text-sm text-ink-soft">No organizers to show yet.</p>

  return <>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {clubs.map((club) => <article key={club.id} className="rounded-panel border border-line bg-card p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs text-ink-muted">{club.followersCount == null ? 'Followers unavailable' : `${club.followersCount} followers`}</span>
          <button type="button" onClick={() => follow.mutate(club.id)} disabled={follow.isPending}
            aria-pressed={Boolean(club.isFollowed)} aria-label={`${club.isFollowed ? 'Following' : 'Follow'} ${club.name}`}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-input px-3 text-xs font-medium disabled:opacity-50 ${club.isFollowed ? 'bg-[var(--color-success-soft)] text-success' : 'bg-surface-subtle text-ink-soft hover:bg-accent-soft hover:text-accent'}`}>
            {club.isFollowed ? <Check size={14} aria-hidden="true" /> : <Bell size={14} aria-hidden="true" />}
            {follow.isPending && follow.variables === club.id ? 'Updating…' : club.isFollowed ? 'Following' : 'Follow'}
          </button>
        </div>
        <h3 className="text-base font-semibold text-ink"><Link to={`/clubs/${club.slug || club.id}`} className="hover:text-accent">{club.name}</Link></h3>
        {(club.about || club.whatWeDo) && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{club.about || club.whatWeDo}</p>}
      </article>)}
    </div>
    {follow.isError && <p role="alert" className="text-sm text-danger">Your follow preference could not be saved. Please try again.</p>}
  </>
}
