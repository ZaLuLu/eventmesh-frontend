import React from 'react'
import { History, ShieldAlert } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { formatDate } from '@/lib/dates'

export const AdminAuditPage: React.FC = () => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => api.audit.getAuditLogs({ orgId: 'org-1' }),
  })

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-[#C9D0D4]">
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-60 block mb-1">
          Cryptographic Integrity & Accountability
        </span>
        <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink">
          Audit Trail Log
        </h1>
        <p className="font-body text-xs text-ink-60 mt-0.5">
          Immutable chronologically ordered log of all administrative actions, publishes, and role assignments.
        </p>
      </div>

      <div className="bg-paper border border-[#C9D0D4] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[#C9D0D4] bg-[#E6EAEC]/60 font-mono text-[10px] uppercase text-ink-60 tracking-wider">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Entity & Target ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D4] font-body text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center font-mono text-ink-60 uppercase">
                  Reading audit ledger...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center font-mono text-ink-60 uppercase">
                  No recorded actions found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-black/5 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-ink-60">
                    {new Date(log.at).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-ink">{log.actorName}</p>
                    <p className="font-mono text-[10px] text-ink-60 uppercase">{log.actorRole}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] bg-[#E6EAEC] text-ink px-2 py-0.5 font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-ink">
                    {log.entity} · {log.entityId}
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
