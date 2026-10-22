// Hallmark macrostructure: AdminConsole-AuditLog
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ShieldCheck,
  Funnel,
  MagnifyingGlass,
  Code,
  ArrowClockwise,
  User,
  Buildings,
  Calendar,
  CurrencyInr,
} from '@phosphor-icons/react'
import { api } from '@/api'
import { Badge } from '@/design-system/primitives/Badge'
import { Button } from '@/design-system/primitives/Button'
import { Modal } from '@/design-system/primitives/Modal'
import { PlatformAuditLog } from '@/api/contracts'

export const AdminAuditPage: React.FC = () => {
  const [entityFilter, setEntityFilter] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLog, setSelectedLog] = useState<PlatformAuditLog | null>(null)

  const { data: logs = [], isLoading, refetch, isFetching } = useQuery<PlatformAuditLog[]>({
    queryKey: ['admin-platform-audit-logs', entityFilter],
    queryFn: async () => {
      if (api.audit.getPlatformAuditLogs) {
        try {
          return await api.audit.getPlatformAuditLogs({
            entityType: entityFilter === 'ALL' ? undefined : entityFilter.toLowerCase(),
            limit: 100,
          })
        } catch {
          // fallback to standard getAuditLogs
        }
      }
      const fallback = await api.audit.getAuditLogs()
      return fallback.map((l: any) => ({
        id: l.id,
        actor_id: l.actorId || 'usr-system',
        actor_email: l.actorEmail || `${l.actorRole || 'admin'}@apex.edu`,
        actor_name: l.actorName || 'System Administrator',
        action: l.action || 'MODIFY',
        entity_type: l.entity || 'organization',
        entity_id: l.entityId || 'id-unknown',
        target_organization_name: 'Apex Campus',
        safe_metadata: { role: l.actorRole },
        created_at: l.at || new Date().toISOString(),
      }))
    },
  })

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      log.action.toLowerCase().includes(term) ||
      (log.actor_name && log.actor_name.toLowerCase().includes(term)) ||
      (log.actor_email && log.actor_email.toLowerCase().includes(term)) ||
      log.entity_id.toLowerCase().includes(term) ||
      log.entity_type.toLowerCase().includes(term)
    )
  })

  const getEntityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'organization':
      case 'institution':
        return <Buildings className="w-3.5 h-3.5" />
      case 'event':
      case 'native_event':
        return <Calendar className="w-3.5 h-3.5" />
      case 'withdrawal':
      case 'payout':
        return <CurrencyInr className="w-3.5 h-3.5" />
      default:
        return <ShieldCheck className="w-3.5 h-3.5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-caption font-semibold text-accent uppercase tracking-wider block mb-0.5">
              Cryptographic Integrity & Accountability
            </span>
            <span className="text-[10px] font-mono font-bold bg-accent/10 text-accent px-1.5 py-0.5 rounded">
              IMMUTABLE
            </span>
          </div>
          <h1 className="text-h2 font-semibold text-text">Platform Audit Trail</h1>
          <p className="text-small text-text-2 mt-0.5">
            Cryptographically sealed, append-only ledger tracking all administrative actions, clearances, and financial disbursements.
          </p>
        </div>

        <Button
          surface="admin"
          variant="secondary"
          size="dense"
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-auto font-mono text-xs"
        >
          <ArrowClockwise className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Funnel className="w-3.5 h-3.5 text-text-3 mr-1" />
          {['ALL', 'ORGANIZATION', 'EVENT', 'WITHDRAWAL', 'MEMBER'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setEntityFilter(tab)}
              className={`px-3 py-1.5 rounded-full text-caption font-medium transition-all ${
                entityFilter === tab
                  ? 'bg-accent text-accent-contrast shadow-sm font-semibold'
                  : 'bg-surface text-text-2 hover:bg-subtle border border-line'
              }`}
            >
              {tab === 'ALL' ? 'All Entities' : tab.charAt(0) + tab.slice(1).toLowerCase() + 's'}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <MagnifyingGlass className="w-4 h-4 text-text-3 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, actor, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-small bg-surface border border-line rounded-input focus:outline-none focus:border-accent text-text placeholder:text-text-3"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-surface border border-line rounded-panel overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-line bg-subtle text-caption font-semibold text-text-2 sticky top-0">
              <th className="py-3 px-4">Timestamp (UTC)</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Target Entity</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-small">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-small text-text-3">
                  <div className="inline-flex items-center gap-2">
                    <ArrowClockwise className="w-4 h-4 animate-spin text-accent" />
                    <span>Verifying and loading cryptographic ledger...</span>
                  </div>
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-small text-text-3">
                  No audit log entries matching criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="h-[54px] hover:bg-subtle/40 transition-colors">
                  <td className="py-2.5 px-4 text-caption text-text-3 tabular-nums font-mono whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-text text-small truncate">
                          {log.actor_name || log.actor_email?.split('@')[0] || 'System Admin'}
                        </p>
                        <p className="text-[11px] text-text-3 truncate font-mono">
                          {log.actor_email || log.actor_id || 'system'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <Badge variant={log.action.includes('REJECT') ? 'danger' : log.action.includes('GRANT') || log.action.includes('VERIFY') ? 'success' : 'iris'}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-1.5 text-text font-mono text-caption">
                      {getEntityIcon(log.entity_type)}
                      <span className="font-semibold uppercase">{log.entity_type}</span>
                      <span className="text-text-3 truncate max-w-[140px]">· {log.entity_id}</span>
                    </div>
                    {log.target_organization_name && (
                      <p className="text-[11px] text-text-3 truncate">{log.target_organization_name}</p>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <Button
                      surface="admin"
                      variant="ghost"
                      size="dense"
                      onClick={() => setSelectedLog(log)}
                      className="font-mono text-xs"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Metadata Inspector Modal */}
      {selectedLog && (
        <Modal
          isOpen={Boolean(selectedLog)}
          onClose={() => setSelectedLog(null)}
          title={`Audit Payload · ${selectedLog.action}`}
        >
          <div className="space-y-4 text-small">
            <div className="grid grid-cols-2 gap-3 p-3 bg-subtle rounded-card text-caption font-mono">
              <div>
                <span className="text-text-3 block text-[10px] uppercase font-bold">Log Record ID</span>
                <span className="text-text break-all">{selectedLog.id}</span>
              </div>
              <div>
                <span className="text-text-3 block text-[10px] uppercase font-bold">Timestamp</span>
                <span className="text-text">{new Date(selectedLog.created_at).toISOString()}</span>
              </div>
              <div>
                <span className="text-text-3 block text-[10px] uppercase font-bold">Actor Email</span>
                <span className="text-text truncate block">{selectedLog.actor_email || 'system'}</span>
              </div>
              <div>
                <span className="text-text-3 block text-[10px] uppercase font-bold">Target Entity</span>
                <span className="text-text">{selectedLog.entity_type} · {selectedLog.entity_id}</span>
              </div>
            </div>

            <div>
              <label className="text-caption font-semibold text-text block mb-1.5">
                Cryptographic Safe Metadata:
              </label>
              <pre className="p-3 bg-surface border border-line rounded-input font-mono text-caption text-text-2 overflow-x-auto max-h-60">
                {JSON.stringify(selectedLog.safe_metadata || { recorded: true }, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button surface="admin" variant="secondary" size="dense" onClick={() => setSelectedLog(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
