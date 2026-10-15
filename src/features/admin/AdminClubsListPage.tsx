// Hallmark macrostructure: AdminConsole-ClubsList
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Plus, X } from '@phosphor-icons/react'
import { useClubs } from '@/hooks/useClubs'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/api'
import { Button } from '@/design-system/primitives/Button'
import { useToast } from '@/design-system/primitives/Toast'
import { useQueryClient } from '@tanstack/react-query'

export const AdminClubsListPage: React.FC = () => {
  const { session } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: clubs = [], isLoading } = useClubs()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clubName, setClubName] = useState('')
  const [clubSlug, setClubSlug] = useState('')
  const [clubDescription, setClubDescription] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clubName.trim()) return

    setIsSubmitting(true)
    try {
      const parentSlug = session?.orgId || 'apex-institute-of-technology'
      if (api.organizations.createClub) {
        await api.organizations.createClub(parentSlug, {
          name: clubName.trim(),
          slug: clubSlug.trim() || clubName.toLowerCase().replace(/\s+/g, '-'),
          description: clubDescription.trim(),
          contact_email: contactEmail.trim() || `${clubName.toLowerCase().replace(/\s+/g, '')}@apex.edu`,
        })
      }
      toast({
        title: 'Club Affiliated',
        message: `"${clubName}" collective was registered under your campus institution.`,
        type: 'success',
      })
      setShowCreateModal(false)
      setClubName('')
      setClubSlug('')
      setClubDescription('')
      setContactEmail('')
      queryClient.invalidateQueries({ queryKey: ['clubs'] })
    } catch (err: any) {
      toast({
        title: 'Creation failed',
        message: err.detail || 'Unable to affiliate new club.',
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <span className="text-caption font-semibold text-accent block mb-0.5">
            Federation Governance
          </span>
          <h1 className="text-h2 font-semibold text-text">
            Member Collectives
          </h1>
          <p className="text-small text-text-2 mt-0.5">
            Overview of all affiliated engineering clubs and campus student societies.
          </p>
        </div>

        <Button
          surface="admin"
          size="sm"
          icon={<Plus size={16} weight="bold" />}
          onClick={() => setShowCreateModal(true)}
        >
          Affiliate New Club
        </Button>
      </div>

      <div className="bg-surface border border-line rounded-panel overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-line bg-subtle text-caption font-medium text-text-2 sticky top-0">
              <th className="py-3 px-4 font-semibold">Club / Identifier</th>
              <th className="py-3 px-4 font-semibold">Signature Token</th>
              <th className="py-3 px-4 font-semibold">Followers</th>
              <th className="py-3 px-4 font-semibold">Coordinators</th>
              <th className="py-3 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-small">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-small text-text-3">
                  Loading collectives...
                </td>
              </tr>
            ) : (
              clubs.map((c) => (
                <tr key={c.id} className="h-[52px] hover:bg-subtle/50 transition-colors">
                  <td className="py-2.5 px-4">
                    <p className="font-semibold text-text">{c.name}</p>
                    <p className="text-caption text-text-3 font-mono">{c.slug}</p>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-small">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ backgroundColor: c.color }} />
                      <span className="text-caption text-text-2">{c.color}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-text tabular-nums">
                    {c.followersCount}
                  </td>
                  <td className="py-2.5 px-4 text-small text-text-2">
                    {c.coordinators.map((lead) => lead.name).join(', ') || '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <Link
                      to={`/clubs/${c.slug}`}
                      target="_blank"
                      className="px-2.5 py-1 border border-line rounded-btn hover:bg-subtle inline-flex items-center gap-1 text-caption text-text transition-colors"
                    >
                      <span>Public</span>
                      <ArrowUpRight size={12} weight="bold" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Affiliate New Club Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface border border-line rounded-panel p-6 max-w-md w-full shadow-2xl space-y-4 text-text">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <span className="text-caption font-semibold text-accent block">
                  Federation Hierarchy
                </span>
                <h2 className="text-h3 font-semibold text-text">
                  Affiliate New Club
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-btn hover:bg-subtle text-text-3 hover:text-text transition-colors"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="space-y-3">
              <div>
                <label className="block text-caption font-semibold text-text mb-1">
                  Club / Collective Name *
                </label>
                <input
                  type="text"
                  required
                  value={clubName}
                  onChange={(e) => {
                    setClubName(e.target.value)
                    if (!clubSlug) {
                      setClubSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
                    }
                  }}
                  className="w-full bg-subtle text-text text-small px-3 py-1.5 border border-line rounded-btn focus:outline-none focus:border-accent"
                  placeholder="e.g. Apex Robotics Collective"
                />
              </div>

              <div>
                <label className="block text-caption font-semibold text-text mb-1">
                  URL Identifier (Slug) *
                </label>
                <input
                  type="text"
                  required
                  value={clubSlug}
                  onChange={(e) => setClubSlug(e.target.value)}
                  className="w-full bg-subtle text-text text-small font-mono px-3 py-1.5 border border-line rounded-btn focus:outline-none focus:border-accent"
                  placeholder="apex-robotics"
                />
              </div>

              <div>
                <label className="block text-caption font-semibold text-text mb-1">
                  Mission / Scope Description
                </label>
                <textarea
                  rows={2}
                  value={clubDescription}
                  onChange={(e) => setClubDescription(e.target.value)}
                  className="w-full bg-subtle text-text text-small px-3 py-1.5 border border-line rounded-btn focus:outline-none focus:border-accent"
                  placeholder="Autonomous robotics, ROS systems, and competition hacking."
                />
              </div>

              <div>
                <label className="block text-caption font-semibold text-text mb-1">
                  Lead Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-subtle text-text text-small px-3 py-1.5 border border-line rounded-btn focus:outline-none focus:border-accent"
                  placeholder="lead@robotics.apex.edu"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-btn text-small text-text-2 hover:text-text hover:bg-subtle transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-btn bg-accent text-on-accent hover:bg-accent-hover font-semibold text-small transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Confirm Affiliation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
