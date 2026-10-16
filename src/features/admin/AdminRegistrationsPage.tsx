// Hallmark macrostructure: AdminConsole-Registrations
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <span className="text-caption font-mono uppercase tracking-wider text-accent font-semibold block mb-0.5">
            ATTENDEE ROSTER
          </span>
          <h1 className="text-h2 font-semibold text-text">
            Registration Management
          </h1>
          <p className="text-small text-text-2 mt-0.5">
            Audit attendee quotas, manage entry credentials, promote waitlists, and export CSV rosters.
          </p>
        </div>

        <Button
          surface="admin"
          size="sm"
          icon={<DownloadSimple size={16} weight="bold" />}
          onClick={handleExportCSV}
          disabled={registrations.length === 0}
        >
          Export CSV Roster
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-3 bg-surface border border-line rounded-panel flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-small overflow-x-auto no-scrollbar">
          {(['all', 'registered', 'checked_in', 'waitlisted', 'cancelled'] as (RegistrationStatus | 'all')[]).map(
            (st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-btn font-medium transition-colors capitalize ${
                  statusFilter === st
                    ? 'bg-accent text-on-accent'
                    : 'text-text-2 hover:text-text hover:bg-subtle'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            )
          )}
        </div>

        <div className="relative max-w-xs w-full">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" weight="bold" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attendee or ticket..."
            className="w-full bg-surface text-text text-small pl-9 pr-3 py-1.5 border border-line rounded-btn focus:outline-none focus:border-accent placeholder:text-text-3"
          />
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-surface border border-line rounded-panel overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="border-b border-line bg-subtle text-caption font-medium text-text-2 sticky top-0">
              <th className="py-3 px-4 font-semibold">Pass & Attendee</th>
              <th className="py-3 px-4 font-semibold">Event</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Registered Date</th>
              <th className="py-3 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-small">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-text-3">
                  Loading registration roster...
                </td>
              </tr>
            ) : registrations.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-text-3">
                  No registrations found matching this filter query.
                </td>
              </tr>
            ) : (
              registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-subtle/50 transition-colors">
                  <td className="py-3 px-4 space-y-0.5">
                    <p className="font-mono font-bold text-accent text-xs">{reg.ticketCode}</p>
                    <p className="font-semibold text-text text-small">{reg.userName}</p>
                    <p className="text-caption text-text-3 font-mono">{reg.userEmail}</p>
                    {reg.team && (
                      <span className="text-[10px] bg-subtle text-text-2 border border-line px-1.5 py-0.5 rounded-sm mt-0.5 inline-block font-mono">
                        Team: {reg.team.teamName}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-medium text-text line-clamp-1">{reg.eventTitle}</p>
                    <p className="text-caption text-text-3">
                      {reg.organizerName}
                    </p>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block text-caption px-2 py-0.5 rounded-full border capitalize font-medium ${
                        reg.status === 'checked_in'
                          ? 'bg-success/10 text-success border-success/30'
                          : reg.status === 'registered'
                          ? 'bg-accent/10 text-accent border-accent/30'
                          : reg.status === 'waitlisted'
                          ? 'bg-warning/10 text-warning border-warning/30'
                          : 'bg-subtle text-text-3 border-line'
                      }`}
                    >
                      {reg.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-text-2 font-mono text-caption tabular-nums">
                    {formatDate(reg.createdAt, 'medium')}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {reg.status === 'waitlisted' && (
                        <Button
                          surface="admin"
                          size="dense"
                          variant="secondary"
                          onClick={() => handlePromoteWaitlist(reg.id, reg.userName)}
                        >
                          Promote
                        </Button>
                      )}

                      {reg.status === 'registered' && (
                        <Button
                          surface="admin"
                          size="dense"
                          variant="primary"
                          onClick={() => handleStatusChange(reg.id, 'checked_in')}
                        >
                          Check In
                        </Button>
                      )}

                      <select
                        value={reg.status}
                        onChange={(e) => handleStatusChange(reg.id, e.target.value as any)}
                        className="bg-surface text-text text-caption border border-line rounded-btn px-2 py-1 focus:outline-none focus:border-accent"
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
