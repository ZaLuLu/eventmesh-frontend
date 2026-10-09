import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'

export const AdminAuditPage: React.FC = () => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => api.audit.getAuditLogs({ orgId: 'org-1' }),
  })

  return (
    <div className="space-y-4">
      <div className="pb-4 border-b border-line">
        <span className="text-caption font-semibold text-accent block mb-0.5">
          Cryptographic Integrity & Accountability
        </span>
        <h1 className="text-h2 font-semibold text-text">
          Audit Trail Log
        </h1>
        <p className="text-small text-text-2 mt-0.5">
          Immutable chronologically ordered log of all administrative actions, publishes, and role assignments.
        </p>
      </div>

      <div className="bg-surface border border-line rounded-panel overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-line bg-subtle text-caption font-medium text-text-2 sticky top-0">
              <th className="py-3 px-4 font-semibold">Timestamp</th>
              <th className="py-3 px-4 font-semibold">Actor</th>
              <th className="py-3 px-4 font-semibold">Action</th>
              <th className="py-3 px-4 font-semibold">Entity & Target ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-small">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-small text-text-3">
                  Reading audit ledger...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-small text-text-3">
                  No recorded actions found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="h-[52px] hover:bg-subtle/50 transition-colors">
                  <td className="py-2.5 px-4 text-caption text-text-3 tabular-nums font-mono">
                    {new Date(log.at).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4">
                    <p className="font-medium text-text text-small">{log.actorName}</p>
                    <p className="text-caption text-text-3 capitalize">{log.actorRole.replace('_', ' ')}</p>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-caption bg-subtle text-text px-2 py-0.5 rounded-btn font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-caption text-text">
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
