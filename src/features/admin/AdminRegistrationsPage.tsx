import React, { useState } from 'react'
import { DownloadSimple, MagnifyingGlass, UserCheck, ArrowUpRight } from '@phosphor-icons/react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { useRegistrations, useUpdateRegistrationStatus } from '@/hooks/useRegistrations'
import { Button } from '@/design-system/primitives/Button'
import { Sticker } from '@/design-system/primitives/Sticker'
import { exportToCSV } from '@/lib/exportCsv'
import { formatDate } from '@/lib/format'
import { useToast } from '@/design-system/primitives/Toast'
import { RegistrationStatus } from '@/api'

export const AdminRegistrationsPage: React.FC = () => {
  const { session } = useAuth()
  const { clubId } = usePermission()
  const { toast } = useToast()

  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const { data: registrations = [], isLoading } = useRegistrations({
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D4F25A] block mb-1">
            ATTENDEE ROSTER
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Registration Management
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-0.5">
            Audit attendee quotas, manage entry credentials, promote waitlists, and export CSV rosters.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={registrations.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-[#D4F25A] hover:bg-[#c2e245] text-[#0F0D1F] text-xs font-bold transition-all disabled:opacity-40"
        >
          <DownloadSimple className="w-4 h-4" weight="bold" />
          <span>Export CSV Roster</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-3 bg-[#181530] border border-white/10 rounded-[16px] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto scrollbar-none">
          {(['all', 'registered', 'checked_in', 'waitlisted', 'cancelled'] as (RegistrationStatus | 'all')[]).map(
            (st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-[8px] font-bold text-xs transition-colors capitalize ${
                  statusFilter === st
                    ? 'bg-[#D4F25A] text-[#0F0D1F]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            )
          )}
        </div>

        <div className="relative max-w-xs w-full">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" weight="bold" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attendee or ticket..."
            className="w-full bg-[#120F24] text-white text-xs pl-9 pr-3 py-2 border border-white/20 rounded-[10px] focus:outline-none focus:border-[#D4F25A] placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-[#181530] border border-white/10 rounded-[16px] overflow-x-auto shadow-[4px_4px_0_#000]">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="border-b border-white/10 bg-[#120F24] text-[11px] font-mono font-bold text-white/50 uppercase tracking-wider sticky top-0">
              <th className="py-3 px-4">Pass & Attendee</th>
              <th className="py-3 px-4">Event</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Registered Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-white/40">
                  Loading registration roster...
                </td>
              </tr>
            ) : registrations.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-white/40">
                  No registrations found matching this filter query.
                </td>
              </tr>
            ) : (
              registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 space-y-0.5">
                    <p className="font-mono font-extrabold text-[#D4F25A] text-xs">{reg.ticketCode}</p>
                    <p className="font-bold text-white text-xs">{reg.userName}</p>
                    <p className="text-[11px] text-white/50 font-mono">{reg.userEmail}</p>
                    {reg.team && (
                      <span className="text-[10px] bg-white/10 text-white/80 px-1.5 py-0.5 rounded mt-0.5 inline-block font-mono">
                        Team: {reg.team.teamName}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-bold text-white line-clamp-1">{reg.eventTitle}</p>
                    <p className="text-[11px] text-white/50">
                      {reg.organizerName}
                    </p>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full border capitalize font-bold ${
                        reg.status === 'checked_in'
                          ? 'bg-[#7FD8B8]/15 text-[#7FD8B8] border-[#7FD8B8]/30'
                          : reg.status === 'registered'
                          ? 'bg-[#8EC5FF]/15 text-[#8EC5FF] border-[#8EC5FF]/30'
                          : reg.status === 'waitlisted'
                          ? 'bg-[#F2B84B]/15 text-[#F2B84B] border-[#F2B84B]/30'
                          : 'bg-white/5 text-white/60 border-white/10'
                      }`}
                    >
                      {reg.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-white/50 font-mono text-[11px] tabular-nums">
                    {formatDate(reg.createdAt, 'medium')}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {reg.status === 'waitlisted' && (
                        <button
                          type="button"
                          onClick={() => handlePromoteWaitlist(reg.id, reg.userName)}
                          className="px-2.5 py-1 bg-[#7FD8B8] text-[#0F0D1F] font-extrabold rounded-[6px] text-[11px] hover:opacity-90"
                        >
                          Promote
                        </button>
                      )}

                      {reg.status === 'registered' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(reg.id, 'checked_in')}
                          className="px-2.5 py-1 bg-[#D4F25A] text-[#0F0D1F] font-extrabold rounded-[6px] text-[11px] hover:opacity-90"
                        >
                          Check In
                        </button>
                      )}

                      <select
                        value={reg.status}
                        onChange={(e) => handleStatusChange(reg.id, e.target.value as any)}
                        className="p-1 border border-white/20 bg-[#120F24] rounded-[6px] text-[11px] font-bold text-white focus:outline-none"
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
