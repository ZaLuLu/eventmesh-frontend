import React, { useState } from 'react'
import { Download, Search, CheckCircle, ArrowUpRight, UserCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { useRegistrations, useUpdateRegistrationStatus } from '@/hooks/useRegistrations'
import { Button } from '@/design-system/primitives/Button'
import { exportToCSV } from '@/lib/exportCsv'
import { formatDate } from '@/lib/dates'
import { useToast } from '@/design-system/primitives/Toast'
import { RegistrationStatus } from '@/api'

export const AdminRegistrationsPage: React.FC = () => {
  const { session } = useAuth()
  const { clubId } = usePermission()
  const { toast } = useToast()

  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const { data: registrations = [], isLoading, refetch } = useRegistrations({
    clubId: clubId || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: search || undefined,
  })

  const updateStatusMutation = useUpdateRegistrationStatus()

  const handleStatusChange = async (id: string, status: RegistrationStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status })
      toast({
        title: 'Status Updated',
        message: `Registration marked as ${status.replace('_', ' ')}.`,
        type: 'success',
      })
    } catch {
      toast({ title: 'Update failed', type: 'error' })
    }
  }

  const handlePromoteWaitlist = async (id: string, name: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: 'registered' })
      toast({
        title: 'Waitlist Promoted',
        message: `${name} has been promoted to confirmed registered status!`,
        type: 'success',
      })
    } catch {
      toast({ title: 'Promotion failed', type: 'error' })
    }
  }

  const handleExportCSV = () => {
    exportToCSV(
      `registrations-${new Date().toISOString().split('T')[0]}`,
      registrations as any,
      [
        { key: 'ticketCode', label: 'Ticket Code' },
        { key: 'userName', label: 'Attendee Name' },
        { key: 'userEmail', label: 'Email' },
        { key: 'eventTitle', label: 'Event' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Registered At' },
      ]
    )
    toast({ title: 'CSV Export Initiated', type: 'info' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#C9D0D4]">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-60 block mb-1">
            Attendee Registrations
          </span>
          <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink">
            Registration Management
          </h1>
          <p className="font-body text-xs text-ink-60 mt-0.5">
            Audit attendee quotas, manage entry credentials, promote waitlists, and export CSV rosters.
          </p>
        </div>

        <Button
          surface="admin"
          size="sm"
          icon={<Download className="h-4 w-4" />}
          onClick={handleExportCSV}
          disabled={registrations.length === 0}
        >
          Export CSV Roster
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 bg-paper border border-[#C9D0D4] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-mono text-xs uppercase overflow-x-auto no-scrollbar">
          {(['all', 'registered', 'checked_in', 'waitlisted', 'cancelled'] as (RegistrationStatus | 'all')[]).map(
            (st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 transition-colors ${
                  statusFilter === st
                    ? 'bg-admin-accent text-white font-bold'
                    : 'text-ink-60 hover:text-ink hover:bg-black/5'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            )
          )}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attendee or ticket..."
            className="w-full bg-paper text-ink font-body text-xs pl-9 pr-3 py-1.5 border border-[#C9D0D4] focus:outline-none focus:border-admin-accent"
          />
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-paper border border-[#C9D0D4] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="border-b border-[#C9D0D4] bg-[#E6EAEC]/60 font-mono text-[10px] uppercase text-ink-60 tracking-wider">
              <th className="py-3 px-4">Pass & Attendee</th>
              <th className="py-3 px-4">Event Dossier</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Registration Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D4] font-body text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center font-mono text-ink-60 uppercase">
                  Loading registration roster...
                </td>
              </tr>
            ) : registrations.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center font-mono text-ink-60 uppercase">
                  No registrations found matching this query.
                </td>
              </tr>
            ) : (
              registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-black/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-mono font-bold text-ink text-[11px]">{reg.ticketCode}</p>
                    <p className="font-semibold text-ink text-sm mt-0.5">{reg.userName}</p>
                    <p className="font-mono text-ink-60 text-[10px]">{reg.userEmail}</p>
                    {reg.team && (
                      <span className="font-mono text-[9px] bg-[#E6EAEC] text-ink px-1.5 py-0.5 mt-1 inline-block">
                        Team: {reg.team.teamName}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-display text-sm uppercase text-ink">{reg.eventTitle}</p>
                    <p className="font-mono text-[10px] text-ink-60 uppercase">
                      {reg.organizerName}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block font-mono text-[10px] uppercase px-2 py-0.5 border ${
                        reg.status === 'checked_in'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                          : reg.status === 'registered'
                          ? 'bg-blue-100 text-blue-900 border-blue-300'
                          : reg.status === 'waitlisted'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-[#E6EAEC] text-ink border-[#C9D0D4]'
                      }`}
                    >
                      {reg.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-ink-60">
                    {formatDate(reg.createdAt)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2 font-mono text-[10px] uppercase">
                      {reg.status === 'waitlisted' && (
                        <button
                          type="button"
                          onClick={() => handlePromoteWaitlist(reg.id, reg.userName)}
                          className="px-2 py-1 bg-emerald-700 text-white font-bold hover:bg-emerald-800"
                        >
                          Promote
                        </button>
                      )}

                      {reg.status === 'registered' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(reg.id, 'checked_in')}
                          className="px-2 py-1 bg-admin-accent text-white font-semibold"
                        >
                          Check In
                        </button>
                      )}

                      <select
                        value={reg.status}
                        onChange={(e) => handleStatusChange(reg.id, e.target.value as any)}
                        className="p-1 border border-[#C9D0D4] bg-paper text-[10px] font-mono focus:outline-none"
                      >
                        <option value="registered">Registered</option>
                        <option value="checked_in">Checked In</option>
                        <option value="waitlisted">Waitlisted</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
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
