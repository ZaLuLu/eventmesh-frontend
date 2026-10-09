import React from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { useClubs } from '@/hooks/useClubs'

export const AdminClubsListPage: React.FC = () => {
  const { data: clubs = [], isLoading } = useClubs()

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
            Overview of all 9 affiliated engineering clubs and their leadership.
          </p>
        </div>
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
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
