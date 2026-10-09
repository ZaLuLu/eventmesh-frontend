import React, { useState } from 'react'
import { Download, Search } from 'lucide-react'
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
          <span className="text-caption font-semibold text-accent block mb-0.5">
            Attendee Registrations
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
          icon={<Download className="h-4 w-4" />}
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attendee or ticket..."
            className="w-full bg-surface text-text text-small pl-9 pr-3 py-1.5 border border-line rounded-btn focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-surface border border-line rounded-panel overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="border-b border-line bg-subtle text-caption font-medium text-text-2 sticky top-0">
              <th className="py-3 px-4 font-semibold">Pass & Attendee</th>
              <th className="py-3 px-4 font-semibold">Event Dossier</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Registration Date</th>
              <th className="py-3 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-small">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-small text-text-3">
                  Loading registration roster...
                </td>
              </tr>
            ) : registrations.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-small text-text-3">
                  No registrations found matching this query.
                </td>
              </tr>
            ) : (
              registrations.map((reg) => (
                <tr key={reg.id} className="h-[52px] hover:bg-subtle/50 transition-colors">
                  <td className="py-2.5 px-4">
                    <p className="font-mono font-semibold text-text text-small">{reg.ticketCode}</p>
                    <p className="font-medium text-text text-small">{reg.userName}</p>
                    <p className="text-caption text-text-3 font-mono">{reg.userEmail}</p>
                    {reg.team && (
                      <span className="text-caption bg-subtle text-text px-1.5 py-0.5 rounded mt-0.5 inline-block">
                        Team: {reg.team.teamName}
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-4">
                    <p className="font-medium text-text line-clamp-1">{reg.eventTitle}</p>
                    <p className="text-caption text-text-3">
                      {reg.organizerName}
                    </p>
                  </td>

                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-block text-caption px-2 py-0.5 rounded-full border capitalize font-medium ${
                        reg.status === 'checked_in'
                          ? 'bg-success/10 text-success border-success/30'
                          : reg.status === 'registered'
                          ? 'bg-accent-soft text-accent border-accent/30'
                          : reg.status === 'waitlisted'
                          ? 'bg-warning/10 text-warning border-warning/30'
                          : 'bg-subtle text-text border-line'
                      }`}
                    >
                      {reg.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-2.5 px-4 text-caption text-text-3 tabular-nums">
                    {formatDate(reg.createdAt)}
                  </td>

                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {reg.status === 'waitlisted' && (
                        <button
                          type="button"
                          onClick={() => handlePromoteWaitlist(reg.id, reg.userName)}
                          className="px-2.5 py-1 bg-success text-on-accent font-semibold rounded-btn text-caption hover:opacity-90"
                        >
                          Promote
                        </button>
                      )}

                      {reg.status === 'registered' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(reg.id, 'checked_in')}
                          className="px-2.5 py-1 bg-accent text-on-accent font-semibold rounded-btn text-caption hover:opacity-90"
                        >
                          Check In
                        </button>
                      )}

                      <select
                        value={reg.status}
                        onChange={(e) => handleStatusChange(reg.id, e.target.value as any)}
                        className="p-1 border border-line bg-surface rounded-btn text-caption text-text focus:outline-none"
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
