import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, ExternalLink } from 'lucide-react'
import { useClubs } from '@/hooks/useClubs'
import { Button } from '@/design-system/primitives/Button'

export const AdminClubsListPage: React.FC = () => {
  const { data: clubs = [], isLoading } = useClubs()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#C9D0D4]">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-60 block mb-1">
            Federation Governance
          </span>
          <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink">
            Member Collectives
          </h1>
          <p className="font-body text-xs text-ink-60 mt-0.5">
            Overview of all 9 affiliated engineering clubs and their leadership.
          </p>
        </div>
      </div>

      <div className="bg-paper border border-[#C9D0D4] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[#C9D0D4] bg-[#E6EAEC]/60 font-mono text-[10px] uppercase text-ink-60 tracking-wider">
              <th className="py-3 px-4">Club / Identifier</th>
              <th className="py-3 px-4">Signature Token</th>
              <th className="py-3 px-4">Followers</th>
              <th className="py-3 px-4">Coordinators</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D4] font-body text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center font-mono text-ink-60 uppercase">
                  Loading collectives...
                </td>
              </tr>
            ) : (
              clubs.map((c) => (
                <tr key={c.id} className="hover:bg-black/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-display text-base uppercase text-ink">{c.name}</p>
                    <p className="font-mono text-[10px] text-ink-60 uppercase">{c.slug}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 inline-block" style={{ backgroundColor: c.color }} />
                      <span>{c.color}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-ink">
                    {c.followersCount}
                  </td>
                  <td className="py-3.5 px-4 font-body text-xs text-ink-60">
                    {c.coordinators.map((lead) => lead.name).join(', ') || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-xs">
                    <Link
                      to={`/clubs/${c.slug}`}
                      target="_blank"
                      className="px-2 py-1 border border-[#C9D0D4] hover:bg-black/5 inline-flex items-center gap-1 uppercase"
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
